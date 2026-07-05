<?php

namespace App\Domain\Solicitudes\Services\Liquidaciones;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\SolicitudCombustible;
use App\Models\SolicitudMantenimiento;
use App\Models\SolicitudTransporte;
use Illuminate\Support\Collection;

class LiquidacionUnifiedService
{
    public function getAll(
        ?string $fechaDesde = null,
        ?string $fechaHasta = null,
        ?string $tipo = null,
        ?string $estado = null,
        ?string $modo = 'liquidacion',
        ?int $solicitanteId = null,
        ?int $motoristaId = null,
    ): Collection {

        $transporte = collect();
        $combustible = collect();
        $mantenimiento = collect();

        $estadosLiquidacion = [
            EstadoSolicitudEnum::COMPLETADA,
            EstadoSolicitudEnum::LIQUIDADA,
        ];

        $dateFieldTransporte = 'created_at';
        $dateFieldCombustible = 'fecha_solicitud';
        $dateFieldMantenimiento = 'created_at';

        if (! $tipo || $tipo === 'transporte') {
            $q = SolicitudTransporte::query()
                ->with(['vehiculo', 'solicitante', 'motorista', 'unidad']);

            if ($modo === 'liquidacion') {
                $q->whereIn('estado', $estadosLiquidacion);
            }

            if ($fechaDesde) {
                $q->whereDate($dateFieldTransporte, '>=', $fechaDesde);
            }
            if ($fechaHasta) {
                $q->whereDate($dateFieldTransporte, '<=', $fechaHasta);
            }
            if ($solicitanteId) {
                $q->where('solicitante_id', $solicitanteId);
            }
            if ($motoristaId) {
                $q->where('motorista_id', $motoristaId);
            }

            $transporte = $q->get()->map(fn ($item) => $this->mapTransporte($item));
        }

        if (! $tipo || $tipo === 'combustible') {
            $q = SolicitudCombustible::query()
                ->with(['vehiculo', 'solicitante', 'motorista', 'liquidacion', 'solicitudTransporte.vehiculo', 'solicitudTransporte.motorista']);

            if ($modo === 'liquidacion') {
                $q->whereIn('estado', $estadosLiquidacion);
            }

            if ($fechaDesde) {
                $q->whereDate($dateFieldCombustible, '>=', $fechaDesde);
            }
            if ($fechaHasta) {
                $q->whereDate($dateFieldCombustible, '<=', $fechaHasta);
            }
            if ($solicitanteId) {
                $q->where('solicitante_id', $solicitanteId);
            }
            if ($motoristaId) {
                $q->where('motorista_id', $motoristaId);
            }

            $combustible = $q->get()->map(fn ($item) => $this->mapCombustible($item));
        }

        if (! $tipo || $tipo === 'mantenimiento') {
            $q = SolicitudMantenimiento::query()
                ->with(['vehiculo', 'solicitante', 'liquidacion', 'tipoMantenimiento']);

            if ($modo === 'liquidacion') {
                $q->whereIn('estado', $estadosLiquidacion);
            }

            if ($fechaDesde) {
                $q->whereDate($dateFieldMantenimiento, '>=', $fechaDesde);
            }
            if ($fechaHasta) {
                $q->whereDate($dateFieldMantenimiento, '<=', $fechaHasta);
            }
            if ($solicitanteId) {
                $q->where('solicitante_id', $solicitanteId);
            }

            $mantenimiento = $q->get()->map(fn ($item) => $this->mapMantenimiento($item));
        }

        $resultado = $transporte
            ->merge($combustible)
            ->merge($mantenimiento)
            ->sortByDesc('fecha')
            ->values();

        if ($estado) {
            if ($estado === 'liquidado') {
                $resultado = $resultado->filter(fn ($i) => ($i['liquidado'] ?? false) === true);
            } elseif ($estado === 'pendiente_liquidacion') {
                $resultado = $resultado->filter(fn ($i) => ($i['liquidado'] ?? false) === false &&
                    in_array($i['estado_raw'] ?? '', ['completada'], true));
            } else {
                $resultado = $resultado->filter(fn ($i) => ($i['estado_raw'] ?? '') === $estado);
            }
            $resultado = $resultado->values();
        }

        return $resultado;
    }

    private function mapTransporte($r): array
    {
        return [
            'id' => $r->id,
            'tipo' => 'transporte',
            'codigo' => $r->codigo,
            'vehiculo' => $r->vehiculo?->placa,
            'vehiculo_nombre' => $r->vehiculo?->vehMarca?->nombre.' '.$r->vehiculo?->vehModelo?->nombre,
            'solicitante' => $r->solicitante?->name,
            'solicitante_id' => $r->solicitante_id,
            'motorista' => $r->motorista?->nombre,
            'motorista_id' => $r->motorista_id,
            'destino' => $r->destino,
            'monto' => 0,
            'fecha' => $r->fecha_salida ?? $r->created_at,
            'estado' => $this->estadoLabel($r->estado?->value ?? (string) $r->estado),
            'estado_raw' => $r->estado?->value ?? (string) $r->estado,
            'tiene_comprobantes' => false,
            'liquidado' => false,
            'solicitud_transporte_id' => null,
            'puede_editar' => $this->puedeEditar($r->estado?->value ?? (string) $r->estado),
            'tiene_mision_oficial' => $this->tieneMisionOficial($r),
            'tiene_doc_oficial' => $this->tieneDocOficial($r),
        ];
    }

