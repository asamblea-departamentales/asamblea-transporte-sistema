<?php

return [
    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://asamblea-transporte.vercel.app',
        'https://asamble-transporte-motorista.vercel.app',
        'https://asamblea-transporte-sistema.vercel.app',
        'https://transporte-front-six.vercel.app',
    ],

    'allowed_origins_patterns' => [
        '/^https?:\/\/localhost(:\d+)?$/',
        '/^https?:\/\/127\.0\.0\.1(:\d+)?$/',
        '/^https:\/\/asamblea-transporte.*\.vercel\.app$/',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => false, // ✅ ya no cookies
];
