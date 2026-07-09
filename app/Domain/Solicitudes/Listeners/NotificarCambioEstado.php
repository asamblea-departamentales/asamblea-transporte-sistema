<?php

namespace App\Domain\Solicitudes\Listeners;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Events\SolicitudEstadoCambiado;
use App\Domain\Solicitudes\Services\SolicitudEmailDispatchService;
use App\Domain\Solicitudes\Services\SolicitudEmailPayloadService;
use Illuminate\Contracts\Queue\ShouldQueue;

class NotificarCambioEstado implements ShouldQueue
{
    public function __construct(
        private SolicitudEmailDispatchService $emailService,
        private SolicitudEmailPayloadService $payloadService,
    ) {}

    public function handle(SolicitudEstadoCambiado $event): void
    {
        $solicitud = $event->solicitud;
        $tipo = $solicitud->getEntidadTipo();

        $eventoEmail = match ($event->estadoNuevo) {
            EstadoSolicitudEnum::PENDIENTE => 'solicitud_enviada',
            EstadoSolicitudEnum::APROBADA => 'solicitud_aprobada',
            EstadoSolicitudEnum::RECHAZADA => 'solicitud_rechazada',
            EstadoSolicitudEnum::CANCELADA => 'solicitud_cancelada',
            EstadoSolicitudEnum::COMPLETADA => 'solicitud_completada',
            EstadoSolicitudEnum::LIQUIDADA => 'solicitud_liquidada',
            EstadoSolicitudEnum::ASIGNADA => 'solicitud_asignada',
            EstadoSolicitudEnum::PROGRAMADA => 'solicitud_programada',
            default => null,
        };

        if ($eventoEmail === null) {
            return;
        }

        try {
            $this->emailService->toSolicitante($solicitud, $tipo, $eventoEmail);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error(
                "Error notificando cambio estado [{$tipo} #{$solicitud->getKey()}]: {$e->getMessage()}"
            );
        }
    }
}
