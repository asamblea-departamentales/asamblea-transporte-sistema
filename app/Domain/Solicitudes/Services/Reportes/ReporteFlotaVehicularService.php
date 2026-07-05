<?php

namespace App\Domain\Solicitudes\Services\Reportes;

use App\Models\Vehiculo;
use Illuminate\Database\Eloquent\Builder;

class ReporteFlotaVehicularService
{
    public function buildQuery(array $filtros = []): Builder
    {
        return Vehiculo::query()
            ->with([
                'tipo',
                'vehMarca:id,nombre',
                'vehModelo:id,nombre',
                'color',
                'tipoCombustible',
                'clasificacion',
                'estadoCatalogo',
                'asignacionVigenteMotorista.motorista',
            ])
            ->when($filtros['placa'] ?? null, function ($query, $placa) {
                $query->where('placa', 'like', "%{$placa}%");
            })
            ->when($filtros['tipo_vehiculo_id'] ?? null, function ($query, $tipoVehiculoId) {
                $query->where('tipo_vehiculo_id', $tipoVehiculoId);
            })
            ->when($filtros['veh_marca_id'] ?? null, function ($query, $marcaId) {
                $query->where('veh_marca_id', $marcaId);
            })
            ->when($filtros['veh_modelo_id'] ?? null, function ($query, $modeloId) {
                $query->where('veh_modelo_id', $modeloId);
            })
            ->when($filtros['veh_tipo_combustible_id'] ?? null, function ($query, $combustibleId) {
                $query->where('veh_tipo_combustible_id', $combustibleId);
            })
            ->when($filtros['veh_clasificacion_id'] ?? null, function ($query, $clasificacionId) {
                $query->where('veh_clasificacion_id', $clasificacionId);
            })
            ->when($filtros['veh_estado_catalogo_id'] ?? null, function ($query, $estadoCatalogoId) {
                $query->where('veh_estado_catalogo_id', $estadoCatalogoId);
            })
            // Corrección para la llave 'activo'
            ->when(isset($filtros['activo']) && $filtros['activo'] !== '', function ($query) use ($filtros) {
                $valor = filter_var($filtros['activo'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                if ($valor !== null) {
                    $query->where('activo', $valor);
                }
            });
    }

    public function getKpis(array $filtros = []): array
    {
        // Clonamos para que los filtros de un KPI no afecten al siguiente
        $base = $this->buildQuery($filtros);

        return [
            'total' => (clone $base)->count(),
            'activos' => (clone $base)->where('activo', true)->count(),
            'con_asignacion' => (clone $base)->whereHas('asignacionVigenteMotorista')->count(),
            'sin_asignacion' => (clone $base)->whereDoesntHave('asignacionVigenteMotorista')->count(),
        ];
    }

    public function resolverAsignadoA(Vehiculo $vehiculo): string
    {
        $motorista = $vehiculo->asignacionVigenteMotorista?->motorista;

        if (! $motorista) {
            return 'Sin asignación';
        }

        return $motorista->nombre_completo
            ?? $motorista->nombre
            ?? trim(($motorista->nombres ?? '').' '.($motorista->apellidos ?? ''))
            ?: 'Motorista asignado';
    }
}
