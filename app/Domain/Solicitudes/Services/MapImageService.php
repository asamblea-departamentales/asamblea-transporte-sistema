<?php

namespace App\Domain\Solicitudes\Services;

use Illuminate\Support\Facades\Http;

/**
 * Servicio para generar imágenes de mapas estáticos de rutas de solicitudes
 * de transporte, utilizando la API de Geoapify.
 *
 * Incluye geocodificación de direcciones a coordenadas (con respaldo fake
 * cuando no hay API key o falla la consulta) y validación de que las
 * coordenadas estén dentro de los límites de El Salvador.
 */
class MapImageService
{
    /**
     * Límites geográficos aproximados de El Salvador para validar coordenadas.
     */
    protected float $minLat = 13.15;

    protected float $maxLat = 14.44;

    protected float $minLng = -90.15;

    protected float $maxLng = -87.65;

    /**
     * Genera coordenadas "fake" pseudo-aleatorias dentro de El Salvador
     * basadas en un hash del texto de entrada. Esto asegura que la misma
     * dirección siempre genere las mismas coordenadas.
     *
     * @param  string  $text  Texto a geocodificar (dirección, lugar, etc.)
     * @return array [latitud, longitud]
     */
    protected function fakeGeocode(string $text): array
    {
        $text = trim(mb_strtolower($text));
        if ($text === '') {
            $text = 'default';
        }

        $hash = crc32($text);

        $r1 = ($hash & 0xFFFF) / 0xFFFF;
        $r2 = (($hash >> 16) & 0xFFFF) / 0xFFFF;

        $lat = $this->minLat + $r1 * ($this->maxLat - $this->minLat);
        $lng = $this->minLng + $r2 * ($this->maxLng - $this->minLng);

        return [$lat, $lng];
    }

    /**
     * Verifica si unas coordenadas se encuentran dentro de los límites
     * aproximados de El Salvador.
     *
     * @param  float  $lat  Latitud
     * @param  float  $lng  Longitud
     * @return bool True si está dentro del polígono delimitador
     */
    public function isInsideElSalvador(float $lat, float $lng): bool
    {
        return $lat >= $this->minLat && $lat <= $this->maxLat
            && $lng >= $this->minLng && $lng <= $this->maxLng;
    }

    /**
     * Intenta geocodificar un texto usando la API de Geoapify.
     * Si no hay API key, la consulta falla o la respuesta está fuera de
     * El Salvador, recurre a fakeGeocode().
     *
     * La búsqueda se limita a El Salvador agregando el sufijo ", El Salvador"
     * y el filtro oficial countrycode:sv de Geoapify.
     *
     * @param  string  $text  Dirección o nombre del lugar a geocodificar
     * @return array [latitud, longitud]
     */
    public function geocodeOrFake(string $text): array
    {
        $text = trim($text);
        if ($text === '') {
            return $this->fakeGeocode('default');
        }

        // Si no hay API key configurada, usa datos fake
        $apiKey = config('services.geoapify.api_key');
        if (empty($apiKey)) {
            return $this->fakeGeocode($text);
        }

        try {
            $response = Http::timeout(6)->get('https://api.geoapify.com/v1/geocode/search', [
                'text' => $text.', El Salvador',
                'limit' => 1,
                'apiKey' => $apiKey,
                'filter' => 'countrycode:sv',
            ]);
        } catch (\Exception $e) {
            // Si hay error de conexión, usa fake
            return $this->fakeGeocode($text);
        }

        if (! $response->successful()) {
            return $this->fakeGeocode($text);
        }

        $data = $response->json();
        $features = $data['features'] ?? [];
        if (empty($features)) {
            return $this->fakeGeocode($text);
        }

        $props = $features[0]['properties'] ?? [];
        if (! isset($props['lat'], $props['lon'])) {
            return $this->fakeGeocode($text);
        }

        $lat = (float) $props['lat'];
        $lng = (float) $props['lon'];
        $countryCode = strtolower((string) ($props['country_code'] ?? ''));

        // Valida que el resultado esté dentro de El Salvador
        if (($countryCode && $countryCode !== 'sv') || ! $this->isInsideElSalvador($lat, $lng)) {
            return $this->fakeGeocode($text);
        }

        return [$lat, $lng];
    }

