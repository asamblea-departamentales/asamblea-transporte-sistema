<?php

return [

    'title' => 'Acceso al Sistema',

    'heading' => 'Portal de Gestión de Transporte',

    'actions' => [

        'register' => [
            'before' => 'o',
            'label' => 'Abrir una cuenta',
        ],

    ],

    'form' => [

        'email' => [
            'label' => 'Correo institucional',
        ],

        'password' => [
            'label' => 'Contraseña',
        ],

        'remember' => [
            'label' => 'Recordarme',
        ],

        'actions' => [

            'authenticate' => [
                'label' => 'Ingresar al sistema',
            ],

        ],

    ],

    'messages' => [

        'failed' => 'Estas credenciales no coinciden con nuestros registros.',

    ],

    'notifications' => [

        'throttled' => [
            'title' => 'Demasiados intentos. Intente de nuevo en :seconds segundos.',
            'body' => 'Intente de nuevo en :seconds segundos.',
        ],

    ],

];
