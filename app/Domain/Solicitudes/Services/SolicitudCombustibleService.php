<?php

namespace App\Domain\Solicitudes\Services;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Events\SolicitudEstadoCambiado;
use App\Models\BitacoraEvento;
use App\Models\ContratoCombustible;
use App\Models\DecisionOperativa;
use App\Models\SerieCarga;
use App\Models\SolicitudCombustible;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SolicitudCombustibleService
{
    public function __construct(
        private SolicitudWorkflowService $workflow,
    ) {}

    // ── BORRADOR (Creación inicial) ─────────────────────────

    public function crear(array $data, int $userId): SolicitudCombustible
    {
        return DB::transaction(function () use ($data, $userId) {
            $user = \App\Models\User::with('grupo')->findOrFail($userId);

            if (! isset($data['motorista_id'])) {
                $asignacion = \App\Models\AsignacionVehiculoMotorista::where(
                    'vehiculo_id',
                    $data['vehiculo_id']
                )
                    ->where('vigente', true)
                    ->first();

                if (! $asignacion) {
                    throw new \DomainException(
                        'No se puede crear la solicitud: El vehículo seleccionado no tiene un motorista asignado actualmente.'
                    );
                }

                $data['motorista_id'] = $asignacion->motorista_id;
            }

            $data['solicitante_id'] = $userId;
            $data['estado'] = EstadoSolicitudEnum::BORRADOR;
            $data['cantidad_combustible'] = $data['cantidad_combustible'] ?? 0;
            $data['valor_unitario'] = 1;
            $data['valor_total'] = $data['cantidad_combustible'];

            $grupo = $user->grupo;
            $data['prioridad_grupo'] = $grupo?->nivel_prioridad ?? 'baja';
            $data['prioridad_orden'] = $grupo?->orden ?? 999;

            if (! isset($data['codigo'])) {
                $data['codigo'] = $this->generarCodigoCorrelativo();
            }

            $solicitud = SolicitudCombustible::create($data);

            SolicitudEstadoCambiado::dispatch(
                $solicitud,
                null,
                EstadoSolicitudEnum::BORRADOR,
                User::findOrFail($userId),
                ['comentario' => 'Creación inicial de borrador.', 'accion' => 'crear'],
            );

            $this->registrarEvento($solicitud, AccionBitacoraEnum::CREAR->value, $userId, [
                'prioridad_grupo' => $solicitud->prioridad_grupo,
                'prioridad_orden' => $solicitud->prioridad_orden,
                'grupo_solicitante' => $grupo?->nombre ?? 'Sin grupo',
            ]);

            Log::info('Solicitud de combustible creada', [
                'solicitud_id' => $solicitud->id,
                'prioridad_grupo' => $solicitud->prioridad_grupo,
                'prioridad_orden' => $solicitud->prioridad_orden,
                'grupo' => $grupo?->nombre,
                'usuario_id' => $userId,
            ]);

            return $solicitud;
        });
    }

    private function generarCodigoCorrelativo(): string
    {
        $anio = now()->year;
        $ultimo = SolicitudCombustible::whereYear('created_at', $anio)
            ->latest('id')
            ->lockForUpdate()
            ->first();
        $numero = $ultimo ? ((int) substr($ultimo->codigo, -6)) + 1 : 1;

        return "CB-{$anio}-".str_pad($numero, 6, '0', STR_PAD_LEFT);
    }

    public function enviarSolicitud(SolicitudCombustible $solicitud, int $userId): SolicitudCombustible
    {
        $this->workflow->enviar($solicitud, User::findOrFail($userId));
        $this->registrarEvento($solicitud, AccionBitacoraEnum::ENVIAR->value, $userId, null);

        return $solicitud;
    }

    public function observar(SolicitudCombustible $solicitud, int $jefeId, ?string $comentario): SolicitudCombustible
    {
        $solicitud->observaciones = $comentario;

        $this->workflow->observar($solicitud, User::findOrFail($jefeId), $comentario);
        $this->registrarEvento($solicitud, AccionBitacoraEnum::OBSERVAR->value, $jefeId, ['comentario' => $comentario]);

        return $solicitud;
    }

    public function preAprobar(SolicitudCombustible $solicitud, int $jefeId): SolicitudCombustible
    {
        $this->workflow->transicionar($solicitud, EstadoSolicitudEnum::PRE_APROBADA, User::findOrFail($jefeId), 'Solicitud pre-aprobada.', ['accion' => 'pre_aprobar']);
        $this->registrarEvento($solicitud, AccionBitacoraEnum::PRE_APROBAR->value, $jefeId, null);

        return $solicitud;
    }

    public function aprobar(SolicitudCombustible $solicitud, int $jefeId, ?string $observaciones): SolicitudCombustible
    {
        $solicitud->aprobador_id = $jefeId;
        $solicitud->fecha_aprobacion = now();
        $solicitud->observaciones = $observaciones;

        $this->workflow->transicionar($solicitud, EstadoSolicitudEnum::APROBADA, User::findOrFail($jefeId), $observaciones, ['accion' => 'aprobar']);
        $this->registrarEvento($solicitud, AccionBitacoraEnum::APROBAR->value, $jefeId, ['observaciones' => $observaciones]);

        return $solicitud;
    }

    public function enviarALiquidador(SolicitudCombustible $solicitud, int $userId): SolicitudCombustible
    {
        $estadosPermitidos = [
            EstadoSolicitudEnum::ASIGNADA,
            EstadoSolicitudEnum::COMPLETADA,
        ];

        if (! in_array($solicitud->estado, $estadosPermitidos)) {
            throw new \DomainException('La solicitud debe estar en proceso de liquidación o asignada para realizar este envío.');
        }

        if (! $solicitud->tieneComprobantes()) {
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

    public function liquidar($record, $userId, $data): void
    {
        if (empty($record->comprobantes)) {
            throw new \DomainException('No se puede liquidar sin comprobantes.');
        }

        $this->verificarNoEnLoteActivo($record, 'liquidar');

        DB::transaction(function () use ($record, $userId, $data) {
            $record->liquidacion()->create([
                'user_id' => $userId,
                'monto_solicitado' => $record->valor_total,
                'monto_validado' => $data['monto_validado'],
                'resultado' => $data['resultado'],
                'observaciones' => $data['observaciones'] ?? null,
                'fecha_liquidacion' => now(),
            ]);

            $this->workflow->transicionar($record, EstadoSolicitudEnum::LIQUIDADA, User::findOrFail($userId), 'Liquidación realizada', ['accion' => 'liquidar']);
            $this->registrarEvento($record, 'LIQUIDAR', $userId, [
                'monto_validado' => $data['monto_validado'],
                'resultado' => $data['resultado'],
            ]);

            $record->refresh();
        });
    }

    public function asignarVales(SolicitudCombustible $solicitud, int $userId, array $data): SolicitudCombustible
    {
        $this->verificarNoEnLoteActivo($solicitud, 'asignar vales');

        if ($solicitud->estado !== EstadoSolicitudEnum::APROBADA) {
            $current = $solicitud->estado?->value ?? $solicitud->estado;
            $guia = match ($solicitud->estado) {
                EstadoSolicitudEnum::ASIGNADA => 'Ya tiene vales/cargas asignadas. Revisa el historial de la solicitud para ver los detalles de la asignación.',
                EstadoSolicitudEnum::COMPLETADA => 'La solicitud ya fue completada por el solicitante. No requiere asignación de vales.',
                EstadoSolicitudEnum::EN_REVISION => 'La solicitud aún está en revisión. El jefe debe aprobarla primero antes de asignar vales.',
                EstadoSolicitudEnum::RECHAZADA => 'La solicitud fue rechazada. No se pueden asignar vales a solicitudes rechazadas.',
                EstadoSolicitudEnum::CANCELADA => 'La solicitud fue cancelada. No se pueden asignar vales a solicitudes canceladas.',
                default => 'La solicitud no está en estado Aprobada. Verifica el estado actual antes de continuar.',
            };
            throw new \DomainException("La solicitud {$solicitud->codigo} está en estado \"{$current}\". {$guia}");
        }

        $contrato = ContratoCombustible::findOrFail($data['contrato_id']);
        $serie = SerieCarga::findOrFail($data['serie_vale_id']);

        if ((int) $serie->contrato_id !== (int) $contrato->id) {
            throw new \DomainException('La serie seleccionada no pertenece al contrato indicado.');
        }

        if (! $contrato->activo) {
            throw new \DomainException('El contrato seleccionado no está activo.');
        }

        if (! $serie->activo) {
            throw new \DomainException('La serie seleccionada no está activa.');
        }

        $cantidadVales = (int) ($data['cantidad_vales'] ?? 0);

        if ($cantidadVales <= 0) {
            throw new \DomainException('La cantidad de cargas debe ser mayor a cero.');
        }

        $inicio = $serie->correlativo_actual ?: $serie->correlativo_inicio;
        $fin = $inicio + $cantidadVales - 1;

        if ($fin > $serie->correlativo_fin) {
            throw new \DomainException('La serie no tiene suficientes cargas disponibles.');
        }

        $valorUnitario = (float) $serie->valor;
        $montoAsignado = $cantidadVales * $valorUnitario;

        if ((float) $contrato->monto_disponible < $montoAsignado) {
            throw new \DomainException('El contrato no tiene presupuesto suficiente para esta asignación.');
        }

        return DB::transaction(function () use (
            $solicitud, $userId, $contrato, $serie,
            $cantidadVales, $inicio, $fin, $valorUnitario, $montoAsignado
        ) {
            $solicitud->contrato_id = $contrato->id;
            $solicitud->serie_vale_id = $serie->id;
            $solicitud->correlativo_inicio = $inicio;
            $solicitud->correlativo_fin = $fin;
            $solicitud->cantidad_vales = $cantidadVales;
            $solicitud->valor_unitario_vale = $valorUnitario;
            $solicitud->monto_asignado = $montoAsignado;
            $solicitud->valor_total = $montoAsignado;
            $solicitud->fecha_asignacion = now();
            $solicitud->asignado_por = $userId;

            $this->workflow->transicionar($solicitud, EstadoSolicitudEnum::ASIGNADA, User::findOrFail($userId), "Asignación de {$cantidadVales} cargas. Serie {$serie->nombre}. Rango {$inicio}-{$fin}. Monto: $".number_format($montoAsignado, 2), ['accion' => 'asignar']);

            $serie->correlativo_actual = $fin + 1;
            $serie->save();

            $contrato->monto_disponible = (float) $contrato->monto_disponible - $montoAsignado;
            $contrato->save();

            $this->registrarEvento($solicitud, AccionBitacoraEnum::ASIGNAR->value, $userId, [
                'contrato_id' => $contrato->id,
                'serie_vale_id' => $serie->id,
                'serie' => $serie->nombre,
                'cantidad_vales' => $cantidadVales,
                'correlativo_inicio' => $inicio,
                'correlativo_fin' => $fin,
                'valor_unitario_vale' => $valorUnitario,
                'monto_asignado' => $montoAsignado,
            ]);

            return $solicitud;
        });
    }

    public function completar(SolicitudCombustible $solicitud, int $userId, array $data): SolicitudCombustible
    {
        $comprobantesExistentes = $solicitud->comprobantes ?? [];
        $nuevosComprobantes = $data['comprobantes'] ?? [];
        $todosComprobantes = array_values(array_filter(array_merge($comprobantesExistentes, $nuevosComprobantes)));

        if (empty($todosComprobantes)) {
            throw new \DomainException('Debes subir al menos un comprobante antes de completar.');
        }

        $this->verificarNoEnLoteActivo($solicitud, 'completar');

        return DB::transaction(function () use ($solicitud, $userId, $data, $todosComprobantes) {
            $solicitud->forma_pago = $data['forma_pago'] ?? null;
            $solicitud->numero_vale_ticket = $data['numero_vale_ticket'] ?? null;
            $solicitud->valor_unitario = $data['valor_unitario'] ?? $solicitud->valor_unitario;
            $solicitud->valor_total = $data['valor_total'] ?? $solicitud->valor_total;
            $solicitud->comprobantes = $todosComprobantes;

            $this->workflow->transicionar($solicitud, EstadoSolicitudEnum::COMPLETADA, User::findOrFail($userId), 'Completado por usuario. Forma de pago: '.($data['forma_pago'] ?? 'N/A'), ['accion' => 'completar']);
            $this->registrarEvento($solicitud, AccionBitacoraEnum::COMPLETAR->value, $userId, [
                'forma_pago' => $data['forma_pago'] ?? null,
                'numero_vale_ticket' => $data['numero_vale_ticket'] ?? null,
                'valor_total' => $data['valor_total'] ?? null,
            ]);

            \App\Jobs\RecordatorioLiquidacionJob::dispatch($solicitud, 'combustible')
                ->delay(now()->addHours(2));

            return $solicitud;
        });
    }

    public function rechazar(SolicitudCombustible $solicitud, int $jefeId, string $motivo): SolicitudCombustible
    {
        $this->verificarNoEnLoteActivo($solicitud, 'rechazar');

        $solicitud->motivo_rechazo = $motivo;
        $solicitud->aprobador_id = $jefeId;
        $solicitud->fecha_aprobacion = now();

        $this->workflow->rechazar($solicitud, User::findOrFail($jefeId), $motivo);
        $this->registrarEvento($solicitud, AccionBitacoraEnum::RECHAZAR->value, $jefeId, ['motivo' => $motivo]);

        return $solicitud;
    }

    public function comparativa(SolicitudCombustible $solicitud): array
    {
        $solicitud->load(['vehiculo.ultimaRecepcionEntrega', 'solicitante', 'vehiculo.vehModelo']);
        $decision = $solicitud->decisionOperativa;
        $u = $solicitud->vehiculo?->ultimaRecepcionEntrega;

        return [
            'solicitud' => [
                'id' => $solicitud->id,
                'codigo' => $solicitud->codigo,
                'solicitante' => $solicitud->solicitante?->name ?? 'Desconocido',
                'vehiculo' => $solicitud->vehiculo?->vehModelo?->nombre ?? 'Vehículo',
                'placa' => $solicitud->vehiculo?->placa ?? '—',
                'fecha_solicitud' => $solicitud->created_at?->toIso8601String(),
                'motivo' => $solicitud->observaciones ?? $solicitud->destino_actividad ?? 'Sin motivo registrado',
                'estado' => $solicitud->estado->value,
                'decision_final' => $solicitud->decision_final ?? null,
                'comentario_jefe' => $solicitud->comentario_jefe ?? null,
            ],
            'operativo' => $decision ? [
                'autor' => $decision->usuarioOperativo?->name ?? 'Operaciones',
                'monto_aprobado' => (float) $decision->monto_aprobado,
                'justificacion' => $decision->justificacion ?? 'Sin justificación',
            ] : null,
        ];
    }

    public function asignarCarga(
        SolicitudCombustible $solicitud,
        int $userId,
        float $montoAprobado,
        ?string $justificacion = null
    ): array {
        $this->verificarNoEnLoteActivo($solicitud, 'asignar carga operativa');

        return DB::transaction(function () use ($solicitud, $userId, $montoAprobado, $justificacion) {
            DecisionOperativa::updateOrCreate(
                [
                    'decidable_id' => $solicitud->id,
                    'decidable_type' => SolicitudCombustible::class,
                ],
                [
                    'usuario_operativo_id' => $userId,
                    'monto_aprobado' => $montoAprobado,
                    'cambio_detectado' => 'ninguno',
                    'justificacion' => $justificacion,
                ]
            );

            $this->workflow->transicionar($solicitud, EstadoSolicitudEnum::PRE_APROBADA, User::findOrFail($userId), 'Carga asignada, pasa a pre-aprobación.', ['accion' => 'asignar_carga']);
            $this->registrarEvento($solicitud, AccionBitacoraEnum::ASIGNAR_RECURSOS->value, $userId, [
                'monto_aprobado' => $montoAprobado,
            ]);

            return [
                'monto_aprobado' => $montoAprobado,
                'estado' => EstadoSolicitudEnum::PRE_APROBADA->value,
            ];
        });
    }

    public function aprobarConDecision(
        SolicitudCombustible $solicitud,
        int $jefeId,
        string $decisionFinal,
        ?float $montoAprobado = null,
        ?string $comentario = null
    ): array {
        return DB::transaction(function () use ($solicitud, $jefeId, $decisionFinal, $montoAprobado, $comentario) {
            $montoOriginal = $solicitud->decisionOperativa?->monto_aprobado;

            if ($decisionFinal === 'operativo') {
                $decision = $solicitud->decisionOperativa;
                if (! $decision) {
                    throw new \DomainException('No hay asignación del operativo registrada.');
                }
                $solicitud->cantidad_combustible = $decision->monto_aprobado;
            } else {
                if ($montoAprobado === null || $montoAprobado <= 0) {
                    throw new \DomainException('Debe especificar un monto aprobado válido.');
                }
                $solicitud->cantidad_combustible = $montoAprobado;
            }

            $solicitud->valor_total = $solicitud->cantidad_combustible;
            $solicitud->aprobador_id = $jefeId;
            $solicitud->fecha_aprobacion = now();
            $solicitud->observaciones = $comentario;

            $this->workflow->transicionar($solicitud, EstadoSolicitudEnum::APROBADA, User::findOrFail($jefeId), $comentario, ['accion' => 'aprobar_con_decision']);

            if ($decisionFinal === 'jefe' && $montoOriginal !== null && $montoOriginal != $montoAprobado) {
                $solicitud->decisionOperativa->update(['monto_aprobado' => $montoAprobado]);

                $detalle = \App\Models\AsignacionCombustibleLoteDetalle::where('solicitud_combustible_id', $solicitud->id)->first();
                if ($detalle) {
                    $detalle->update(['monto_asignado' => $montoAprobado]);
                    $obs = trim(($detalle->observaciones_operativas ?? '')."\nEl jefe reasignó el monto de \${$montoOriginal} a \${$montoAprobado}.");
                    $detalle->update(['observaciones_operativas' => $obs]);
                }
            }

            $montoFinal = $solicitud->cantidad_combustible;
            $comentarioEnriquecido = match ($decisionFinal) {
                'operativo' => "Aprobado con monto sugerido por el operativo: \${$montoFinal}",
                'jefe' => ($montoOriginal !== null && $montoOriginal != $montoAprobado)
                    ? "Aprobado por el jefe. Monto ajustado de \${$montoOriginal} a \${$montoAprobado}"
                    : "Aprobado por el jefe. Monto: \${$montoFinal}",
                default => 'Aprobado',
            };
            if ($comentario) {
                $comentarioEnriquecido .= ". Observación: {$comentario}";
            }

            $this->registrarEvento($solicitud, AccionBitacoraEnum::APROBAR->value, $jefeId, [
                'decision_final' => $decisionFinal,
                'monto_aprobado' => $solicitud->cantidad_combustible,
            ]);

            if ($montoOriginal !== null && $montoOriginal != $montoAprobado) {
                $this->registrarEvento($solicitud, AccionBitacoraEnum::ACTUALIZACION->value, $jefeId, [
                    'campo' => 'monto_aprobado (DecisionOperativa)',
                    'valor_anterior' => $montoOriginal,
                    'valor_nuevo' => $montoAprobado,
                    'motivo' => 'El Jefe modificó el monto sugerido por el Operativo',
                ]);
            }

            return [
                'success' => true,
                'estado_final' => EstadoSolicitudEnum::APROBADA->value,
                'monto_aprobado' => $solicitud->cantidad_combustible,
            ];
        });
    }

    public function desbloquear(SolicitudCombustible $solicitud, int $userId): array
    {
        $this->verificarNoEnLoteActivo($solicitud, 'desbloquear');

        return DB::transaction(function () use ($solicitud, $userId) {
            $solicitud->aprobador_id = null;
            $solicitud->fecha_aprobacion = null;
            $solicitud->observaciones = null;

            $this->workflow->transicionar($solicitud, EstadoSolicitudEnum::PENDIENTE, User::findOrFail($userId), 'Solicitud desbloqueada para re-asignación.', ['accion' => 'desbloquear']);
            $this->registrarEvento($solicitud, AccionBitacoraEnum::DESBLOQUEAR->value, $userId);

            return [
                'message' => "Solicitud {$solicitud->codigo} desbloqueada para re-asignación.",
                'estado_nuevo' => EstadoSolicitudEnum::PENDIENTE->value,
            ];
        });
    }

    public function cancelar(SolicitudCombustible $solicitud, int $userId, ?string $motivoCancelacion = null): SolicitudCombustible
    {
        if ($solicitud->solicitante_id !== $userId) {
            throw new \DomainException('Solo el solicitante puede cancelar esta solicitud.');
        }

        $this->verificarNoEnLoteActivo($solicitud, 'cancelar');

        $solicitud->motivo_cancelacion = $motivoCancelacion;

        $this->workflow->cancelar($solicitud, User::findOrFail($userId), $motivoCancelacion);
        $this->registrarEvento($solicitud, AccionBitacoraEnum::CANCELAR->value, $userId, [
            'motivo_cancelacion' => $motivoCancelacion,
        ]);

        return $solicitud;
    }

    // ── Helpers ──────────────────────────────────────────

    private function verificarNoEnLoteActivo(SolicitudCombustible $solicitud, string $accion): void
    {
        if ($solicitud->estaEnLoteActivo()) {
            throw new \DomainException(
                "No se puede {$accion} la solicitud {$solicitud->codigo}: está siendo procesada en un Lote de combustible activo."
            );
        }
    }

    public function registrarEvento(SolicitudCombustible $solicitud, string $accion, int $userId, ?array $extra = null): void
    {
        BitacoraEvento::create([
            'entidad_tipo' => 'solicitud_combustible',
            'entidad_id' => $solicitud->id,
            'accion' => $accion,
            'user_id' => $userId,
            'datos_extras' => $extra,
        ]);
    }
}
