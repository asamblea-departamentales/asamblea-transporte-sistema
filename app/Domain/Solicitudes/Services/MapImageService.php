<?php

namespace App\Domain\Solicitudes\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MapImageService
{
    // Bounding box aproximado de El Salvador
    protected float $minLat = 13.15;
    protected float $maxLat = 14.44;
    protected float $minLng = -90.15;
    protected float $maxLng = -87.65;

    public function generateRouteImageUrl(array $solicitud): ?string
    {
        $origenTexto  = $solicitud['origen']  ?? 'San Salvador';
        $destinoTexto = $solicitud['destino'] ?? 'San Salvador';

        $latOrigen  = $solicitud['origen_lat']  ?? null;
        $lngOrigen  = $solicitud['origen_lng']  ?? null;
        $latDestino = $solicitud['destino_lat'] ?? null;
        $lngDestino = $solicitud['destino_lng'] ?? null;

        // Si no hay coordenadas, intentamos geocodificar por texto
        if (empty($latOrigen) || empty($lngOrigen)) {
            [$latOrigen, $lngOrigen] = $this->geocodeOrFake($origenTexto);
        }

        if (empty($latDestino) || empty($lngDestino)) {
            [$latDestino, $lngDestino] = $this->geocodeOrFake($destinoTexto);
        }

        $apiKey = config('services.geoapify.api_key');
        if (empty($apiKey) || !$latOrigen || !$lngOrigen || !$latDestino || !$lngDestino) {
            return null;
        }

        $baseUrl = 'https://maps.geoapify.com/v1/staticmap';

        // 1. Definimos los Marcadores con 'icon:marker' para precisión milimétrica
        // El formato es lonlat:lng,lat;color:HEX;size:large;icon:marker
        $markers = [];
        $markers[] = sprintf('lonlat:%.6f,%.6f;color:%%231e3a8a;size:large;icon:marker', $lngOrigen, $latOrigen);
        $markers[] = sprintf('lonlat:%.6f,%.6f;color:%%23ef4444;size:large;icon:marker', $lngDestino, $latDestino);

        // 2. Definimos la Línea de la Ruta
        $path = sprintf(
            'color:%%230066ccdd;width:4|lonlat:%.6f,%.6f|lonlat:%.6f,%.6f',
            $lngOrigen, $latOrigen,
            $lngDestino, $latDestino
        );

        // 3. Calculamos el Área (Bounding Box) con un pequeño margen (0.005 grados)
        // Esto reemplaza al 'center' y 'zoom' manual para que el mapa siempre encuadre bien
        $margin = 0.005;
        $area = sprintf(
            'rect:%.6f,%.6f,%.6f,%.6f',
            min($lngOrigen, $lngDestino) - $margin,
            min($latOrigen, $latDestino) - $margin,
            max($lngOrigen, $lngDestino) + $margin,
            max($latOrigen, $latDestino) + $margin
        );

        $params = [
            'style'   => 'osm-carto', // Estilo con mejor detalle de calles
            'width'   => 600,
            'height'  => 350,
            'marker'  => implode('|', $markers),
            'path'    => $path,
            'area'    => $area,
            'apiKey'  => $apiKey,
        ];

        // Construimos la URL manualmente para evitar que http_build_query 
        // codifique doblemente los caracteres especiales de los markers de Geoapify
        return $baseUrl . '?' . http_build_query($params);
    }

    protected function geocodeOrFake(string $text): array
    {
        $text = trim($text);
        $apiKey = config('services.geoapify.api_key');

        if (empty($text) || empty($apiKey)) {
            return $this->fakeGeocode($text ?: 'default');
        }

        try {
            $response = Http::timeout(6)->get('https://api.geoapify.com/v1/geocode/search', [
                'text'   => $text . ', El Salvador',
                'limit'  => 1,
                'apiKey' => $apiKey,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $props = $data['features'][0]['properties'] ?? null;
                if ($props && isset($props['lat'], $props['lon'])) {
                    return [(float) $props['lat'], (float) $props['lon']];
                }
            }
        } catch (\Exception $e) {
            Log::error("Error geocodificando: " . $e->getMessage());
        }

        return $this->fakeGeocode($text);
    }

    protected function fakeGeocode(string $text): array
    {
        $hash = crc32($text);
        $r1 = ($hash & 0xFFFF) / 0xFFFF;
        $r2 = (($hash >> 16) & 0xFFFF) / 0xFFFF;

        return [
            $this->minLat + $r1 * ($this->maxLat - $this->minLat),
            $this->minLng + $r2 * ($this->maxLng - $this->minLng)
        ];
    }
}