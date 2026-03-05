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

    /**
     * Genera coordenadas “dummy” pero determinísticas a partir de un string.
     */
    protected function fakeGeocode(string $text): array
    {
        $text = trim(mb_strtolower($text));
        if ($text === '') {
            $text = 'default';
        }

        $hash = crc32($text);

        // Dos números entre 0 y 1
        $r1 = ($hash & 0xFFFF) / 0xFFFF;
        $r2 = (($hash >> 16) & 0xFFFF) / 0xFFFF;

        // Mapear al bounding box
        $lat = $this->minLat + $r1 * ($this->maxLat - $this->minLat);
        $lng = $this->minLng + $r2 * ($this->maxLng - $this->minLng);

        return [$lat, $lng];
    }

    protected function geocodeOrFake(string $text): array
        {
            $text = trim($text);
            if ($text === '') {
                return $this->fakeGeocode('default');
            }

            $apiKey = config('services.geoapify.api_key');
            if (empty($apiKey)) {
                return $this->fakeGeocode($text);
            }

            try {
                $response = Http::timeout(6)->get('https://api.geoapify.com/v1/geocode/search', [
                    'text'   => $text . ', El Salvador',
                    'limit'  => 1,
                    'apiKey' => $apiKey,
                ]);
            } catch (\Exception $e) {
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

            return [(float) $props['lat'], (float) $props['lon']];
        }

    public function generateRouteImageUrl(array $solicitud): ?string
    {
        $origenTexto  = $solicitud['origen']  ?? 'San Salvador';
        $destinoTexto = $solicitud['destino'] ?? 'San Salvador';

        $latOrigen  = $solicitud['origen_lat']  ?? null;
        $lngOrigen  = $solicitud['origen_lng']  ?? null;
        $latDestino = $solicitud['destino_lat'] ?? null;
        $lngDestino = $solicitud['destino_lng'] ?? null;

        if (empty($latOrigen) || empty($lngOrigen)) {
            [$latOrigen, $lngOrigen] = $this->geocodeOrFake($origenTexto);
        }

        if (empty($latDestino) || empty($lngDestino)) {
            [$latDestino, $lngDestino] = $this->geocodeOrFake($destinoTexto);
        }

        if (empty($latOrigen) || empty($lngOrigen) || empty($latDestino) || empty($lngDestino)) {
            return null;
        }

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
            'style'  => 'osm-bright',
            'width'  => 600,
            'height' => 350,
            'center' => sprintf('lonlat:%.6f,%.6f', $lngDestino, $latDestino),
            'zoom'   => $zoom,
            'apiKey' => $apiKey,
        ];

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

        // puntos extra de contexto “dummy” alrededor de la ruta
        $markers[] = sprintf(
            'lonlat:%.6f,%.6f;color:%s;size:small;icon:marker',
            $lngOrigen + 0.05,
            $latOrigen + 0.02,
            'gray'
        );
        $markers[] = sprintf(
            'lonlat:%.6f,%.6f;color:%s;size:small;icon:marker',
            $lngDestino - 0.05,
            $latDestino - 0.02,
            'gray'
        );

        $params['marker'] = $markers;

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