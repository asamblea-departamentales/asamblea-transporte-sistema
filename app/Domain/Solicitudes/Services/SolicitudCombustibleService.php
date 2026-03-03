<?php

namespace App\Domain\Solicitudes\Services;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\BitacoraEvento;
use App\Models\HistorialEstado;
use App\Models\SolicitudCombustible;
use Illuminate\Support\Facades\DB;

class SolicitudCombustibleService
{
// BORRADOR (Creación inicial)
public function crear(array $data, int $userId): SolicitudCombustible
{
    return DB::transaction(function () use ($data, $userId) {
        // 1. Lógica Automática para Motorista
        if (!isset($data['motorista_id'])) {
            $asignacion = \App\Models\AsignacionVehiculoMotorista::where('vehiculo_id', $data['vehiculo_id'])
                ->where('vigente', true)
                ->first();

            // Si no hay motorista asignado al vehículo, lanzamos excepción clara
            if (!$asignacion) {
                throw new \DomainException('No se puede crear la solicitud: El vehículo seleccionado no tiene un motorista asignado actualmente.');
            }

            $data['motorista_id'] = $asignacion->motorista_id;
        }

        // 2. Valores por defecto para evitar errores de base de datos (Error 1364)
        $data['solicitante_id'] = $userId;
        $data['estado'] = EstadoSolicitudEnum::BORRADOR;
        $data['cantidad_combustible'] = $data['cantidad_combustible'] ?? 0;
        $data['valor_unitario'] = $data['valor_unitario'] ?? 0;
        $data['valor_total'] = $data['valor_total'] ?? 0;
        
        // 3. Generar código único (ej: CB-2026-0001) si no viene en el data
        if (!isset($data['codigo'])) {
            $data['codigo'] = $this->generarCodigoCorrelativo();
        }

        $solicitud = SolicitudCombustible::create($data);

        // 4. Bitácora inicial
        $this->registrarCambioEstado($solicitud, null, $solicitud->estado, $userId, 'Creación inicial de borrador.');
        $this->registrarEvento($solicitud, 'CREAR_BORRADOR', $userId, null);

        return $solicitud;
    });
}

// Helper para el código correlativo
private function generarCodigoCorrelativo(): string
{
    $anio = now()->year;
    $ultimo = SolicitudCombustible::whereYear('created_at', $anio)->count();
    return "CB-{$anio}-" . str_pad($ultimo + 1, 6, '0', STR_PAD_LEFT);
}

    // BORRADOR → PENDIENTE
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

