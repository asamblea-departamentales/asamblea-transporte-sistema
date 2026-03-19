<?php

namespace App\Domain\Solicitudes\Services\Liquidaciones;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\SolicitudCombustible;
use App\Models\SolicitudMantenimiento;
use Illuminate\Support\Collection;

class LiquidacionUnifiedService
{
    public function getAll(): Collection
    {
        $combustible = SolicitudCombustible::query()
            ->whereIn('estado', [
                EstadoSolicitudEnum::COMPLETADA,
                EstadoSolicitudEnum::LIQUIDADA,
            ])
            ->with(['vehiculo', 'solicitante', 'liquidacion'])
            ->get()
            ->map(fn ($item) => $this->mapCombustible($item));

        $mantenimiento = SolicitudMantenimiento::query()
            ->whereIn('estado', [
                EstadoSolicitudEnum::COMPLETADA,
                EstadoSolicitudEnum::LIQUIDADA,
            ])
            ->with(['vehiculo', 'solicitante', 'liquidacion'])
            ->get()
            ->map(fn ($item) => $this->mapMantenimiento($item));

        return $combustible
            ->merge($mantenimiento)
            ->sortByDesc('fecha')
            ->values();
    }

    private function mapCombustible($r): array
    {
        return [
            'id' => $r->id,
            'tipo' => 'combustible',
            'codigo' => $r->codigo,
            'vehiculo' => $r->vehiculo?->placa,
            'solicitante' => $r->solicitante?->name,
            'monto' => $r->valor_total,
            'fecha' => $r->created_at,
            'estado' => $r->estado,
            'tiene_comprobantes' => !empty($r->comprobantes),
            'liquidado' => $r->liquidacion !== null,
        ];
    }

    private function mapMantenimiento($r): array
    {
        return [
            'id' => $r->id,
            'tipo' => 'mantenimiento',
            'codigo' => $r->codigo,
            'vehiculo' => $r->vehiculo?->placa,
            'solicitante' => $r->solicitante?->name,
            'monto' => $r->costo_real ?? $r->costo_estimado,
            'fecha' => $r->fecha_realizada ?? $r->created_at,
            'estado' => $r->estado,
            'tiene_comprobantes' => !empty($r->adjuntos),
            'liquidado' => $r->liquidacion !== null,
        ];
    }
}