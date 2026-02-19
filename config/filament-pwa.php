<?php

return [
    /*
     * ---------------------------------------------------------------
     * Add Middleware To Routes
     * ---------------------------------------------------------------
     */
    "middlewares" => [],

    /*
     * ---------------------------------------------------------------
     * Allow Routes
     * ---------------------------------------------------------------
     */
    "allow_routes" => true,

    /*
     * ---------------------------------------------------------------
     * PWA Manifest Configuration
     * ---------------------------------------------------------------
     */
    'name' => env('APP_NAME', 'Transporte Asamblea'),
    'short_name' => 'Transporte',
    'description' => 'Sistema de Gestión de Transporte para la Asamblea Legislativa de El Salvador',
    'start_url' => '/admin',
    'background_color' => '#FFFFFF',
    'theme_color' => '#1E40AF',
    'display' => 'standalone',
    'orientation' => 'portrait',
    'scope' => '/',
    'icons' => [
        [
            'src' => '/images/logo-azul-fondo-transparente.png',
            'sizes' => '192x192',
            'type' => 'image/png',
            'purpose' => 'any maskable',
        ],
        [
            'src' => '/images/logo-blanco-fondo-transparente.png',
            'sizes' => '512x512',
            'type' => 'image/png',
            'purpose' => 'any maskable',
        ],
    ],
];