    private function mapCombustible($r): array
    {
        return [
            'id' => $r->id,
            'tipo' => 'combustible',
            'codigo' => $r->codigo,
            'vehiculo' => $r->vehiculo?->placa,
            'vehiculo_nombre' => $r->vehiculo?->vehMarca?->nombre.' '.$r->vehiculo?->vehModelo?->nombre,
            'solicitante' => $r->solicitante?->name,
            'solicitante_id' => $r->solicitante_id,
            'motorista' => $r->motorista?->nombre,
            'motorista_id' => $r->motorista_id,
            'monto' => $r->valor_total,
            'fecha' => $r->fecha_solicitud ?? $r->created_at,
            'estado' => $this->estadoLabel($r->estado?->value ?? (string) $r->estado),
            'estado_raw' => $r->estado?->value ?? (string) $r->estado,
            'tiene_comprobantes' => ! empty($r->comprobantes),
            'liquidado' => $r->liquidacion !== null,
            'solicitud_transporte_id' => $r->solicitud_transporte_id,
            'transporte_tiene_datos' => $r->solicitudTransporte && $r->solicitudTransporte->vehiculo_id && $r->solicitudTransporte->motorista_id,
            'puede_editar' => $this->puedeEditar($r->estado?->value ?? (string) $r->estado),
            'puede_liquidar' => $this->puedeLiquidar($r),
            'pdf_route' => route('liquidacion.combustible.pdf', $r->id),
        ];
    }

    private function mapMantenimiento($r): array
    {
        return [
            'id' => $r->id,
            'tipo' => 'mantenimiento',
            'codigo' => $r->codigo,
            'vehiculo' => $r->vehiculo?->placa,
            'vehiculo_nombre' => $r->vehiculo?->vehMarca?->nombre.' '.$r->vehiculo?->vehModelo?->nombre,
            'solicitante' => $r->solicitante?->name,
            'solicitante_id' => $r->solicitante_id,
            'motorista' => null,
            'motorista_id' => null,
            'tipo_mantenimiento' => $r->tipoMantenimiento?->nombre,
            'monto' => $r->costo_real ?? $r->costo_estimado ?? 0,
            'fecha' => $r->fecha_sugerida ?? $r->fecha_realizada ?? $r->created_at,
            'estado' => $this->estadoLabel($r->estado?->value ?? (string) $r->estado),
            'estado_raw' => $r->estado?->value ?? (string) $r->estado,
            'tiene_comprobantes' => ! empty($r->adjuntos),
            'liquidado' => $r->liquidacion !== null,
            'solicitud_transporte_id' => null,
            'puede_editar' => $this->puedeEditar($r->estado?->value ?? (string) $r->estado),
            'puede_liquidar' => $this->puedeLiquidar($r),
            'tiene_orden_trabajo' => $this->tieneOrdenTrabajo($r),
            'pdf_route' => route('liquidacion.mantenimiento.pdf', $r->id),
        ];
    }

    private function estadoLabel(string $estado): string
    {
        $labels = [
            'borrador' => 'Borrador',
            'pendiente' => 'Pendiente',
            'en_revision' => 'En revisión',
            'pre_aprobada' => 'Pre-aprobada',
            'aprobada' => 'Aprobada',
            'rechazada' => 'No Autorizado',
            'programada' => 'Programada',
            'asignada' => 'Asignada',
            'en_ejecucion' => 'En ejecución',
            'completada' => 'Completada',
            'cancelada' => 'Cancelado por usuario',
            'liquidada' => 'Liquidada',
        ];

        return $labels[$estado] ?? ucfirst($estado);
    }

    private function puedeEditar(string $estado): bool
    {
        return in_array($estado, ['borrador', 'pendiente'], true);
    }

    private function puedeLiquidar($r): bool
    {
        $estadoRaw = $r->estado?->value ?? (string) $r->estado;
        $tieneComprobantes = match ($r::class) {
            SolicitudCombustible::class => ! empty($r->comprobantes),
            SolicitudMantenimiento::class => ! empty($r->adjuntos),
            default => false,
        };

        return $estadoRaw === 'completada' && $tieneComprobantes && $r->liquidacion === null;
    }

    private function tieneMisionOficial($r): bool
    {
        if (! $r instanceof SolicitudTransporte) {
            return false;
        }

        return in_array($r->estado?->value ?? '', ['programada', 'completada'], true)
            && ! empty($r->vehiculo_id)
            && ! empty($r->motorista_id)
            && ! empty($r->decidido_por);
    }

    private function tieneDocOficial($r): bool
    {
        if (! $r instanceof SolicitudTransporte) {
            return false;
        }

        return ! empty($r->vehiculo_id) && ! empty($r->motorista_id);
    }

    private function tieneOrdenTrabajo($r): bool
    {
        if (! $r instanceof SolicitudMantenimiento) {
            return false;
        }

        return in_array($r->estado?->value ?? '', ['aprobada', 'en_ejecucion', 'completada'], true)
            && ! empty($r->vehiculo_id);
    }

    public function estadoOptions(): array
    {
        return [
            ['value' => 'borrador',      'label' => '📝 Borrador'],
            ['value' => 'pendiente',     'label' => '⏳ Pendiente'],
            ['value' => 'en_revision',   'label' => '🔍 En revisión'],
            ['value' => 'pre_aprobada',  'label' => '📋 Pre-aprobada'],
            ['value' => 'aprobada',      'label' => '✅ Aprobada'],
            ['value' => 'rechazada',     'label' => '❌ No Autorizado'],
            ['value' => 'programada',    'label' => '📅 Programada'],
            ['value' => 'asignada',      'label' => '🚛 Asignada'],
            ['value' => 'en_ejecucion',  'label' => '🔧 En ejecución'],
            ['value' => 'completada',    'label' => '✔ Completada'],
            ['value' => 'cancelada',     'label' => '🚫 Cancelado por usuario'],
            ['value' => 'liquidada',     'label' => '💰 Liquidada'],
            ['value' => 'pendiente_liquidacion', 'label' => '⏳ Pendiente de liquidación'],
        ];
    }
}
