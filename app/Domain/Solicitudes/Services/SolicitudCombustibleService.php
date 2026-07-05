<?php

namespace App\Domain\Solicitudes\Services;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Models\BitacoraEvento;
use App\Models\ContratoCombustible;
use App\Models\DecisionOperativa;
use App\Models\HistorialEstado;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Services\SugerenciaAsignacionService;
use App\Models\SolicitudCombustible;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\SerieCarga;

class SolicitudCombustibleService
{
    // ── BORRADOR (Creación inicial) ─────────────────────────

    public function crear(array $data, int $userId): SolicitudCombustible
{
    return DB::transaction(function () use ($data, $userId) {

        $user = \App\Models\User::with('grupo')->findOrFail($userId);

        // ─────────────────────────────────────────────────────────────────
        // Lógica automática para motorista
        // ─────────────────────────────────────────────────────────────────

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

        // ─────────────────────────────────────────────────────────────────
        // Datos base
        // ─────────────────────────────────────────────────────────────────

        $data['solicitante_id'] = $userId;

        $data['estado'] = EstadoSolicitudEnum::BORRADOR;

        $data['cantidad_combustible'] =
            $data['cantidad_combustible'] ?? 0;

        $data['valor_unitario'] = 1;

        $data['valor_total'] =
            $data['cantidad_combustible'];

        // ─────────────────────────────────────────────────────────────────
        // Snapshot de prioridad del grupo
        // ─────────────────────────────────────────────────────────────────

        $grupo = $user->grupo;

        $data['prioridad_grupo'] =
            $grupo?->nivel_prioridad ?? 'baja';

        $data['prioridad_orden'] =
            $grupo?->orden ?? 999;

        // ─────────────────────────────────────────────────────────────────
        // Código correlativo
        // ─────────────────────────────────────────────────────────────────

        if (! isset($data['codigo'])) {
            $data['codigo'] = $this->generarCodigoCorrelativo();
        }

        // ─────────────────────────────────────────────────────────────────
        // Crear solicitud
        // ─────────────────────────────────────────────────────────────────

        $solicitud = SolicitudCombustible::create($data);

        // ─────────────────────────────────────────────────────────────────
        // Auditoría y bitácora
        // ─────────────────────────────────────────────────────────────────

        $this->registrarCambioEstado(
            $solicitud,
            null,
            $solicitud->estado,
            $userId,
            'Creación inicial de borrador.'
        );

        $this->registrarEvento(
            $solicitud,
            AccionBitacoraEnum::CREAR->value,
            $userId,
            [
                'prioridad_grupo'   => $solicitud->prioridad_grupo,
                'prioridad_orden'   => $solicitud->prioridad_orden,
                'grupo_solicitante' => $grupo?->nombre ?? 'Sin grupo',
            ]
        );

        Log::info('Solicitud de combustible creada', [
            'solicitud_id'      => $solicitud->id,
            'prioridad_grupo'   => $solicitud->prioridad_grupo,
            'prioridad_orden'   => $solicitud->prioridad_orden,
            'grupo'             => $grupo?->nombre,
            'usuario_id'        => $userId,
        ]);

        return $solicitud;
    });
}

    private function generarCodigoCorrelativo(): string
    {
        $anio = now()->year;
        $ultimo = SolicitudCombustible::whereYear('created_at', $anio)->count();

        return "CB-{$anio}-".str_pad($ultimo + 1, 6, '0', STR_PAD_LEFT);
    }

    // ── BORRADOR → PENDIENTE ────────────────────────────────

