<?php

namespace App\Providers;

use App\Domain\Solicitudes\Events\SolicitudEstadoCambiado;
use App\Domain\Solicitudes\Listeners\NotificarCambioEstado;
use App\Domain\Solicitudes\Listeners\NotificarJefaturaInApp;
use App\Domain\Solicitudes\Listeners\NotificarMotoristaInApp;
use App\Domain\Solicitudes\Listeners\NotificarSolicitanteInApp;
use App\Domain\Solicitudes\Listeners\RegistrarHistorialEstado;
use App\Models\SolicitudCombustible;
use App\Observers\SolicitudCombustibleObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\RateLimiter;
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

        Event::listen(
            SolicitudEstadoCambiado::class,
            RegistrarHistorialEstado::class,
        );

        Event::listen(
            SolicitudEstadoCambiado::class,
            NotificarMotoristaInApp::class,
        );

        Event::listen(
            SolicitudEstadoCambiado::class,
            NotificarSolicitanteInApp::class,
        );

        Event::listen(
            SolicitudEstadoCambiado::class,
            NotificarJefaturaInApp::class,
        );

        SolicitudCombustible::observe(
            SolicitudCombustibleObserver::class,
        );

        RateLimiter::for('login', function (Request $request) {
            $email = (string) $request->input('email');

            return Limit::perMinute(5)->by($email.'|'.$request->ip());
        });

        // Forzar HTTPS si viene de proxy (ngrok, cloudflare, etc)
        if (request()->server('HTTP_X_FORWARDED_PROTO') === 'https' ||
            request()->server('HTTP_X_FORWARDED_SSL') === 'on' ||
            config('app.env') === 'production') {
            URL::forceScheme('https');
        }
    }
}
