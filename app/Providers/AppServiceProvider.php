<?php

namespace App\Providers;

use App\Domain\Solicitudes\Events\SolicitudEstadoCambiado;
use App\Domain\Solicitudes\Listeners\NotificarCambioEstado;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Event::listen(
            SolicitudEstadoCambiado::class,
            NotificarCambioEstado::class,
        );

        // Forzar HTTPS si viene de proxy (ngrok, cloudflare, etc)
        if (request()->server('HTTP_X_FORWARDED_PROTO') === 'https' ||
            request()->server('HTTP_X_FORWARDED_SSL') === 'on' ||
            config('app.env') === 'production') {
            URL::forceScheme('https');
        }
    }
}