    /**
     * Genera la URL de un mapa estático con la ruta entre todos los puntos
     * (origen, destino_adicional, destinos_adicionales[], destino).
     *
     * Utiliza la API Static Map de Geoapify. Si no hay API key configurada
     * devuelve null. Las coordenadas se obtienen de geocodeOrFake() si no
     * vienen pre-cargadas en la solicitud.
     *
     * El zoom se calcula automáticamente según la extensión geográfica de los waypoints.
     *
     * @param  array  $solicitud  Arreglo con datos de la solicitud
     * @return string|null URL de la imagen del mapa o null si no se pudo generar
     */
    public function generateRouteImageUrl(array $solicitud): ?string
    {
        $apiKey = config('services.geoapify.api_key');
        if (empty($apiKey)) {
            return null;
        }

        $origenTexto = $solicitud['origen'] ?? 'San Salvador';
        $destinoTexto = $solicitud['destino'] ?? 'San Salvador';

        $latOrigen = $solicitud['origen_lat'] ?? null;
        $lngOrigen = $solicitud['origen_lng'] ?? null;
        $latDestino = $solicitud['destino_lat'] ?? null;
        $lngDestino = $solicitud['destino_lng'] ?? null;

        if ($latOrigen === null || $latOrigen === '' || $lngOrigen === null || $lngOrigen === '') {
            [$latOrigen, $lngOrigen] = $this->geocodeOrFake($origenTexto);
        }
        if ($latDestino === null || $latDestino === '' || $lngDestino === null || $lngDestino === '') {
            [$latDestino, $lngDestino] = $this->geocodeOrFake($destinoTexto);
        }

        // Waypoints ordenados: origen -> destino_adicional -> destinos_adicionales -> destino
        $waypoints = [];

        $waypoints[] = ['lat' => $latOrigen, 'lng' => $lngOrigen, 'color' => 'blue', 'size' => 'large'];

        // Si ya vienen destinos_adicionales del modelo, NO procesamos el campo texto
        // destino_adicional para evitar duplicados (el payload ya lo parseó).
        $destinosAdicionales = $solicitud['destinos_adicionales'] ?? [];

        if (empty($destinosAdicionales)) {
            $adicional = $solicitud['destino_adicional'] ?? '';
            if ($adicional !== '') {
                $latAd = $solicitud['destino_adicional_lat'] ?? null;
                $lngAd = $solicitud['destino_adicional_lng'] ?? null;
                if ($latAd === null || $latAd === '' || $lngAd === null || $lngAd === '') {
                    [$latAd, $lngAd] = $this->geocodeOrFake($adicional);
                }
                if ($latAd !== null && $latAd !== '' && $lngAd !== null && $lngAd !== '') {
                    $waypoints[] = ['lat' => $latAd, 'lng' => $lngAd, 'color' => 'green', 'size' => 'medium'];
                }
            }
        }

        foreach ($destinosAdicionales as $d) {
            $lat = $d['lat'] ?? null;
            $lng = $d['lng'] ?? null;
            if ($lat === null || $lng === null) {
                [$lat, $lng] = $this->geocodeOrFake($d['nombre'] ?? '');
            }
            if ($lat !== null && $lng !== null) {
                $esDurante = $d['agregado_durante_viaje'] ?? false;
                $waypoints[] = ['lat' => $lat, 'lng' => $lng, 'color' => $esDurante ? 'orange' : 'green', 'size' => 'medium'];
            }
        }

        $waypoints[] = ['lat' => $latDestino, 'lng' => $lngDestino, 'color' => 'red', 'size' => 'large'];

        if (count($waypoints) < 2) {
            return null;
        }

        // Zoom dinámico según la extensión geográfica
        $allLats = array_column($waypoints, 'lat');
        $allLngs = array_column($waypoints, 'lng');
        $spread = max(abs(max($allLats) - min($allLats)), abs(max($allLngs) - min($allLngs)));

        if ($spread < 0.03) {
            $zoom = 13;
        } elseif ($spread < 0.10) {
            $zoom = 12;
        } elseif ($spread < 0.30) {
            $zoom = 11;
        } else {
            $zoom = 9;
        }

        $params = [
            'style' => 'osm-carto',
            'width' => 600,
            'height' => 350,
            'zoom' => $zoom,
            'apiKey' => $apiKey,
        ];

        $markers = [];
        $pathCoords = [];
        foreach ($waypoints as $wp) {
            $markers[] = sprintf(
                'lonlat:%.6f,%.6f;color:%s;size:%s;icon:circle',
                $wp['lng'], $wp['lat'], $wp['color'], $wp['size']
            );
            $pathCoords[] = sprintf('lonlat:%.6f,%.6f', $wp['lng'], $wp['lat']);
        }

        $params['path'] = sprintf('color:0x0066ccdd;width:4|%s', implode('|', $pathCoords));

        $query = http_build_query($params);
        foreach ($markers as $m) {
            $query .= '&marker='.$m;
        }

        return 'https://maps.geoapify.com/v1/staticmap?'.$query;
    }
}
