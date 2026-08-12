<?php

namespace App\Domain\Solicitudes\Listeners;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Events\SolicitudEstadoCambiado;
use App\Models\User;
use App\Notifications\SolicitudEstadoActualizada;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldQueueAfterCommit;
use Illuminate\Support\Facades\Log;

class NotificarSolicitanteInApp implements ShouldQueue, ShouldQueueAfterCommit
{
    public function handle(SolicitudEstadoCambiado $event): void
    {
        $tipo = $this->mapearTipo($event);

        if ($tipo === null) {
            return;
        }

        $user = User::find($event->solicitud->getSolicitanteId());

        if (! $user) {
            return;
        }

        try {
            $user->notify(new SolicitudEstadoActualizada($event->solicitud, $tipo));
        } catch (\Exception $e) {
            Log::error(
                "Error notificando solicitante in-app [solicitud #{$event->solicitud->getKey()}]: {$e->getMessage()}"
            );
        }
    }

    private function mapearTipo(SolicitudEstadoCambiado $event): ?string
    {
        return match ($event->estadoNuevo) {
            EstadoSolicitudEnum::APROBADA => 'aprobada',
            EstadoSolicitudEnum::PRE_APROBADA => 'pre_aprobada',
            EstadoSolicitudEnum::ASIGNADA => 'asignada',
            EstadoSolicitudEnum::PROGRAMADA => 'programada',
            EstadoSolicitudEnum::RECHAZADA => 'rechazada',
            EstadoSolicitudEnum::COMPLETADA => 'finalizada',
            EstadoSolicitudEnum::CANCELADA => 'cancelada',
            EstadoSolicitudEnum::EN_REVISION => $this->tipoRevision($event),
            default => null,
        };
    }

    private function tipoRevision(SolicitudEstadoCambiado $event): ?string
    {
        $accion = $event->metadata['accion'] ?? null;

        return in_array($accion, ['observar', 'condicionar'], true) ? 'observada' : 'en_revision';
    }
}
