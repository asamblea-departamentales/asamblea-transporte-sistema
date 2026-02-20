<?php

return [
    "middlewares" => [],
    "allow_routes" => true,

    'name'             => env('APP_NAME', 'Transporte Asamblea'),
    'short_name'       => 'Aprobaciones',
    'description'      => 'Panel de aprobaciones - Asamblea Legislativa de El Salvador',
    'start_url'        => '/admin/',
    'background_color' => '#1E40AF',  // fondo azul para que el ícono con fondo transparente se vea bien
    'theme_color'      => '#1E40AF',
    'display'          => 'standalone',
    'orientation'      => 'portrait',
    'scope'            => '/admin/',  // ← solo controla /admin/, no todo el sitio

    'icons' => [
        [
            'src'     => '/vendor/filament-pwa/icons/icon-192x192.png',
            'sizes'   => '192x192',
            'type'    => 'image/png',
            'purpose' => 'any',
        ],
        [
            'src'     => '/vendor/filament-pwa/icons/icon-512x512.png',
            'sizes'   => '512x512',
            'type'    => 'image/png',
            'purpose' => 'any',
        ],
        [
            'src'     => '/vendor/filament-pwa/icons/icon-192x192-maskable.png',
            'sizes'   => '192x192',
            'type'    => 'image/png',
            'purpose' => 'maskable',
        ],
        [
            'src'     => '/vendor/filament-pwa/icons/icon-512x512-maskable.png',
            'sizes'   => '512x512',
            'type'    => 'image/png',
            'purpose' => 'maskable',
        ],
    ],
];