<?php

namespace App\Domain\Solicitudes\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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
     * @param  string $text Texto a geocodificar (dirección, lugar, etc.)
     * @return array        [latitud, longitud]
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
     * @param  float $lat Latitud
     * @param  float $lng Longitud
     * @return bool       True si está dentro del polígono delimitador
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
     * y el parámetro countrycode=sv.
     *
     * @param  string $text Dirección o nombre del lugar a geocodificar
     * @return array        [latitud, longitud]
     */
    protected function geocodeOrFake(string $text): array
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
                'text'   => $text . ', El Salvador',
                'limit'  => 1,
                'apiKey' => $apiKey,
                'countrycode' => 'sv',  // Filtra resultados solo de El Salvador
            ]);
        } catch (\Exception $e) {
            // Si hay error de conexión, usa fake
            return $this->fakeGeocode($text);
        }

        if (!$response->successful()) {
            return $this->fakeGeocode($text);
        }

        $data = $response->json();
        $features = $data['features'] ?? [];
        if (empty($features)) {
            return $this->fakeGeocode($text);
        }

        $props = $features[0]['properties'] ?? [];
        if (!isset($props['lat'], $props['lon'])) {
            return $this->fakeGeocode($text);
        }

        $lat = (float) $props['lat'];
        $lng = (float) $props['lon'];

        // Valida que el resultado esté dentro de El Salvador
        if (!$this->isInsideElSalvador($lat, $lng)) {
            return $this->fakeGeocode($text);
        }

        return [$lat, $lng];
    }

    /**
     * Genera la URL de una imagen de mapa estático con la ruta entre origen y destino.
     *
     * Utiliza la API Static Map de Geoapify. Si no hay API key configurada
     * devuelve null. Las coordenadas se obtienen de geocodeOrFake() si no
     * vienen pre-cargadas en la solicitud.
     *
     * El zoom se calcula automáticamente según la distancia entre los puntos.
     *
     * @param  array       $solicitud Arreglo con datos de la solicitud
     *                                (origen, destino, coordenadas)
     * @return string|null            URL de la imagen del mapa o null si no se pudo generar
     */
    public function generateRouteImageUrl(array $solicitud): ?string
    {
        $origenTexto  = $solicitud['origen']  ?? 'San Salvador';
        $destinoTexto = $solicitud['destino'] ?? 'San Salvador';

        // Coordenadas pre-cargadas en la solicitud, o null si no existen
        $latOrigen  = $solicitud['origen_lat']  ?? null;
        $lngOrigen  = $solicitud['origen_lng']  ?? null;
        $latDestino = $solicitud['destino_lat'] ?? null;
        $lngDestino = $solicitud['destino_lng'] ?? null;

        // Si faltan coordenadas, se geocodifican
        if (empty($latOrigen) || empty($lngOrigen)) {
            [$latOrigen, $lngOrigen] = $this->geocodeOrFake($origenTexto);
        }

        if (empty($latDestino) || empty($lngDestino)) {
            [$latDestino, $lngDestino] = $this->geocodeOrFake($destinoTexto);
        }

        if (empty($latOrigen) || empty($lngOrigen) || empty($latDestino) || empty($lngDestino)) {
            return null;
        }

        // Calcula el nivel de zoom según la distancia entre los puntos
        $distLat = abs($latOrigen - $latDestino);
        $distLng = abs($lngOrigen - $lngDestino);
        $spread  = max($distLat, $distLng);

        if ($spread < 0.03) {
            $zoom = 13;
        } elseif ($spread < 0.10) {
            $zoom = 12;
        } elseif ($spread < 0.30) {
            $zoom = 11;
        } else {
            $zoom = 9;
        }

        $apiKey = config('services.geoapify.api_key');
        if (empty($apiKey)) {
            return null;
        }

        $baseUrl = 'https://maps.geoapify.com/v1/staticmap';

        $params = [
            'style'  => 'osm-carto',
            'width'  => 600,
            'height' => 350,
            'zoom'   => $zoom,
            'apiKey' => $apiKey,
        ];

        // Marcadores: azul para origen, rojo para destino
        $markers = [];

        $markers[] = sprintf(
            'lonlat:%.6f,%.6f;color:%s;size:large;icon:circle',
            $lngOrigen,
            $latOrigen,
            'blue'
        );

        $markers[] = sprintf(
            'lonlat:%.6f,%.6f;color:%s;size:large;icon:circle',
            $lngDestino,
            $latDestino,
            'red'
        );

        $params['marker'] = $markers;

        // Ruta entre origen y destino
        $pathCoords = [
            sprintf('lonlat:%.6f,%.6f', $lngOrigen,  $latOrigen),
            sprintf('lonlat:%.6f,%.6f', $lngDestino, $latDestino),
        ];

        $params['path'] = sprintf(
            'color:0x0066ccdd;width:4|%s',
            implode('|', $pathCoords)
        );

        return $baseUrl . '?' . http_build_query($params);
    }

}
