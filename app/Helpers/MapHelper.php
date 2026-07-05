<?php

namespace App\Helpers;

class MapHelper
{
    public static function generarMapaTransporte(?string $origen, ?string $destino, ?string $destinoAdicional = null): string
    {
        $apiKey = config('services.maptiler.api_key');

        if (! $origen || ! $destino || ! $apiKey) {
            return '';
        }

        // Coordenadas aproximadas de El Salvador (centro)
        $centerLng = -89.1872;
        $centerLat = 13.6929;

        // Markers básicos (en producción usarías geocoding real)
        $markers = [
            "pin-s-a+FF0000({$centerLng},{$centerLat})",  // Origen (rojo)
            'pin-s-b+0000FF('.($centerLng + 0.05).','.($centerLat + 0.05).')', // Destino (azul)
        ];

        $markersStr = implode(',', $markers);

        return "https://api.maptiler.com/maps/streets/static/{$markersStr}/auto/800x400@2x.png?key={$apiKey}";
    }
}
