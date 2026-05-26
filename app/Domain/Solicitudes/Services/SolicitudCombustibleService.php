<?php

namespace App\Domain\Solicitudes\Services;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Mail\NotificacionEventMail;
use App\Models\BitacoraEvento;
use App\Models\ContratoCombustible;
use App\Models\HistorialEstado;
use App\Models\SolicitudCombustible;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

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

        $data['valor_unitario'] =
            $data['valor_unitario'] ?? 0;

        $data['valor_total'] =
            $data['valor_total'] ?? 0;

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

            return $solicitud;
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

    // Enviar correo cuando se envía la solicitud (borrador -> pendiente)
    private function enviarCorreoEnviada(SolicitudCombustible $solicitud): void
    {
        try {
            $solicitud->load(['vehiculo', 'motorista', 'solicitante']);

            $payload = [
                'tipo' => 'combustible',
                'evento' => 'solicitud_enviada',
                'mensaje' => 'Tu solicitud de combustible ha sido ENVIADA y está pendiente de revisión.',
                'solicitud' => [
                    'codigo' => $solicitud->codigo,
                    'estado' => 'pendiente',
                    'vehiculo' => $solicitud->vehiculo?->placa ?? 'N/A',
                    'motorista' => $solicitud->motorista?->nombre ?? 'N/A',
                    'cantidad_combustible' => $solicitud->cantidad_combustible,
                    'valor_total' => $solicitud->valor_total,
                ],
                'solicitante' => [
                    'name' => $solicitud->solicitante?->name,
                    'email' => $solicitud->solicitante?->email,
                ],
                'timestamp' => now()->toIso8601String(),
            ];

            Mail::to($solicitud->solicitante?->email)->send(
                new NotificacionEventMail('📤 Solicitud de Combustible ENVIADA', $payload)
            );
        } catch (\Exception $e) {
            Log::error('Error enviando correo de envío combustible: '.$e->getMessage());
        }
    }
}