            return $solicitud;
        });
    }

    // PENDIENTE / EN_REVISION → EN_REVISION
    public function observar(SolicitudCombustible $solicitud, int $jefeId, ?string $comentario): SolicitudCombustible
    {
        if (!in_array($solicitud->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)) {
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

    // PENDIENTE / EN_REVISION → PRE_APROBADA
    public function preAprobar(SolicitudCombustible $solicitud, int $jefeId): SolicitudCombustible
    {
        if (!in_array($solicitud->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)) {
            throw new \DomainException('Solo se puede pre-aprobar una solicitud Pendiente o En Revisión.');
        }

        return DB::transaction(function () use ($solicitud, $jefeId) {
            $anterior = $solicitud->estado;

            $solicitud->estado = EstadoSolicitudEnum::PRE_APROBADA;
            $solicitud->save();

            $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $jefeId, 'Solicitud pre-aprobada.');
            $this->registrarEvento($solicitud, 'PRE_APROBAR', $jefeId, null);

            return $solicitud;
        });
    }

    // PRE_APROBADA → APROBADA
    public function aprobar(SolicitudCombustible $solicitud, int $jefeId, ?string $observaciones): SolicitudCombustible
    {
        if ($solicitud->estado !== EstadoSolicitudEnum::PRE_APROBADA) {
            throw new \DomainException('Solo se puede aprobar una solicitud Pre-Aprobada.');
        }

        return DB::transaction(function () use ($solicitud, $jefeId, $observaciones) {
            $anterior = $solicitud->estado;

            $solicitud->estado           = EstadoSolicitudEnum::APROBADA;
            $solicitud->aprobador_id     = $jefeId;
            $solicitud->fecha_aprobacion = now();
            $solicitud->observaciones    = $observaciones;
            $solicitud->save();

            $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $jefeId, $observaciones);
            $this->registrarEvento($solicitud, AccionBitacoraEnum::APROBAR->value, $jefeId, ['observaciones' => $observaciones]);

            return $solicitud;
        });
    }

    // PENDIENTE / EN_REVISION / PRE_APROBADA → RECHAZADA
    public function rechazar(SolicitudCombustible $solicitud, int $jefeId, string $motivo): SolicitudCombustible
    {
        if (!in_array($solicitud->estado, [
            EstadoSolicitudEnum::PENDIENTE,
            EstadoSolicitudEnum::EN_REVISION,
            EstadoSolicitudEnum::PRE_APROBADA,
        ], true)) {
            throw new \DomainException('No se puede rechazar una solicitud en este estado.');
        }

        return DB::transaction(function () use ($solicitud, $jefeId, $motivo) {
            $anterior = $solicitud->estado;

            $solicitud->estado           = EstadoSolicitudEnum::RECHAZADA;
            $solicitud->motivo_rechazo   = $motivo;
            $solicitud->aprobador_id     = $jefeId;
            $solicitud->fecha_aprobacion = now();
            $solicitud->save();

            $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $jefeId, $motivo);
            $this->registrarEvento($solicitud, AccionBitacoraEnum::RECHAZAR->value, $jefeId, ['motivo' => $motivo]);

            return $solicitud;
        });
    }

    // APROBADA → COMPLETADA (desde frontend con comprobante)
    public function completar(SolicitudCombustible $solicitud, int $userId, array $data): SolicitudCombustible
    {
        if ($solicitud->estado !== EstadoSolicitudEnum::APROBADA) {
            throw new \DomainException('Solo se puede completar una solicitud Aprobada.');
        }

        $comprobantesExistentes = $solicitud->comprobantes ?? [];
        $nuevosComprobantes     = $data['comprobantes'] ?? [];
        $todosComprobantes      = array_merge($comprobantesExistentes, $nuevosComprobantes);

        if (empty($todosComprobantes)) {
            throw new \DomainException('Debes subir al menos un comprobante antes de completar.');
        }

        return DB::transaction(function () use ($solicitud, $userId, $data, $todosComprobantes) {
            $anterior = $solicitud->estado;

            $solicitud->estado              = EstadoSolicitudEnum::COMPLETADA;
            $solicitud->forma_pago          = $data['forma_pago'] ?? null;
            $solicitud->numero_vale_ticket  = $data['numero_vale_ticket'] ?? null;
            $solicitud->valor_unitario      = $data['valor_unitario'] ?? null;
            $solicitud->valor_total         = $data['valor_total'] ?? null;
            $solicitud->comprobantes        = $todosComprobantes;
            $solicitud->save();

            $this->registrarCambioEstado(
                $solicitud, $anterior, $solicitud->estado, $userId,
                'Completado por usuario. Forma de pago: ' . ($data['forma_pago'] ?? 'N/A')
            );
            $this->registrarEvento($solicitud, AccionBitacoraEnum::COMPLETAR->value, $userId, [
                'forma_pago'         => $data['forma_pago'] ?? null,
                'numero_vale_ticket' => $data['numero_vale_ticket'] ?? null,
                'valor_total'        => $data['valor_total'] ?? null,
            ]);

            return $solicitud;
        });
    }

    // BORRADOR / PENDIENTE → CANCELADA
    public function cancelar(SolicitudCombustible $solicitud, int $userId): SolicitudCombustible
    {
        if (!in_array($solicitud->estado, [
            EstadoSolicitudEnum::BORRADOR,
            EstadoSolicitudEnum::PENDIENTE,
        ], true)) {
            throw new \DomainException('Solo se puede cancelar una solicitud en estado Borrador o Pendiente.');
        }

        return DB::transaction(function () use ($solicitud, $userId) {
            $anterior = $solicitud->estado;

            $solicitud->estado = EstadoSolicitudEnum::CANCELADA;
            $solicitud->save();

            $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $userId, 'Solicitud cancelada.');
            $this->registrarEvento($solicitud, AccionBitacoraEnum::CANCELAR->value, $userId, null);

            return $solicitud;
        });
    }

    // ── Helpers privados ────────────────────────────────────

    private function registrarCambioEstado(SolicitudCombustible $solicitud, $anterior, $nuevo, int $userId, ?string $comentario): void
    {
        HistorialEstado::create([
            'entidad_tipo'    => 'solicitud_combustible',
            'entidad_id'      => $solicitud->id,
            'estado_anterior' => $anterior?->value ?? (string) $anterior,
            'estado_nuevo'    => $nuevo?->value ?? (string) $nuevo,
            'user_id'         => $userId,
            'comentario'      => $comentario,
        ]);
    }

    private function registrarEvento(SolicitudCombustible $solicitud, string $accion, int $userId, ?array $extra = null): void
    {
        BitacoraEvento::create([
            'entidad_tipo' => 'solicitud_combustible',
            'entidad_id'   => $solicitud->id,
            'accion'       => $accion,
            'user_id'      => $userId,
            'datos_extras' => $extra,
        ]);
    }
}