    public function enviarSolicitud(SolicitudCombustible $solicitud, int $userId): SolicitudCombustible
    {
        if ($solicitud->estado !== EstadoSolicitudEnum::BORRADOR) {
            throw new \DomainException('Solo se puede enviar una solicitud en estado Borrador.');
        }

        return DB::transaction(function () use ($solicitud, $userId) {
            $anterior = $solicitud->estado;

            $solicitud->estado = EstadoSolicitudEnum::PENDIENTE;
            $solicitud->save();

            $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $userId, null);
            $this->registrarEvento($solicitud, AccionBitacoraEnum::ENVIAR->value, $userId, null);

            // Enviar correo de notificación
            $this->enviarCorreoEnviada($solicitud);

            return $solicitud;
        });
    }

    // ── PENDIENTE / EN_REVISION → EN_REVISION ───────────────

    public function observar(SolicitudCombustible $solicitud, int $jefeId, ?string $comentario): SolicitudCombustible
    {
        if (! in_array($solicitud->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)) {
            throw new \DomainException('Solo se puede observar una solicitud en estado Pendiente o En Revisión.');
        }

        return DB::transaction(function () use ($solicitud, $jefeId, $comentario) {
            $anterior = $solicitud->estado;

            $solicitud->observaciones = $comentario;

            if ($solicitud->estado === EstadoSolicitudEnum::PENDIENTE) {
                $solicitud->estado = EstadoSolicitudEnum::EN_REVISION;
            }

            $solicitud->save();

            if ($anterior !== $solicitud->estado) {
                $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $jefeId, $comentario);
            }

            $this->registrarEvento($solicitud, AccionBitacoraEnum::OBSERVAR->value, $jefeId, ['comentario' => $comentario]);

            return $solicitud;
        });
    }

    // ── PENDIENTE / EN_REVISION → PRE_APROBADA ──────────────

    public function preAprobar(SolicitudCombustible $solicitud, int $jefeId): SolicitudCombustible
    {
        if (! in_array($solicitud->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)) {
            throw new \DomainException('Solo se puede pre-aprobar una solicitud Pendiente o En Revisión.');
        }

        return DB::transaction(function () use ($solicitud, $jefeId) {
            $anterior = $solicitud->estado;

            $solicitud->estado = EstadoSolicitudEnum::PRE_APROBADA;
            $solicitud->save();

            $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $jefeId, 'Solicitud pre-aprobada.');
            $this->registrarEvento($solicitud, AccionBitacoraEnum::PRE_APROBAR->value, $jefeId, null);

            return $solicitud;
        });
    }

    // ── PRE_APROBADA → APROBADA ─────────────────────────────

    public function aprobar(SolicitudCombustible $solicitud, int $jefeId, ?string $observaciones): SolicitudCombustible
    {
        if ($solicitud->estado !== EstadoSolicitudEnum::PRE_APROBADA) {
            throw new \DomainException('Solo se puede aprobar una solicitud Pre-Aprobada.');
        }

        return DB::transaction(function () use ($solicitud, $jefeId, $observaciones) {
            $anterior = $solicitud->estado;

            $solicitud->estado = EstadoSolicitudEnum::APROBADA;
            $solicitud->aprobador_id = $jefeId;
            $solicitud->fecha_aprobacion = now();
            $solicitud->observaciones = $observaciones;
            $solicitud->save();

            $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $jefeId, $observaciones);
            $this->registrarEvento($solicitud, AccionBitacoraEnum::APROBAR->value, $jefeId, ['observaciones' => $observaciones]);

            return $solicitud;
        });
    }

    // --- ASIGNADA -> LIQUIDADA
    // ── ASIGNADA → ENVIAR A REVISIÓN (Sin cambio de estado) ────────────────

    public function enviarALiquidador(SolicitudCombustible $solicitud, int $userId): SolicitudCombustible
    {
        // CAMBIO: Permitir estados que ya tienen vales (APROBADA con vales, ASIGNADA o COMPLETADA)
        // O simplemente validar que NO esté en estados iniciales
        $estadosPermitidos = [
            EstadoSolicitudEnum::ASIGNADA,
            EstadoSolicitudEnum::COMPLETADA,
        ];

        if (! in_array($solicitud->estado, $estadosPermitidos)) {
            throw new \DomainException('La solicitud debe estar en proceso de liquidación o asignada para realizar este envío.');
        }

        // Validación de comprobantes: Esta SÍ es crítica
        if (! $solicitud->tieneComprobantes()) {
            throw new \DomainException('No se puede enviar a liquidador sin adjuntar los comprobantes.');
        }

        return DB::transaction(function () use ($solicitud, $userId) {
            // Registramos el cambio (aunque el estado actual se mantenga)
            $this->registrarCambioEstado(
                $solicitud,
                $solicitud->estado,
                $solicitud->estado,
                $userId,
                'Traspaso administrativo: Solicitud enviada formalmente a revisión de liquidación.'
            );

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
        });
    }

    // Liquidar
    public function liquidar($record, $userId, $data): void
    {
        if (empty($record->comprobantes)) {
            throw new \DomainException('No se puede liquidar sin comprobantes.');
        }

        DB::transaction(function () use ($record, $userId, $data) {
            // Crea la liquidación usando la relación polimórfica
            $record->liquidacion()->create([
                'user_id' => $userId,
                'monto_solicitado' => $record->valor_total,
                'monto_validado' => $data['monto_validado'],
                'resultado' => $data['resultado'],
                'observaciones' => $data['observaciones'] ?? null,
                'fecha_liquidacion' => now(),
            ]);

            // Cambio de estado
            $anterior = $record->estado;
            $record->estado = EstadoSolicitudEnum::LIQUIDADA;
            $record->save();

            $this->registrarCambioEstado(
                $record,
                $anterior,
                $record->estado,
                $userId,
                'Liquidación realizada'
            );

            $this->registrarEvento($record, 'LIQUIDAR', $userId, [
                'monto_validado' => $data['monto_validado'],
                'resultado' => $data['resultado'],
            ]);

            $record->refresh();
            $this->enviarCorreoLiquidada($record);
        });
    }

    // ── APROBADA → ASIGNADA ─────────────────────────────────

    public function asignarVales(SolicitudCombustible $solicitud, int $userId, array $data): SolicitudCombustible
    {
        if ($solicitud->estado !== EstadoSolicitudEnum::APROBADA) {
            throw new \DomainException('Solo se pueden asignar cargas a una solicitud Aprobada.');
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
            $anterior = $solicitud->estado;

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
            $solicitud->estado = EstadoSolicitudEnum::ASIGNADA;
            $solicitud->save();

            // Avanzar correlativo en la serie
            $serie->correlativo_actual = $fin + 1;
            $serie->save();

            // Descontar del contrato
            $contrato->monto_disponible = (float) $contrato->monto_disponible - $montoAsignado;
            $contrato->save();

            $this->registrarCambioEstado(
                $solicitud, $anterior, $solicitud->estado, $userId,
                "Asignación de {$cantidadVales} cargas. Serie {$serie->nombre}. Rango {$inicio}-{$fin}. Monto: $".number_format($montoAsignado, 2)
            );

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

    // ── ASIGNADA → COMPLETADA ───────────────────────────────

    public function completar(SolicitudCombustible $solicitud, int $userId, array $data): SolicitudCombustible
    {
        if ($solicitud->estado !== EstadoSolicitudEnum::ASIGNADA) {
            throw new \DomainException('Solo se puede completar una solicitud con vales ya asignados.');
        }

        $comprobantesExistentes = $solicitud->comprobantes ?? [];
        $nuevosComprobantes = $data['comprobantes'] ?? [];
        $todosComprobantes = array_values(array_filter(array_merge($comprobantesExistentes, $nuevosComprobantes)));

        if (empty($todosComprobantes)) {
            throw new \DomainException('Debes subir al menos un comprobante antes de completar.');
        }

        return DB::transaction(function () use ($solicitud, $userId, $data, $todosComprobantes) {
            $anterior = $solicitud->estado;

            $solicitud->estado = EstadoSolicitudEnum::COMPLETADA;
            $solicitud->forma_pago = $data['forma_pago'] ?? null;
            $solicitud->numero_vale_ticket = $data['numero_vale_ticket'] ?? null;
            $solicitud->valor_unitario = $data['valor_unitario'] ?? $solicitud->valor_unitario;
            $solicitud->valor_total = $data['valor_total'] ?? $solicitud->valor_total;
            $solicitud->comprobantes = $todosComprobantes;
            $solicitud->save();

            $this->registrarCambioEstado(
                $solicitud, $anterior, $solicitud->estado, $userId,
                'Completado por usuario. Forma de pago: '.($data['forma_pago'] ?? 'N/A')
            );

            $this->registrarEvento($solicitud, AccionBitacoraEnum::COMPLETAR->value, $userId, [
                'forma_pago' => $data['forma_pago'] ?? null,
                'numero_vale_ticket' => $data['numero_vale_ticket'] ?? null,
                'valor_total' => $data['valor_total'] ?? null,
            ]);

            $this->enviarCorreoCompletada($solicitud);

            return $solicitud;
        });
    }

    // ── PENDIENTE / EN_REVISION / PRE_APROBADA → RECHAZADA ──

    public function rechazar(SolicitudCombustible $solicitud, int $jefeId, string $motivo): SolicitudCombustible
    {
        if (! in_array($solicitud->estado, [
            EstadoSolicitudEnum::PENDIENTE,
            EstadoSolicitudEnum::EN_REVISION,
            EstadoSolicitudEnum::PRE_APROBADA,
        ], true)) {
            throw new \DomainException('No se puede rechazar una solicitud en este estado.');
        }

        return DB::transaction(function () use ($solicitud, $jefeId, $motivo) {
            $anterior = $solicitud->estado;

            $solicitud->estado = EstadoSolicitudEnum::RECHAZADA;
            $solicitud->motivo_rechazo = $motivo;
            $solicitud->aprobador_id = $jefeId;
            $solicitud->fecha_aprobacion = now();
            $solicitud->save();

            $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $jefeId, $motivo);
            $this->registrarEvento($solicitud, AccionBitacoraEnum::RECHAZAR->value, $jefeId, ['motivo' => $motivo]);

            $this->enviarCorreoRechazada($solicitud);

            return $solicitud;
        });
    }

    // ── MÓDULO DE APROBACIÓN (POLIMÓRFICO CON DECISIONOPERATIVA) ──

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
        if (!in_array($solicitud->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION])) {
            throw new \DomainException('Solo se puede asignar carga a solicitudes pendientes o en revisión.');
        }

        return DB::transaction(function () use ($solicitud, $userId, $montoAprobado, $justificacion) {
            $anterior = $solicitud->estado;

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

            $solicitud->estado = EstadoSolicitudEnum::PRE_APROBADA;
            $solicitud->save();

            $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $userId, 'Carga asignada, pasa a pre-aprobación.');
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
        if ($solicitud->estado !== EstadoSolicitudEnum::PRE_APROBADA) {
            throw new \DomainException('Solo se puede aprobar una solicitud en pre-aprobada.');
        }

        if (!in_array($decisionFinal, ['operativo', 'jefe'])) {
            throw new \InvalidArgumentException('decision_final debe ser "operativo" o "jefe".');
        }

        return DB::transaction(function () use ($solicitud, $jefeId, $decisionFinal, $montoAprobado, $comentario) {
            $anterior = $solicitud->estado;
            $montoOriginal = $solicitud->decisionOperativa?->monto_aprobado;

            if ($decisionFinal === 'operativo') {
                $decision = $solicitud->decisionOperativa;
                if (!$decision) {
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
            $solicitud->estado = EstadoSolicitudEnum::APROBADA;
            $solicitud->aprobador_id = $jefeId;
            $solicitud->fecha_aprobacion = now();
            $solicitud->observaciones = $comentario;
            $solicitud->save();

            if ($decisionFinal === 'jefe' && $montoOriginal !== null && $montoOriginal != $montoAprobado) {
                $solicitud->decisionOperativa->update(['monto_aprobado' => $montoAprobado]);

                $detalle = \App\Models\AsignacionCombustibleLoteDetalle::where('solicitud_combustible_id', $solicitud->id)->first();
                if ($detalle) {
                    $detalle->update(['monto_asignado' => $montoAprobado]);
                    $obs = trim(($detalle->observaciones_operativas ?? '') . "\nEl jefe reasignó el monto de \${$montoOriginal} a \${$montoAprobado}.");
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
            if ($comentario) $comentarioEnriquecido .= ". Observación: {$comentario}";

            $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $jefeId, $comentarioEnriquecido);
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

    // ── DESBLOQUEAR ─────────────────────────────────────────

    public function desbloquear(SolicitudCombustible $solicitud, int $userId): array
    {
        if (!in_array($solicitud->estado, [
            EstadoSolicitudEnum::PRE_APROBADA,
            EstadoSolicitudEnum::APROBADA,
            EstadoSolicitudEnum::RECHAZADA,
        ], true)) {
            throw new \DomainException('Solo se puede desbloquear una solicitud pre-aprobada, aprobada o rechazada.');
        }

        return DB::transaction(function () use ($solicitud, $userId) {
            $anterior = $solicitud->estado;

            $solicitud->estado = EstadoSolicitudEnum::PENDIENTE;
            $solicitud->aprobador_id = null;
            $solicitud->fecha_aprobacion = null;
            $solicitud->observaciones = null;
            $solicitud->save();

            $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $userId,
                'Solicitud desbloqueada para re-asignación.');
            $this->registrarEvento($solicitud, AccionBitacoraEnum::DESBLOQUEAR->value, $userId);

            return [
                'message' => "Solicitud {$solicitud->codigo} desbloqueada para re-asignación.",
                'estado_nuevo' => EstadoSolicitudEnum::PENDIENTE->value,
            ];
        });
    }

    // ── BORRADOR / PENDIENTE → CANCELADA ────────────────────

    public function cancelar(SolicitudCombustible $solicitud, int $userId, ?string $motivoCancelacion = null): SolicitudCombustible
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

            $this->enviarCorreoCancelada($solicitud);

            return $solicitud;
        });
    }

    // ── Helpers privados ────────────────────────────────────

    private function registrarCambioEstado(SolicitudCombustible $solicitud, $anterior, $nuevo, int $userId, ?string $comentario): void
    {
        HistorialEstado::create([
            'entidad_tipo' => 'solicitud_combustible',
            'entidad_id' => $solicitud->id,
            'estado_anterior' => $anterior?->value ?? (string) $anterior,
            'estado_nuevo' => $nuevo?->value ?? (string) $nuevo,
            'user_id' => $userId,
            'comentario' => $comentario,
        ]);
    }

    // Public para que pueda ser accesible
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

    // ── Correos ──────────────────────────────────────────

    private function enviarCorreoEnviada(SolicitudCombustible $solicitud): void
    {
        app(SolicitudEmailDispatchService::class)->toSolicitante(
            $solicitud, 'combustible', 'solicitud_enviada'
        );
    }

    private function enviarCorreoRechazada(SolicitudCombustible $solicitud): void
    {
        app(SolicitudEmailDispatchService::class)->toSolicitante(
            $solicitud, 'combustible', 'solicitud_rechazada'
        );
    }

    private function enviarCorreoCancelada(SolicitudCombustible $solicitud): void
    {
        app(SolicitudEmailDispatchService::class)->toSolicitante(
            $solicitud, 'combustible', 'solicitud_cancelada'
        );
    }

    private function enviarCorreoCompletada(SolicitudCombustible $solicitud): void
    {
        app(SolicitudEmailDispatchService::class)->toSolicitante(
            $solicitud, 'combustible', 'solicitud_completada'
        );
    }

    private function enviarCorreoLiquidada(SolicitudCombustible $solicitud): void
    {
        app(SolicitudEmailDispatchService::class)->toSolicitante(
            $solicitud, 'combustible', 'solicitud_liquidada',
            attachments: $solicitud->comprobantes ?? []
        );
    }
}
