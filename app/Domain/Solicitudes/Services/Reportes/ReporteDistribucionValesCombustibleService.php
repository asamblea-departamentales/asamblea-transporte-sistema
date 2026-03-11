<?php

namespace App\Domain\Solicitudes\Services\Reportes;

use App\Models\SolicitudCombustible;
use Illuminate\Database\Eloquent\Builder;

class ReporteDistribucionValesCombustibleService
{
    public function buildQuery(array $filters = []): Builder
    {
        $column = $filters['date_field'] ?? 'fecha_asignacion';

        return SolicitudCombustible::query()
            ->with([
                'vehiculo',
                'motorista',
                'solicitante',
                'serieVale',
                'contrato.proveedor'
            ])
            ->when($filters['date_from'] ?? null, fn($q,$v)=>$q->where($column,'>=',$v))
            ->when($filters['date_to'] ?? null, fn($q,$v)=>$q->where($column,'<=',$v))
            ->when($filters['vehiculo_id'] ?? null, fn($q,$v)=>$q->where('vehiculo_id',$v))
            ->when($filters['motorista_id'] ?? null, fn($q,$v)=>$q->where('motorista_id',$v))
            ->when($filters['proveedor_id'] ?? null, fn($q,$v)=>$q->whereHas('contrato',fn($qq)=>$qq->where('proveedor_id',$v)))
            ->when($filters['serie_vale_id'] ?? null, fn($q,$v)=>$q->where('serie_vale_id',$v))
            ->when($filters['estado'] ?? null, fn($q,$v)=>$q->where('estado',$v));
    }

    public function kpis(array $filters): array
    {
        $base = $this->buildQuery($filters);

        return [
            'total_solicitudes' => (clone $base)->count(),
            'total_vales' => (clone $base)->sum('cantidad_vales'),
            'total_monto' => (clone $base)->sum('monto_asignado'),
            'total_galones' => (clone $base)->sum('cantidad_combustible'),
        ];
    }

    public function correlativo($record)
    {
        if(!$record->correlativo_inicio) return '—';

        if($record->correlativo_inicio == $record->correlativo_fin)
            return $record->correlativo_inicio;

        return $record->correlativo_inicio.'-'.$record->correlativo_fin;
    }

    public function comprobantes($r)
    {
        return $r->comprobantes ? 'Sí' : 'No';
    }
}