<?php

return [
    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://asamblea-transporte.vercel.app',
    ],

    'allowed_origins_patterns' => [
        '/^https:\/\/asamblea-transporte.*\.vercel\.app$/',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false, // ✅ ya no cookies
];
