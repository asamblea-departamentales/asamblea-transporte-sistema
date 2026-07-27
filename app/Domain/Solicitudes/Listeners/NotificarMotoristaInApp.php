<?php

namespace App\Domain\Solicitudes\Listeners;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Events\SolicitudEstadoCambiado;
use App\Notifications\SolicitudCancelada;
use App\Notifications\SolicitudRechazada;
use App\Notifications\ViajeAsignado;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class NotificarMotoristaInApp implements ShouldQueue
{
    public function handle(SolicitudEstadoCambiado $event): void
    {
        $solicitud = $event->solicitud;

        if (! $solicitud->relationLoaded('motorista')) {
            $solicitud->load('motorista');
        }

        $motorista = $solicitud->motorista;

        if (! $motorista) {
            return;
        }

        try {
            match ($event->estadoNuevo) {
                EstadoSolicitudEnum::ASIGNADA,
                EstadoSolicitudEnum::PROGRAMADA => $motorista->notify(new ViajeAsignado($solicitud)),
                EstadoSolicitudEnum::RECHAZADA => $motorista->notify(new SolicitudRechazada($solicitud)),
                EstadoSolicitudEnum::CANCELADA => $motorista->notify(new SolicitudCancelada($solicitud)),
                default => null,
            };
        } catch (\Exception $e) {
            Log::error(
                "Error notificando motorista in-app [solicitud #{$solicitud->getKey()}]: {$e->getMessage()}"
            );
        }
    }
}
