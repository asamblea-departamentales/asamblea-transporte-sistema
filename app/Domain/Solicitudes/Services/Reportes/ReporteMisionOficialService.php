<?php

namespace App\Domain\Solicitudes\Services\Reportes;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\SolicitudTransporte;
use Illuminate\Database\Eloquent\Builder;

class ReporteMisionOficialService
{
    public function buildQuery(array $filters = []): Builder
{
    return SolicitudTransporte::query()
        ->with([
            'solicitante',
            'autorizador',
            'vehiculo.marca',
            'vehiculo.modelo',
            'vehiculo.color',
            'vehiculo.clasificacion',
            'tipoVehiculo',
            'motorista',
        ])
        ->whereIn('estado', [
            EstadoSolicitudEnum::PROGRAMADA,
            EstadoSolicitudEnum::COMPLETADA,
        ])
        ->when($filters['solicitud_id'] ?? null, function ($query, $value) {
            $query->where('id', $value);
        })
        ->when($filters['date_from'] ?? null, function ($query, $value) {
            $query->where('fecha_salida', '>=', $value);
        })
        ->when($filters['date_to'] ?? null, function ($query, $value) {
            $query->where('fecha_salida', '<=', $value);
        })
        ->when($filters['vehiculo_id'] ?? null, function ($query, $value) {
            $query->where('vehiculo_id', $value);
        })
        ->when($filters['motorista_id'] ?? null, function ($query, $value) {
            $query->where('motorista_id', $value);
        })
        ->when($filters['tipo_vehiculo_id'] ?? null, function ($query, $value) {
            $query->where('tipo_vehiculo_id', $value);
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
        'programadas' => (clone $base)->where('estado', EstadoSolicitudEnum::PROGRAMADA)->count(),
        'completadas' => (clone $base)->where('estado', EstadoSolicitudEnum::COMPLETADA)->count(),
    ];
}

    public function resolverClaseVehiculo(SolicitudTransporte $solicitud): string
    {
        return $solicitud->tipoVehiculo?->nombre
            ?? $solicitud->tipo_vehiculo_nombre
            ?? $solicitud->vehiculo?->clasificacion?->nombre
            ?? '—';
    }

    public function resolverMarca(SolicitudTransporte $solicitud): string
{
    $vehiculo = $solicitud->vehiculo;
    if (!$vehiculo) return '—';

    // getRelation() evita el conflicto con el campo de texto 'marca'
    return $vehiculo->getRelation('marca')?->nombre
        ?? $vehiculo->getRawOriginal('marca')
        ?? '—';
}

    public function resolverModelo(SolicitudTransporte $solicitud): string
    {
        $vehiculo = $solicitud->vehiculo;
        if (!$vehiculo) return '—';

        return $vehiculo->getRelation('modelo')?->nombre
         ?? $vehiculo->getRawOriginal('modelo')
            ?? '—';
    }

    public function resolverColor(SolicitudTransporte $solicitud): string
    {
        return $solicitud->vehiculo?->color?->nombre ?? '—';
    }

    public function resolverAutorizadorCargo(SolicitudTransporte $solicitud): string
    {
        return 'Autorizador';
    }

    public function construirTextoMision(SolicitudTransporte $solicitud): string
    {
        $vehiculo = $solicitud->vehiculo;
        $motorista = $solicitud->motorista?->nombre ?? 'No asignado';

        $placa = $vehiculo?->placa ?? '—';
        $clase = $this->resolverClaseVehiculo($solicitud);
        $anio = $vehiculo?->anio ?? '—';
        $capacidad = $vehiculo?->capacidad_personas ?? '—';
        $marca = $this->resolverMarca($solicitud);
        $modelo = $this->resolverModelo($solicitud);
        $color = $this->resolverColor($solicitud);

        $motivo = $solicitud->motivo_actividad ?? 'Misión oficial';
        $origen = $solicitud->origen ?? '—';
        $destino = $solicitud->destino ?? '—';
        $destinoAdicional = $solicitud->destino_adicional ?? 'Sin destino adicional';

        return "Se autoriza la misión oficial del vehículo con placas {$placa}, clase {$clase}, año {$anio}, capacidad {$capacidad}, marca {$marca}, modelo {$modelo} y color {$color}, propiedad de la Asamblea Legislativa, para ser conducido por el señor {$motorista}. Motivo: {$motivo}. Ruta: {$origen} hacia {$destino}. Destino adicional: {$destinoAdicional}.";
    }
}