<?php

namespace App\Domain\Solicitudes\Listeners;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Events\SolicitudEstadoCambiado;
use App\Domain\Solicitudes\Services\SolicitudEmailDispatchService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldQueueAfterCommit;
use Illuminate\Support\Facades\Log;

class NotificarCambioEstado implements ShouldQueue, ShouldQueueAfterCommit
{
    public function __construct(
        private SolicitudEmailDispatchService $emailService,
    ) {}

    public function handle(SolicitudEstadoCambiado $event): void
    {
        $solicitud = $event->solicitud;
        $tipo = $this->normalizarTipo($solicitud->getEntidadTipo());

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

            if ($this->debeNotificarJefatura($tipo, $eventoEmail)) {
                $this->emailService->toJefatura(
                    $solicitud,
                    $tipo,
                    $eventoEmail,
                    $this->mensajeJefatura($tipo)
                );
            }

            if ($this->debeNotificarLiquidadores($tipo, $eventoEmail)) {
                $this->emailService->toLiquidadores(
                    $solicitud,
                    $tipo,
                    'solicitud_pendiente_liquidacion',
                    $this->mensajeLiquidadores($tipo)
                );
            }

            if ($this->debeNotificarMotorista($tipo, $eventoEmail)) {
                $this->emailService->toMotorista(
                    $solicitud,
                    $tipo,
                    $eventoEmail,
                    $this->mensajeMotorista($tipo)
                );
            }
        } catch (\Exception $e) {
            Log::error(
                "Error notificando cambio estado [{$tipo} #{$solicitud->getKey()}]: {$e->getMessage()}"
            );
        }
    }

    private function normalizarTipo(string $tipo): string
    {
        return match ($tipo) {
            'solicitud_transporte' => 'transporte',
            'solicitud_combustible' => 'combustible',
            'solicitud_mantenimiento' => 'mantenimiento',
            default => $tipo,
        };
    }

    private function debeNotificarJefatura(string $tipo, string $evento): bool
    {
        return in_array($tipo, ['combustible', 'mantenimiento'], true)
            && $evento === 'solicitud_enviada';
    }

    private function debeNotificarLiquidadores(string $tipo, string $evento): bool
    {
        return in_array($tipo, ['combustible', 'mantenimiento'], true)
            && $evento === 'solicitud_aprobada';
    }

    private function debeNotificarMotorista(string $tipo, string $evento): bool
    {
        return in_array($tipo, ['combustible', 'mantenimiento'], true)
            && $evento === 'solicitud_aprobada';
    }

    private function mensajeJefatura(string $tipo): string
    {
        return 'Se ha enviado una nueva solicitud de '.$this->label($tipo).' pendiente de aprobación por jefatura.';
    }

    private function mensajeLiquidadores(string $tipo): string
    {
        return 'La solicitud de '.$this->label($tipo).' fue aprobada. Debe liquidarse para continuar con el pago.';
    }

    private function mensajeMotorista(string $tipo): string
    {
        return 'La solicitud de '.$this->label($tipo).' asociada a tu vehículo fue aprobada.';
    }

    private function label(string $tipo): string
    {
        return match ($tipo) {
            'combustible' => 'combustible',
            'mantenimiento' => 'mantenimiento',
            default => 'servicio',
        };
    }
}
