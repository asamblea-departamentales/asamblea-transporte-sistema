<?php

namespace App\Domain\Solicitudes\Listeners;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Events\SolicitudEstadoCambiado;
use App\Models\SolicitudTransporte;
use App\Notifications\SolicitudCancelada;
use App\Notifications\SolicitudRechazada;
use App\Notifications\ViajeAsignado;
use App\Notifications\ViajeProgramado;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldQueueAfterCommit;
use Illuminate\Support\Facades\Log;

class NotificarMotoristaInApp implements ShouldQueue, ShouldQueueAfterCommit
{
    public function handle(SolicitudEstadoCambiado $event): void
    {
        $solicitud = $event->solicitud;

        if (! $solicitud instanceof SolicitudTransporte) {
            return;
        }

        $solicitud->unsetRelation('motorista')->load('motorista');

        $motorista = $solicitud->motorista;

        if (! $motorista) {
            return;
        }

        try {
            match ($event->estadoNuevo) {
                EstadoSolicitudEnum::APROBADA,
                EstadoSolicitudEnum::ASIGNADA => $motorista->notify(new ViajeAsignado($solicitud)),
                EstadoSolicitudEnum::PROGRAMADA => $motorista->notify(new ViajeProgramado($solicitud)),
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
