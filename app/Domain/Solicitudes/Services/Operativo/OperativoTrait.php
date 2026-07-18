<?php

namespace App\Domain\Solicitudes\Services\Operativo;

use App\Models\SolicitudCombustible;
use App\Models\SolicitudMantenimiento;
use App\Models\SolicitudTransporte;
use Illuminate\Support\Collection;

trait OperativoTrait
{
    public function obtenerSolicitudes(array $filters = []): Collection
    {
        $rows = collect()
            ->merge($this->mapTransporte($filters))
            ->merge($this->mapCombustible($filters))
            ->merge($this->mapMantenimiento($filters))
            ->sortBy('fecha_ingreso')
            ->values();

        if (! empty($filters['tipo'])) {
            $rows = $rows->where('tipo', $filters['tipo'])->values();
        }

        if (! empty($filters['prioridad'])) {
            $rows = $rows->where('prioridad', $filters['prioridad'])->values();
        }

        if (! empty($filters['prioridad_grupo'])) {
            $rows = $rows->where('prioridad_grupo', $filters['prioridad_grupo'])->values();
        }

        if (! empty($filters['estado'])) {
            $rows = $rows->where('estado', $filters['estado'])->values();
        }

        return $rows;
    }

    public function getKpis(array $filters = []): array
    {
        $rows = $this->obtenerSolicitudes($filters);

        return [
            'total' => $rows->count(),
            'transporte' => $rows->where('tipo', 'transporte')->count(),
            'combustible' => $rows->where('tipo', 'combustible')->count(),
            'mantenimiento' => $rows->where('tipo', 'mantenimiento')->count(),
        ];
    }

    private function resolverModelo(string $tipo, int $id)
    {
        return match ($tipo) {
            'transporte' => SolicitudTransporte::findOrFail($id),
            'combustible' => SolicitudCombustible::findOrFail($id),
            'mantenimiento' => SolicitudMantenimiento::findOrFail($id),
            default => throw new \InvalidArgumentException('Tipo de solicitud no válido.'),
        };
    }

    private function resolverEntidadTipo(string $tipo): string
    {
        return match ($tipo) {
            'transporte' => 'solicitud_transporte',
            'combustible' => 'solicitud_combustible',
            'mantenimiento' => 'solicitud_mantenimiento',
            default => 'solicitud',
        };
    }

    private function enumValue($value): string
    {
        return $value instanceof \UnitEnum ? $value->value : (string) $value;
    }
}
