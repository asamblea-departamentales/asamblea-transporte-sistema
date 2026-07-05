<?php

namespace App\Domain\Solicitudes\Services\Reportes;

use App\Models\SolicitudCombustible;
use App\Models\SolicitudMantenimiento;
use App\Models\SolicitudTransporte;
use Illuminate\Support\Collection;

class ReporteGeneralServiciosService
{
    public function obtenerDatos(array $filters = []): Collection
    {
        $rows = collect()
            ->merge($this->mapTransporte($filters))
            ->merge($this->mapCombustible($filters))
            ->merge($this->mapMantenimiento($filters))
            ->sortByDesc('fecha')
            ->values();

        if (! empty($filters['tipo_servicio'])) {
            $rows = $rows->where('origen_modulo', $filters['tipo_servicio'])->values();
        }

        if (! empty($filters['estado'])) {
            $rows = $rows->filter(fn ($r) => $r['estado'] === $filters['estado'])->values();
        }

        if (! empty($filters['prioridad'])) {
            $rows = $rows->filter(fn ($r) => $r['prioridad'] === $filters['prioridad'])->values();
        }

        if (! empty($filters['vehiculo_id'])) {
            $rows = $rows->filter(fn ($r) => (int) $r['vehiculo_id'] === (int) $filters['vehiculo_id'])->values();
        }

        return $rows;
    }

    public function getKpis(array $filters = []): array
    {
        $rows = $this->obtenerDatos($filters);

        return [
            'total' => $rows->count(),
            'transporte' => $rows->where('origen_modulo', 'transporte')->count(),
            'combustible' => $rows->where('origen_modulo', 'combustible')->count(),
            'mantenimiento' => $rows->where('origen_modulo', 'mantenimiento')->count(),
            'aprobadas' => $rows->whereIn('estado', ['aprobada', 'programada', 'completada'])->count(),
            'rechazadas' => $rows->whereIn('estado', ['rechazada', 'cancelada'])->count(),
            'monto_total' => $rows->sum('monto'),
        ];
    }

    private function mapTransporte(array $filters = []): Collection
    {
        $query = SolicitudTransporte::query()
            ->with(['solicitante', 'vehiculo', 'motorista']);

        $this->applyDateFilter($query, $filters, 'fecha_salida');

        return $query->get()->map(function (SolicitudTransporte $r) {
            $detalle = trim(
                'Origen: '.($r->origen ?? '—').
                ' / Destino: '.($r->destino ?? '—').
                ($r->motivo_actividad ? ' / Motivo: '.$r->motivo_actividad : '')
            );

            return [
                'tipo_servicio' => 'Transporte',
                'codigo' => $r->codigo,
                'fecha' => optional($r->fecha_salida)?->format('Y-m-d H:i:s'),
                'solicitante' => $r->solicitante?->name ?? '—',
                'vehiculo' => $r->vehiculo?->placa ?? '—',
                'vehiculo_id' => $r->vehiculo_id,
                'motorista' => $r->motorista?->nombre ?? '—',
                'detalle' => $detalle,
                'estado' => $this->enumValue($r->estado),
                'prioridad' => $this->enumValue($r->prioridad),
                'monto' => 0,
                'origen_modulo' => 'transporte',
            ];
        });
    }

    private function mapCombustible(array $filters = []): Collection
    {
        $query = SolicitudCombustible::query()
            ->with(['solicitante', 'vehiculo', 'motorista']);

        $this->applyDateFilter($query, $filters, 'fecha_solicitud');

        return $query->get()->map(function (SolicitudCombustible $r) {
            return [
                'tipo_servicio' => 'Combustible',
                'codigo' => $r->codigo,
                'fecha' => optional($r->fecha_solicitud)?->format('Y-m-d 00:00:00'),
                'solicitante' => $r->solicitante?->name ?? '—',
                'vehiculo' => $r->vehiculo?->placa ?? '—',
                'vehiculo_id' => $r->vehiculo_id,
                'motorista' => $r->motorista?->nombre ?? '—',
                'detalle' => $r->destino_actividad ?? 'Solicitud de combustible',
                'estado' => $this->enumValue($r->estado),
                'prioridad' => $this->enumValue($r->prioridad),
                'monto' => (float) ($r->valor_total ?? 0),
                'origen_modulo' => 'combustible',
            ];
        });
    }

    private function mapMantenimiento(array $filters = []): Collection
    {
        $query = SolicitudMantenimiento::query()
            ->with(['solicitante', 'vehiculo', 'tipoMantenimiento']);

        $this->applyDateFilter($query, $filters, 'fecha_sugerida');

        return $query->get()->map(function (SolicitudMantenimiento $r) {
            $tipo = $r->tipoMantenimiento?->nombre ?? strtoupper((string) $r->tipo_solicitud);

            return [
                'tipo_servicio' => 'Mantenimiento',
                'codigo' => $r->codigo,
                'fecha' => optional($r->fecha_sugerida)?->format('Y-m-d 00:00:00'),
                'solicitante' => $r->solicitante?->name ?? '—',
                'vehiculo' => $r->vehiculo?->placa ?? '—',
                'vehiculo_id' => $r->vehiculo_id,
                'motorista' => '—',
                'detalle' => trim(($tipo ? $tipo.' / ' : '').($r->detalle ?? '')),
                'estado' => $this->enumValue($r->estado),
                'prioridad' => $this->enumValue($r->prioridad),
                'monto' => (float) ($r->costo_real ?? $r->costo_estimado ?? 0),
                'origen_modulo' => 'mantenimiento',
            ];
        });
    }

    private function applyDateFilter($query, array $filters, string $column): void
    {
        if (! empty($filters['date_from'])) {
            $query->where($column, '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->where($column, '<=', $filters['date_to']);
        }
    }

    private function enumValue($value): string
    {
        return $value instanceof \UnitEnum ? $value->value : (string) $value;
    }
}
