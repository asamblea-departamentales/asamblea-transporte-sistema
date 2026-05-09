<?php

namespace App\Domain\Solicitudes\Services\Reportes;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\SolicitudMantenimiento;
use Illuminate\Database\Eloquent\Builder;

class ReporteOrdenTrabajoService
{
    public function buildQuery(array $filters = []): Builder
    {
        return SolicitudMantenimiento::query()
            ->with([
                'vehiculo.vehMarca',
                'vehiculo.vehModelo',
                'vehiculo.color',
                'vehiculo.clasificacion',
                'tipoMantenimiento',
                'solicitante',
                'aprobador',
            ])
            ->whereIn('estado', [
                EstadoSolicitudEnum::APROBADA,
                EstadoSolicitudEnum::EN_EJECUCION,
                EstadoSolicitudEnum::COMPLETADA,
            ])
            ->when($filters['solicitud_id'] ?? null, function ($query, $value) {
                $query->where('id', $value);
            })
            ->when($filters['date_from'] ?? null, function ($query, $value) {
                $query->where('fecha_sugerida', '>=', $value);
            })
            ->when($filters['date_to'] ?? null, function ($query, $value) {
                $query->where('fecha_sugerida', '<=', $value);
            })
            ->when($filters['vehiculo_id'] ?? null, function ($query, $value) {
                $query->where('vehiculo_id', $value);
            })
            ->when($filters['tipo_mantenimiento_id'] ?? null, function ($query, $value) {
                $query->where('veh_tipo_mantenimiento_id', $value);
            })
            ->when($filters['solicitante_id'] ?? null, function ($query, $value) {
                $query->where('solicitante_id', $value);
            });
    }

    public function getKpis(array $filters = []): array
    {
        $base = $this->buildQuery($filters);

        return [
            'total' => (clone $base)->count(),
            'aprobadas' => (clone $base)->where('estado', EstadoSolicitudEnum::APROBADA)->count(),
            'en_ejecucion' => (clone $base)->where('estado', EstadoSolicitudEnum::EN_EJECUCION)->count(),
            'completadas' => (clone $base)->where('estado', EstadoSolicitudEnum::COMPLETADA)->count(),
        ];
    }

    public function resolverMarca(SolicitudMantenimiento $solicitud): string
    {
        return $solicitud->vehiculo?->vehMarca?->nombre
            ?? $solicitud->vehiculo?->getAttribute('marca')
            ?? '—';
    }

    public function resolverModelo(SolicitudMantenimiento $solicitud): string
    {
        return $solicitud->vehiculo?->vehModelo?->nombre
            ?? $solicitud->vehiculo?->getAttribute('modelo')
            ?? '—';
    }

    public function resolverColor(SolicitudMantenimiento $solicitud): string
    {
        return $solicitud->vehiculo?->color?->nombre ?? '—';
    }

    public function resolverClaseVehiculo(SolicitudMantenimiento $solicitud): string
    {
        return $solicitud->vehiculo?->clasificacion?->nombre
            ?? $solicitud->vehiculo?->tipo?->nombre
            ?? '—';
    }

    public function resolverTipoMantenimiento(SolicitudMantenimiento $solicitud): string
    {
        return $solicitud->tipoMantenimiento?->nombre
            ?? strtoupper((string) $solicitud->tipo_solicitud);
    }

    public function resolverTipoSolicitud(SolicitudMantenimiento $solicitud): string
    {
        return match ((string) $solicitud->tipo_solicitud) {
            'taller' => 'Taller',
            'llantas' => 'Llantas',
            default => ucfirst((string) $solicitud->tipo_solicitud),
        };
    }

    public function resolverAdjuntos(SolicitudMantenimiento $solicitud): string
    {
        return ! empty($solicitud->adjuntos) ? 'Sí' : 'No';
    }
}
