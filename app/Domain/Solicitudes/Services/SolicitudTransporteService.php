<?php

namespace App\Domain\Solicitudes\Services;
//Servicio encargado de gestionar la logica y las transiciones de estado de las Solicitudes de Transporte
// aplicando un patron de servicios, sacamos la logica del controlador y del resource

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Mail\NotificacionEventMail;
use App\Models\BitacoraEvento;
use App\Models\DecisionOperativa;
use App\Models\HistorialEstado;
use App\Models\SolicitudTransporte;
use App\Models\SugerenciaAsignacion;
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

    public function generarSugerencia(SolicitudTransporte $solicitud): SugerenciaAsignacion
    {
        return app(SugerenciaAsignacionService::class)->generar($solicitud);
    }

    public function asignarRecursos(
        SolicitudTransporte $solicitud,
        int $userId,
        int $vehiculoId,
        int $motoristaId,
        ?string $justificacion = null
    ): array {
        if ($solicitud->estado !== EstadoSolicitudEnum::EN_REVISION) {
            throw new \DomainException('Solo se pueden asignar recursos a solicitudes en revisión.');
        }

        return DB::transaction(function () use ($solicitud, $userId, $vehiculoId, $motoristaId, $justificacion) {
            $sugerencia = $solicitud->sugerencia;
            if (!$sugerencia) {
                $sugerencia = $this->generarSugerencia($solicitud);
            }

            $cambio = $this->detectarCambio($sugerencia, $vehiculoId, $motoristaId);

            if ($cambio !== 'ninguno' && (empty($justificacion) || strlen($justificacion) < 10)) {
                throw new \DomainException(
                    'El operador seleccionó recursos diferentes a la sugerencia del sistema. '
                    . 'Es obligatorio proveer una justificación de al menos 10 caracteres.'
                );
            }

            DecisionOperativa::create([
                'solicitud_id' => $solicitud->id,
                'usuario_operativo_id' => $userId,
                'vehiculo_final_id' => $vehiculoId,
                'motorista_final_id' => $motoristaId,
                'cambio_detectado' => $cambio,
                'justificacion' => $cambio !== 'ninguno' ? $justificacion : null,
            ]);

            $anterior = $solicitud->estado;
            $solicitud->estado = EstadoSolicitudEnum::PRE_APROBADA;
            $solicitud->save();

            $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $userId, $justificacion);
            $this->registrarEvento($solicitud, AccionBitacoraEnum::ASIGNAR_RECURSOS->value, $userId, [
                'vehiculo_id' => $vehiculoId,
                'motorista_id' => $motoristaId,
                'cambio_detectado' => $cambio,
            ]);

            return [
                'cambio_detectado' => $cambio,
                'estado_nuevo' => EstadoSolicitudEnum::PRE_APROBADA->value,
            ];
        });
    }

    public function aprobarConDecision(
        SolicitudTransporte $solicitud,
        int $jefeId,
        string $decisionFinal,
        string $comentario,
        ?string $firma = null
    ): array {
        if ($solicitud->estado !== EstadoSolicitudEnum::PRE_APROBADA) {
            throw new \DomainException('Solo se puede aprobar una solicitud en pre-aprobada.');
        }

        if (!in_array($decisionFinal, ['operativo', 'sistema'])) {
            throw new \InvalidArgumentException('decision_final debe ser "operativo" o "sistema".');
        }

        return DB::transaction(function () use ($solicitud, $jefeId, $decisionFinal, $comentario, $firma) {
            $anterior = $solicitud->estado;

            if ($decisionFinal === 'operativo') {
                $decision = $solicitud->decisionOperativa;
                if (!$decision) throw new \DomainException('No hay decisión operativa registrada.');
                $solicitud->vehiculo_id = $decision->vehiculo_final_id;
                $solicitud->motorista_id = $decision->motorista_final_id;
            } else {
                $sugerencia = $solicitud->sugerencia;
                if (!$sugerencia) throw new \DomainException('No hay sugerencia del sistema.');
                $solicitud->vehiculo_id = $sugerencia->vehiculo_sugerido_id;
                $solicitud->motorista_id = $sugerencia->motorista_sugerido_id;
            }

            if ($solicitud->fecha_salida && $solicitud->fecha_retorno) {
                $solicitud->horas_estimadas = round(
                    $solicitud->fecha_retorno->diffInMinutes($solicitud->fecha_salida) / 60, 2
                );
            }

            $solicitud->decision_final = $decisionFinal;
            $solicitud->estado = EstadoSolicitudEnum::APROBADA;
            $solicitud->decidido_por = $jefeId;
            $solicitud->decidido_en = now();
            $solicitud->comentario_jefe = $comentario;
            if ($firma) $solicitud->firma_aprobador = $firma;
            $solicitud->save();

            app(EstadoFlotaService::class)->aplicarPorEstado($solicitud);

            $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $jefeId, $comentario);
            $this->registrarEvento($solicitud, AccionBitacoraEnum::APROBAR->value, $jefeId, [
                'decision_final' => $decisionFinal,
            ]);

            return [
                'success' => true,
                'estado_final' => EstadoSolicitudEnum::APROBADA->value,
                'recursos_consolidados' => [
                    'vehiculo_id' => $solicitud->vehiculo_id,
                    'motorista_id' => $solicitud->motorista_id,
                ],
            ];
        });
    }

    public function desbloquear(SolicitudTransporte $solicitud, int $userId): array
    {
        if (!in_array($solicitud->estado, [
            EstadoSolicitudEnum::APROBADA,
            EstadoSolicitudEnum::RECHAZADA,
        ], true)) {
            throw new \DomainException('Solo se puede desbloquear una solicitud aprobada o rechazada.');
        }

        return DB::transaction(function () use ($solicitud, $userId) {
            $anterior = $solicitud->estado;

            $solicitud->estado = EstadoSolicitudEnum::PENDIENTE;
            $solicitud->decision_final = null;
            $solicitud->vehiculo_id = null;
            $solicitud->motorista_id = null;
            $solicitud->decidido_por = null;
            $solicitud->decidido_en = null;
            $solicitud->save();

            app(EstadoFlotaService::class)->aplicarPorEstado($solicitud);

            $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $userId,
                'Solicitud desbloqueada para re-asignación.');
            $this->registrarEvento($solicitud, AccionBitacoraEnum::DESBLOQUEAR->value, $userId);

            return [
                'message' => "Solicitud {$solicitud->codigo} desbloqueada para re-asignación.",
                'estado_nuevo' => EstadoSolicitudEnum::PENDIENTE->value,
            ];
        });
    }

    protected function detectarCambio(SugerenciaAsignacion $sugerencia, int $vehiculoId, int $motoristaId): string
    {
        $cambioV = $sugerencia->vehiculo_sugerido_id !== $vehiculoId;
        $cambioM = $sugerencia->motorista_sugerido_id !== $motoristaId;

        if ($cambioV && $cambioM) return 'ambos';
        if ($cambioV) return 'vehiculo';
        if ($cambioM) return 'chofer';
        return 'ninguno';
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

    /** NUEVOS MÉTODOS PARA FINALIZAR SOLICITUDES Y APLICAR CAMBIOS DE ESTADOS EN VEHÍCULOS Y MOTORISTAS
     * Estos métodos permiten finalizar una solicitud de transporte (cambiando su estado a COMPLETADA)
     *  y aplicar los cambios necesarios en el estado de los vehículos y motoristas asociados según el nuevo estado de la solicitud.
     * Al finalizar/completar una solicitud, se libera el vehículo y el motorista asignados, siempre verificando que no tengan otros viajes activos antes de cambiar su estado a disponible.
     */
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

            // Calcular horas reales (Opción A — 4 pasos)
            if ($solicitud->fecha_salida_real && $solicitud->fecha_retorno_real) {
                if ($solicitud->fecha_llegada_destino && $solicitud->fecha_inicio_retorno) {
                    $ida = $solicitud->fecha_llegada_destino->diffInMinutes($solicitud->fecha_salida_real) / 60;
                    $ret = $solicitud->fecha_retorno_real->diffInMinutes($solicitud->fecha_inicio_retorno) / 60;
                    $esp = $solicitud->fecha_inicio_retorno->diffInMinutes($solicitud->fecha_llegada_destino) / 60;
                    $solicitud->horas_reales = round($ida + $ret, 2);
                    $solicitud->horas_espera = round($esp, 2);
                } else {
                    $solicitud->horas_reales = round(
                        $solicitud->fecha_retorno_real->diffInMinutes($solicitud->fecha_salida_real) / 60, 2
                    );
                }
            }

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

            app(EstadoFlotaService::class)->aplicarPorEstado($solicitud);

            return $solicitud;
        });
    }

    public function cancelar(SolicitudTransporte $solicitud, int $userId, ?string $motivoCancelacion = null): SolicitudTransporte
    {
        if (! in_array($solicitud->estado, [
            EstadoSolicitudEnum::BORRADOR,
            EstadoSolicitudEnum::PENDIENTE,
        ], true)) {
            throw new \DomainException('Solo se puede cancelar una solicitud en estado Borrador o Pendiente.');
        }

        if ($solicitud->solicitante_id !== $userId) {
            throw new \DomainException('Solo el solicitante puede cancelar esta solicitud.');
        }

        return DB::transaction(function () use ($solicitud, $userId, $motivoCancelacion) {
            $anterior = $solicitud->estado;

            $solicitud->estado = EstadoSolicitudEnum::CANCELADA;
            $solicitud->motivo_cancelacion = $motivoCancelacion;
            $solicitud->save();

            $comentarioHistorial = $motivoCancelacion ?? 'Solicitud cancelada por el usuario.';

            $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $userId, $comentarioHistorial);
            $this->registrarEvento($solicitud, AccionBitacoraEnum::CANCELAR->value, $userId, [
                'motivo_cancelacion' => $motivoCancelacion,
            ]);

            return $solicitud;
        });
    }
}
