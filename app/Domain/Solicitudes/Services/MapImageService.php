<?php

namespace App\Services;

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


public function generateRouteImageUrl(array $solicitud): ?string
    {
        $latOrigen  = $solicitud['origen_lat'] ?? null;
        $lngOrigen  = $solicitud['origen_lng'] ?? null;
        $latDestino = $solicitud['destino_lat'] ?? null;
        $lngDestino = $solicitud['destino_lng'] ?? null;
        $latAd      = $solicitud['destino_adicional_lat'] ?? null;
        $lngAd      = $solicitud['destino_adicional_lng'] ?? null;

        if (empty($latOrigen) || empty($lngOrigen)) {
            [$latOrigen, $lngOrigen] = $this->fakeGeocode($solicitud['origen'] ?? 'origen');
        }
        if (empty($latDestino) || empty($lngDestino)) {
            [$latDestino, $lngDestino] = $this->fakeGeocode($solicitud['destino'] ?? 'destino');
        }
        if ((empty($latAd) || empty($lngAd)) && !empty($solicitud['destino_adicional'])) {
            [$latAd, $lngAd] = $this->fakeGeocode($solicitud['destino_adicional']);
        }

        if (empty($latOrigen) || empty($lngOrigen) || empty($latDestino) || empty($lngDestino)) {
            return null;
        }

        $distLat = abs($latOrigen - $latDestino);
        $distLng = abs($lngOrigen - $lngDestino);
        $spread  = max($distLat, $distLng);

        if ($spread < 0.03) {
            $zoom = 14;
        } elseif ($spread < 0.10) {
            $zoom = 12;
        } elseif ($spread < 0.30) {
            $zoom = 11;
        } else {
            $zoom = 10;
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
            'center' => sprintf('lonlat:%.6f,%.6f', $lngOrigen, $latOrigen),
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
        if (!empty($latAd) && !empty($lngAd)) {
            $markers[] = sprintf(
                'lonlat:%.6f,%.6f;color:%s;size:large;icon:circle',
                $lngAd,
                $latAd,
                'green'
            );
        }
        if (!empty($markers)) {
            $params['marker'] = $markers;
        }

        $pathCoords = [
            sprintf('lonlat:%.6f,%.6f', $lngOrigen, $latOrigen),
        ];
        if (!empty($latAd) && !empty($lngAd)) {
            $pathCoords[] = sprintf('lonlat:%.6f,%.6f', $lngAd, $latAd);
        }
        $pathCoords[] = sprintf('lonlat:%.6f,%.6f', $lngDestino, $latDestino);

        $params['path'] = sprintf(
            'color:0x0066ccdd;width:4|%s',
            implode('|', $pathCoords)
        );

        // Devolver sólo la URL
        return $baseUrl . '?' . http_build_query($params);
    }
}