<?php

namespace App\Domain\Solicitudes\Services;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\BitacoraEvento;
use App\Models\ContratoMantenimiento;
use App\Models\DecisionOperativa;
use App\Models\SolicitudMantenimiento;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SolicitudMantenimientoService
{
    public function __construct(
        private SolicitudWorkflowService $workflow,
    ) {}

    public function enviarSolicitud(SolicitudMantenimiento $solicitud, int $userId): SolicitudMantenimiento
    {
        $actor = User::findOrFail($userId);

        $this->workflow->enviar($solicitud, $actor);
        $this->registrarEvento($solicitud, AccionBitacoraEnum::ENVIAR->value, $userId, null);

        return $solicitud;
    }

    public function observar(SolicitudMantenimiento $solicitud, int $jefeId, ?string $comentario): SolicitudMantenimiento
    {
        $solicitud->observaciones = $comentario;

        $this->workflow->observar($solicitud, User::findOrFail($jefeId), $comentario);
        $this->registrarEvento($solicitud, AccionBitacoraEnum::OBSERVAR->value, $jefeId, [
            'comentario' => $comentario,
        ]);

        return $solicitud;
    }

    public function preAprobar(SolicitudMantenimiento $solicitud, int $jefeId): SolicitudMantenimiento
    {
        $solicitud->aprobador_id = $jefeId;
        $solicitud->fecha_aprobacion = now();

        $this->workflow->transicionar($solicitud, EstadoSolicitudEnum::PRE_APROBADA, User::findOrFail($jefeId), 'Solicitud pre-aprobada.', ['accion' => 'pre_aprobar']);
        $this->registrarEvento($solicitud, 'PRE_APROBAR', $jefeId, null);

        return $solicitud;
    }

    public function aprobar(SolicitudMantenimiento $solicitud, int $jefeId, ?string $observaciones): SolicitudMantenimiento
    {
        if ($solicitud->solicitante_id === $jefeId) {
            throw new \DomainException('No puedes aprobar tu propia solicitud.');
        }

        $solicitud->aprobador_id = $jefeId;
        $solicitud->fecha_aprobacion = now();
        $solicitud->observaciones = $observaciones;
        $solicitud->motivo_rechazo = null;

        $this->workflow->transicionar($solicitud, EstadoSolicitudEnum::APROBADA, User::findOrFail($jefeId), $observaciones, ['accion' => 'aprobar']);
        $this->registrarEvento($solicitud, AccionBitacoraEnum::APROBAR->value, $jefeId, [
            'observaciones' => $observaciones,
        ]);

        return $solicitud;
    }

    public function rechazar(SolicitudMantenimiento $solicitud, int $jefeId, string $motivoRechazo): SolicitudMantenimiento
    {
        $actor = User::findOrFail($jefeId);
        $solicitud->motivo_rechazo = $motivoRechazo;
        $solicitud->aprobador_id = $jefeId;
        $solicitud->fecha_aprobacion = now();

        $this->workflow->rechazar($solicitud, $actor, $motivoRechazo);
        $this->registrarEvento($solicitud, AccionBitacoraEnum::RECHAZAR->value, $jefeId, [
            'motivo_rechazo' => $motivoRechazo,
        ]);

        return $solicitud;
    }

    public function iniciarEjecucion(SolicitudMantenimiento $solicitud, int $userId): SolicitudMantenimiento
    {
        $this->workflow->transicionar($solicitud, EstadoSolicitudEnum::EN_EJECUCION, User::findOrFail($userId), 'Mantenimiento iniciado.', ['accion' => 'iniciar_ejecucion']);
        $this->registrarEvento($solicitud, 'EN_EJECUCION', $userId, null);

        return $solicitud;
    }

    public function completar(SolicitudMantenimiento $solicitud, int $userId, array $data): SolicitudMantenimiento
    {
        $adjuntosExistentes = $solicitud->adjuntos ?? [];
        $nuevosAdjuntos = $data['adjuntos'] ?? [];
        $todosAdjuntos = array_values(array_filter(array_merge($adjuntosExistentes, $nuevosAdjuntos)));

        if (empty($todosAdjuntos)) {
            throw new \DomainException('Debes subir al menos un adjunto.');
        }

        return DB::transaction(function () use ($solicitud, $userId, $data, $todosAdjuntos) {
            $solicitud->fecha_realizada = $data['fecha_realizada'];
            $solicitud->costo_real = $data['costo_real'];
            $solicitud->adjuntos = $todosAdjuntos;
            $solicitud->finalizado_por = $userId;
            $solicitud->fecha_finalizacion = now();

            $this->workflow->transicionar($solicitud, EstadoSolicitudEnum::COMPLETADA, User::findOrFail($userId), 'Mantenimiento finalizado.', ['accion' => 'completar']);
            $this->registrarEvento($solicitud, AccionBitacoraEnum::COMPLETAR->value, $userId, [
                'costo_real' => $data['costo_real'],
                'fecha_realizada' => $data['fecha_realizada'],
            ]);

            \App\Jobs\RecordatorioLiquidacionJob::dispatch($solicitud, 'mantenimiento')
                ->delay(now()->addHours(2));

            return $solicitud;
        });
    }

    public function cancelar(SolicitudMantenimiento $solicitud, int $userId, ?string $motivoCancelacion = null): SolicitudMantenimiento
    {
        if ($solicitud->solicitante_id !== $userId) {
            throw new \DomainException('Solo el solicitante puede cancelar esta solicitud.');
        }

        $solicitud->motivo_cancelacion = $motivoCancelacion;

        $this->workflow->cancelar($solicitud, User::findOrFail($userId), $motivoCancelacion);
        $this->registrarEvento($solicitud, AccionBitacoraEnum::CANCELAR->value, $userId, [
            'motivo_cancelacion' => $motivoCancelacion,
        ]);

        return $solicitud;
    }

    public function evaluar(
        SolicitudMantenimiento $solicitud,
        int $userId,
        string $estado,
        ?string $comentario
    ): SolicitudMantenimiento {
        if ($solicitud->estado !== EstadoSolicitudEnum::COMPLETADA) {
            throw new \DomainException('Solo se puede evaluar una solicitud completada.');
        }

        return DB::transaction(function () use ($solicitud, $userId, $estado, $comentario) {
            $solicitud->evaluacion_estado = $estado;
            $solicitud->evaluacion_comentario = $comentario;
            $solicitud->evaluado_por = $userId;
            $solicitud->fecha_evaluacion = now();
            $solicitud->save();

            BitacoraEvento::create([
                'entidad_tipo' => 'solicitud_mantenimiento',
                'entidad_id' => $solicitud->id,
                'accion' => 'EVALUAR',
                'user_id' => $userId,
                'datos_extras' => [
                    'estado' => $estado,
                    'comentario' => $comentario,
                ],
            ]);

            return $solicitud;
        });
    }

    public function enviarALiquidador(SolicitudMantenimiento $solicitud, int $userId): SolicitudMantenimiento
    {
        if (! in_array($solicitud->estado, [EstadoSolicitudEnum::COMPLETADA], true)) {
            throw new \DomainException('La solicitud debe estar completada para enviar a liquidación.');
        }

        if (! $solicitud->tieneAdjuntos()) {
            throw new \DomainException('No se puede enviar a liquidador sin adjuntar los comprobantes.');
        }

        $this->registrarEvento(
            $solicitud,
            'enviar_liquidador',
            $userId,
            [
                'fecha_envio' => now()->toDateTimeString(),
                'estado_al_enviar' => $solicitud->estado->value,
                'mensaje' => 'Documentación lista para revisión contable',
            ]
        );

        return $solicitud;
    }

    public function liquidar(SolicitudMantenimiento $solicitud, int $userId, array $data): void
    {
        if (empty($solicitud->adjuntos)) {
            throw new \DomainException('No se puede liquidar sin adjuntos.');
        }

        DB::transaction(function () use ($solicitud, $userId, $data) {
            $solicitud->liquidacion()->create([
                'user_id' => $userId,
                'monto_solicitado' => $solicitud->costo_real ?? $solicitud->costo_estimado,
                'monto_validado' => $data['monto_validado'],
                'resultado' => $data['resultado'],
                'observaciones' => $data['observaciones'] ?? null,
                'fecha_liquidacion' => now(),
            ]);

            $this->workflow->transicionar($solicitud, EstadoSolicitudEnum::LIQUIDADA, User::findOrFail($userId), 'Liquidación registrada.', ['accion' => 'liquidar']);
            $this->registrarEvento($solicitud, 'LIQUIDAR', $userId, [
                'monto_validado' => $data['monto_validado'],
                'resultado' => $data['resultado'],
            ]);

            $solicitud->refresh();
        });
    }

    // ── Sugerencia ───────────────────────────────────────────────

    public function generarSugerencia(SolicitudMantenimiento $solicitud): ?ContratoMantenimiento
    {
        return ContratoMantenimiento::where('activo', true)
            ->where('monto_disponible', '>', 0)
            ->orderByDesc('monto_disponible')
            ->first();
    }

    // ── Asignación de recursos (operativo) ──────────────────────

    public function asignarRecursos(
        SolicitudMantenimiento $solicitud,
        int $userId,
        int $contratoId,
        ?string $justificacion = null
    ): array {
        if (! in_array($solicitud->estado, [EstadoSolicitudEnum::EN_REVISION, EstadoSolicitudEnum::PRE_APROBADA], true)) {
            throw new \DomainException('Solo se pueden asignar recursos a solicitudes en revisión o pre-aprobadas.');
        }

        return DB::transaction(function () use ($solicitud, $userId, $contratoId, $justificacion) {
            $sugerencia = $this->generarSugerencia($solicitud);

            $cambio = 'ninguno';
            if ($sugerencia && $sugerencia->id !== $contratoId) {
                $cambio = 'contrato';
            }

            DecisionOperativa::updateOrCreate(
                ['decidable_id' => $solicitud->id, 'decidable_type' => SolicitudMantenimiento::class],
                [
                    'usuario_operativo_id' => $userId,
                    'contrato_mantenimiento_final_id' => $contratoId,
                    'cambio_detectado' => $cambio,
                    'justificacion' => $cambio !== 'ninguno' ? $justificacion : null,
                ]
            );

            if ($solicitud->estado !== EstadoSolicitudEnum::PRE_APROBADA) {
                $this->workflow->transicionar($solicitud, EstadoSolicitudEnum::PRE_APROBADA, User::findOrFail($userId), $justificacion, ['accion' => 'asignar_recursos']);
            } else {
                $solicitud->save();
            }

            $this->registrarEvento($solicitud, AccionBitacoraEnum::ASIGNAR_RECURSOS->value, $userId, [
                'contrato_id' => $contratoId,
                'cambio_detectado' => $cambio,
            ]);

            return [
                'cambio_detectado' => $cambio,
                'estado_nuevo' => EstadoSolicitudEnum::PRE_APROBADA->value,
            ];
        });
    }

    // ── Aprobación con decisión (jefe) ─────────────────────────

    public function aprobarConDecision(
        SolicitudMantenimiento $solicitud,
        int $jefeId,
        string $decisionFinal,
        string $comentario,
        ?string $firma = null,
        ?int $contratoId = null
    ): array {
        if ($solicitud->solicitante_id === $jefeId) {
            throw new \DomainException('No puedes aprobar tu propia solicitud.');
        }

        if ($solicitud->estado !== EstadoSolicitudEnum::PRE_APROBADA) {
            throw new \DomainException('Solo se puede aprobar una solicitud en pre-aprobada.');
        }

        if (! in_array($decisionFinal, ['operativo', 'sistema', 'manual'])) {
            throw new \InvalidArgumentException('decision_final debe ser "operativo", "sistema" o "manual".');
        }

        return DB::transaction(function () use ($solicitud, $jefeId, $decisionFinal, $comentario, $firma, $contratoId) {
            if ($decisionFinal === 'manual') {
                if (! $contratoId) {
                    throw new \DomainException('Para decisión manual debe proporcionar un contrato.');
                }
                $c = ContratoMantenimiento::find($contratoId);
                if (! $c || ! $c->activo) {
                    throw new \DomainException('El contrato seleccionado no está activo.');
                }
                $solicitud->contrato_mantenimiento_id = $contratoId;
            } elseif ($decisionFinal === 'operativo') {
                $decision = $solicitud->decisionOperativa;
                if (! $decision) {
                    throw new \DomainException('No hay decisión operativa registrada.');
                }
                $solicitud->contrato_mantenimiento_id = $decision->contrato_mantenimiento_final_id;
            } else {
                $sugerido = $this->generarSugerencia($solicitud);
                if (! $sugerido) {
                    throw new \DomainException('No hay contratos disponibles para sugerir.');
                }
                $solicitud->contrato_mantenimiento_id = $sugerido->id;
            }

            $solicitud->aprobador_id = $jefeId;
            $solicitud->fecha_aprobacion = now();
            $solicitud->observaciones = $comentario;
            $solicitud->firma_aprobador = $firma;

            $this->workflow->transicionar($solicitud, EstadoSolicitudEnum::APROBADA, User::findOrFail($jefeId), $comentario, ['accion' => 'aprobar_con_decision']);

            $decisionLabels = [
                'operativo' => 'asignación previa del operativo',
                'sistema' => 'sugerencia del sistema',
                'manual' => 'asignación manual del jefe',
            ];
            $label = $decisionLabels[$decisionFinal] ?? $decisionFinal;
            $contrato = $solicitud->contratoMantenimiento;
            $cNombre = $contrato?->nombre ?? 'N/A';
            $comentarioEnriquecido = "Aprobado vía {$label}. Contrato: {$cNombre}";
            if ($comentario) {
                $comentarioEnriquecido .= ". Observación: {$comentario}";
            }

            $this->registrarEvento($solicitud, AccionBitacoraEnum::APROBAR->value, $jefeId, [
                'decision_final' => $decisionFinal,
                'contrato_id' => $solicitud->contrato_mantenimiento_id,
                'comentario' => $comentario,
            ]);

            return [
                'estado' => EstadoSolicitudEnum::APROBADA->value,
                'contrato_id' => $solicitud->contrato_mantenimiento_id,
            ];
        });
    }

    // ── Helpers ──────────────────────────────────────────

    private function registrarEvento(SolicitudMantenimiento $solicitud, string $accion, int $userId, ?array $extra = null): void
    {
        BitacoraEvento::create([
            'entidad_tipo' => 'solicitud_mantenimiento',
            'entidad_id' => $solicitud->id,
            'accion' => $accion,
            'user_id' => $userId,
            'datos_extras' => $extra,
        ]);
    }
}
