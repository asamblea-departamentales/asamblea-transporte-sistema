<?php

namespace App\Domain\Solicitudes\Services\Liquidaciones;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\SolicitudCombustible;
use App\Models\SolicitudMantenimiento;
use Illuminate\Support\Collection;

class LiquidacionUnifiedService
{
    public function getAll(
        ?string $fechaDesde = null,
        ?string $fechaHasta = null,
        ?string $tipo       = null,
        ?string $estado     = null,
    ): Collection {

        $combustible   = collect();
        $mantenimiento = collect();

        if (!$tipo || $tipo === 'combustible') {
            $q = SolicitudCombustible::query()
                ->whereIn('estado', [
                    EstadoSolicitudEnum::COMPLETADA,
                    EstadoSolicitudEnum::LIQUIDADA,
                ])
                ->with(['vehiculo', 'solicitante', 'liquidacion']);

            if ($fechaDesde) $q->whereDate('created_at', '>=', $fechaDesde);
            if ($fechaHasta) $q->whereDate('created_at', '<=', $fechaHasta);

            $combustible = $q->get()->map(fn ($item) => $this->mapCombustible($item));
        }

        if (!$tipo || $tipo === 'mantenimiento') {
            $q = SolicitudMantenimiento::query()
                ->whereIn('estado', [
                    EstadoSolicitudEnum::COMPLETADA,
                    EstadoSolicitudEnum::LIQUIDADA,
                ])
                ->with(['vehiculo', 'solicitante', 'liquidacion']);

            if ($fechaDesde) $q->whereDate('created_at', '>=', $fechaDesde);
            if ($fechaHasta) $q->whereDate('created_at', '<=', $fechaHasta);

            $mantenimiento = $q->get()->map(fn ($item) => $this->mapMantenimiento($item));
        }

        $resultado = $combustible->merge($mantenimiento)->sortByDesc('fecha')->values();

        // Filtro de estado (liquidado / pendiente) se hace en memoria
        // porque viene de la relación, no de una columna
        if ($estado === 'liquidado') {
            $resultado = $resultado->filter(fn ($i) => $i['liquidado']);
        } elseif ($estado === 'pendiente') {
            $resultado = $resultado->filter(fn ($i) => !$i['liquidado']);
        }

        return $resultado->values();
    }

    private function mapCombustible($r): array
    {
        return [
            'id'                => $r->id,
            'tipo'              => 'combustible',
            'codigo'            => $r->codigo,
            'vehiculo'          => $r->vehiculo?->placa,
            'solicitante'       => $r->solicitante?->name,
            'monto'             => $r->valor_total,
            'fecha'             => $r->created_at,
            'estado'            => $r->estado,
            'tiene_comprobantes'=> !empty($r->comprobantes),
            'liquidado'         => $r->liquidacion !== null,
        ];
    }

    private function mapMantenimiento($r): array
    {
        return [
            'id'                => $r->id,
            'tipo'              => 'mantenimiento',
            'codigo'            => $r->codigo,
            'vehiculo'          => $r->vehiculo?->placa,
            'solicitante'       => $r->solicitante?->name,
            'monto'             => $r->costo_real ?? $r->costo_estimado,
            'fecha'             => $r->fecha_realizada ?? $r->created_at,
            'estado'            => $r->estado,
            'tiene_comprobantes'=> !empty($r->adjuntos),
            'liquidado'         => $r->liquidacion !== null,
        ];
    }
}