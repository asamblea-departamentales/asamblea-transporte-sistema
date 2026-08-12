<?php

namespace App\Domain\Solicitudes\Listeners;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Events\SolicitudEstadoCambiado;
use App\Models\User;
use App\Notifications\SolicitudPendienteAprobacion;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldQueueAfterCommit;
use Illuminate\Support\Facades\Log;

class NotificarJefaturaInApp implements ShouldQueue, ShouldQueueAfterCommit
{
    private const ROLES_JEFATURA = ['jefe', 'admin', 'ti', 'super_admin'];

    public function handle(SolicitudEstadoCambiado $event): void
    {
        if ($event->estadoNuevo !== EstadoSolicitudEnum::PRE_APROBADA) {
            return;
        }

        if ($event->estadoAnterior === EstadoSolicitudEnum::PRE_APROBADA) {
            return;
        }

        $usuarios = User::role(self::ROLES_JEFATURA)
            ->where('activo', true)
            ->get();

        foreach ($usuarios as $usuario) {
            try {
                $usuario->notify(new SolicitudPendienteAprobacion($event->solicitud));
            } catch (\Exception $e) {
                Log::error(
                    "Error notificando jefatura in-app [solicitud #{$event->solicitud->getKey()}, user #{$usuario->id}]: {$e->getMessage()}"
                );
            }
        }
    }
}
