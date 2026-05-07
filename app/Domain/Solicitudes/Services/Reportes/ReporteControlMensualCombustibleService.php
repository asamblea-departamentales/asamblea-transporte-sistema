<?php

namespace App\Domain\Solicitudes\Services\Reportes;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\SolicitudCombustible;
use Illuminate\Database\Eloquent\Builder;

class ReporteControlMensualCombustibleService
{
    public function buildQuery(array $filtros = []): Builder
    {
        $column = $filtros['date_field'] ?? 'fecha_solicitud';

        return SolicitudCombustible::query()
            ->with([
                'vehiculo.marca',
                'vehiculo.modelo',
                'motorista',
                'solicitante',
                'contrato',
                'serieCarga',
            ])
            ->when($filtros['date_from'] ?? null, function ($query, $dateFrom) use ($column) {
                $query->where($column, '>=', $dateFrom);
            })
            ->when($filtros['date_to'] ?? null, function ($query, $dateTo) use ($column) {
                $query->where($column, '<=', $dateTo);
            })
            ->when($filtros['vehiculo_id'] ?? null, function ($query, $vehiculoId) {
                $query->where('vehiculo_id', $vehiculoId);
            })
            ->when($filtros['motorista_id'] ?? null, function ($query, $motoristaId) {
                $query->where('motorista_id', $motoristaId);
            })
            ->when($filtros['contrato_id'] ?? null, function ($query, $contratoId) {
                $query->where('contrato_id', $contratoId);
            })
            ->when($filtros['serie_vale_id'] ?? null, function ($query, $serieValeId) {
                $query->where('serie_vale_id', $serieValeId);
            })
            ->when($filtros['estado'] ?? null, function ($query, $estado) {
                $query->where('estado', $estado);
            });
    }

    public function getKpis(array $filtros = []): array
    {
        $base = $this->buildQuery($filtros);

        return [
            'total' => (clone $base)->count(),
            'galones' => (float) ((clone $base)->sum('cantidad_combustible') ?? 0),
            'valor_total' => (float) ((clone $base)->sum('valor_total') ?? 0),
            'monto_asignado' => (float) ((clone $base)->sum('monto_asignado') ?? 0),
            'asignadas' => (clone $base)->where('estado', EstadoSolicitudEnum::ASIGNADA)->count(),
            'completadas' => (clone $base)->where('estado', EstadoSolicitudEnum::COMPLETADA)->count(),
        ];
    }

    public function resolverVehiculo($solicitud): string
    {
        if (! $solicitud->vehiculo) {
            return 'N/A';
        }

        $placa = $solicitud->vehiculo->placa ?? 'Sin placa';
        $marca = $solicitud->vehiculo->marca?->nombre ?? $solicitud->vehiculo->getAttribute('marca') ?? '';
        $modelo = $solicitud->vehiculo->modelo?->nombre ?? $solicitud->vehiculo->getAttribute('modelo') ?? '';

        $detalle = trim("{$marca} {$modelo}");

        return $detalle ? "{$placa} - {$detalle}" : $placa;
    }

    public function resolverCorrelativo($solicitud): string
    {
        if (! $solicitud->correlativo_inicio || ! $solicitud->correlativo_fin) {
            return '—';
        }

        return $solicitud->correlativo_inicio === $solicitud->correlativo_fin
            ? (string) $solicitud->correlativo_inicio
            : "{$solicitud->correlativo_inicio} - {$solicitud->correlativo_fin}";
    }
}
