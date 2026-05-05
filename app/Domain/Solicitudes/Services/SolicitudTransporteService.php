<?php

namespace App\Domain\Solicitudes\Services;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Mail\NotificacionEventMail;
use App\Models\BitacoraEvento;
use App\Models\HistorialEstado;
use App\Models\SolicitudTransporte;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 *Archivo principal del servicio de Solicitudes de Transporte, aplicando un patron de servicios, sacamos la logica del controlador o algun otro resource
 */

/**
 * Servicio encargado de gestionar la logica y las transiciones de estado de las Solicitudes de Transporte.
 */
class SolicitudTransporteService
{
    // El solicitante envía la solicitud como borrador para revisión
    public function enviarSolicitud(SolicitudTransporte $solicitud, int $userId): SolicitudTransporte
    {
        // Borrador -> Pendiente
        // No puedes enviar algo que ya esta enviado o procesado
        if ($solicitud->estado !== EstadoSolicitudEnum::BORRADOR) {
            throw new \DomainException('Solo se puede enviar una solicitud en estado Borrador.');
        }

        return DB::transaction(function () use ($solicitud, $userId) {
            $anterior = $solicitud->estado;

            $solicitud->estado = EstadoSolicitudEnum::PENDIENTE;
            $solicitud->save();

            // Registrar en el historial de estados
            $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $userId, null);
            // Registrar en la bitacora de eventos
            $this->registrarEvento($solicitud, AccionBitacoraEnum::ENVIAR->value, $userId, null);

            // Enviar correo de notificación
            $this->enviarCorreoEnviada($solicitud);

            return $solicitud;
        });
    }

    // El jefe puede agregar notas
    public function observar(SolicitudTransporte $solicitud, int $jefeId, ?string $comentario): SolicitudTransporte
    {
        if (! in_array($solicitud->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)) {
            throw new \DomainException('Solo se puede observar una solicitud en estado Pendiente o En Revisión.');
        }

        return DB::transaction(function () use ($solicitud, $jefeId, $comentario) {
            $anterior = $solicitud->estado;

            // Guardar comentario siempre
            $solicitud->comentario_jefe = $comentario;

            // Transicion automatica de PENDIENTE a EN_REVISION
            if ($solicitud->estado === EstadoSolicitudEnum::PENDIENTE) {
                $solicitud->estado = EstadoSolicitudEnum::EN_REVISION;
            }
            $solicitud->save();

            // Registramos el historial de estado solo si hubo un cambio real
            if ($anterior !== $solicitud->estado) {
                // Registrar en el historial de estados
                $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $jefeId, $comentario);
            }

            // Registrar en la bitacora de eventos
            $this->registrarEvento($solicitud, AccionBitacoraEnum::OBSERVAR->value, $jefeId, ['comentario' => $comentario]);

            return $solicitud;
        });
    }

    // Aprobacion por parte del jefe de unidad
    public function aprobar(SolicitudTransporte $solicitud, int $jefeId): SolicitudTransporte
    {
        if (! in_array($solicitud->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)) {
            throw new \DomainException('Solo se puede aprobar una solicitud PENDIENTE o EN_REVISION.');
        }

        return DB::transaction(function () use ($solicitud, $jefeId) {
            $anterior = $solicitud->estado;

            $solicitud->estado = EstadoSolicitudEnum::APROBADA;
            $solicitud->decidido_por = $jefeId;
            $solicitud->decidido_en = now();
            $solicitud->save();

            $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $jefeId, null);
            $this->registrarEvento($solicitud, AccionBitacoraEnum::APROBAR->value, $jefeId);

            return $solicitud;
        });
    }

    // Rechaza una solicitud pendiente o en revisión indicando el motivo
    public function rechazar(SolicitudTransporte $solicitud, int $jefeId, string $comentario): SolicitudTransporte
    {
        if (! in_array($solicitud->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)) {
            throw new \DomainException('Solo se puede rechazar una solicitud PENDIENTE o EN_REVISION.');
        }

        return DB::transaction(function () use ($solicitud, $jefeId, $comentario) {
            $anterior = $solicitud->estado;

            $solicitud->estado = EstadoSolicitudEnum::RECHAZADA;
            $solicitud->comentario_jefe = $comentario; // Es importante guardar el comentario al rechazar
            $solicitud->decidido_por = $jefeId;
            $solicitud->decidido_en = now();
            $solicitud->save();

            $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $jefeId, $comentario);
            $this->registrarEvento($solicitud, AccionBitacoraEnum::RECHAZAR->value, $jefeId, ['comentario' => $comentario]);

            return $solicitud;
        });
    }

    // Metodos auxiliares para registrar en la bitacora y el historial

    // Guarda el rastro de CÓMO cambió el estado (Línea de tiempo).
    private function registrarCambioEstado(SolicitudTransporte $solicitud, $anterior, $nuevo, int $userId, ?string $comentario): void
    {
        HistorialEstado::create([
            'entidad_tipo' => 'solicitud_transporte',
            'entidad_id' => $solicitud->id,
            'estado_anterior' => $anterior?->value ?? (string) $anterior,
            'estado_nuevo' => $nuevo?->value ?? (string) $nuevo,
            'user_id' => $userId,
            'comentario' => $comentario,
        ]);
    }

    // Guarda QUÉ acción se realizó (Bitácora de actividad).
    private function registrarEvento(SolicitudTransporte $solicitud, string $accion, int $userId, ?array $extra = null): void
    {
        BitacoraEvento::create([
            'entidad_tipo' => 'solicitud_transporte',
            'entidad_id' => $solicitud->id,
            'accion' => $accion,
            'user_id' => $userId,
            'datos_extras' => $extra,
        ]);
    }

    // Enviar correo cuando se envía la solicitud (borrador -> pendiente)
    private function enviarCorreoEnviada(SolicitudTransporte $solicitud): void
    {
        try {
            $solicitud->load(['solicitante', 'vehiculo']);

            $payload = [
                'tipo' => 'transporte',
                'evento' => 'solicitud_enviada',
                'mensaje' => 'Tu solicitud de transporte ha sido ENVIADA y está pendiente de revisión.',
                'solicitud' => [
                    'codigo' => $solicitud->codigo,
                    'estado' => 'pendiente',
                    'vehiculo' => $solicitud->vehiculo->placa ?? 'N/A',
                    'fecha_salida' => $solicitud->fecha_salida,
                    'destino' => $solicitud->destino,
                ],
                'solicitante' => [
                    'name' => $solicitud->solicitante->name,
                    'email' => $solicitud->solicitante->email,
                ],
                'timestamp' => now()->toIso8601String(),
            ];

            Mail::to($solicitud->solicitante->email)->send(
                new NotificacionEventMail('📤 Solicitud de Transporte ENVIADA', $payload)
            );
        } catch (\Exception $e) {
            Log::error('Error enviando correo de envío: '.$e->getMessage());
        }
    }

    // Pasamos el evento o accion de Finalizar/Completar del Controller al Service
    public function finalizar(SolicitudTransporte $solicitud, int $userId): SolicitudTransporte
    {
        if (! in_array($solicitud->estado, [
            EstadoSolicitudEnum::PROGRAMADA,
            EstadoSolicitudEnum::APROBADA,
            EstadoSolicitudEnum::ASIGNADA,
        ], true)) {
            throw new \DomainException('Solo se pueden finalizar solicitudes en estado PROGRAMADA, APROBADA o ASIGNADA.');
        }

        return DB::transaction(function () use ($solicitud, $userId) {

            $anterior = $solicitud->estado;

            $solicitud->estado = EstadoSolicitudEnum::COMPLETADA;
            $solicitud->confirmado_por = $userId;
            $solicitud->confirmado_en = now();
            $solicitud->save();

            // HISTORIAL
            $this->registrarCambioEstado(
                $solicitud,
                $anterior,
                $solicitud->estado,
                $userId,
                'Finalizada por el solicitante.'
            );

            // BITÁCORA
            $this->registrarEvento(
                $solicitud,
                AccionBitacoraEnum::COMPLETAR->value,
                $userId
            );

            return $solicitud;
        });
    }
}
