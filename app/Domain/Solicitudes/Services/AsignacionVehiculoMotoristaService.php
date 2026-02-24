<?php

namespace App\Domain\Solicitudes\Services;

use App\Models\AsignacionVehiculoMotorista;
use Illuminate\Support\Facades\DB;

class AsignacionVehiculoMotoristaService
{
    public function asignar(int $vehiculoId, int $motoristaId, $desde = null): AsignacionVehiculoMotorista
    {
        return DB::transaction(function () use ($vehiculoId, $motoristaId, $desde) {
            $ahora = $desde ?? now();

            // Cerrar asignación vigente del vehículo
            AsignacionVehiculoMotorista::where('vehiculo_id', $vehiculoId)
                ->where('vigente', true)
                ->whereNull('hasta')
                ->update([
                    'vigente'    => false,
                    'hasta'      => $ahora,
                    'updated_at' => $ahora,
                ]);

            // Cerrar asignación vigente del motorista
            AsignacionVehiculoMotorista::where('motorista_id', $motoristaId)
                ->where('vigente', true)
                ->whereNull('hasta')
                ->update([
                    'vigente'    => false,
                    'hasta'      => $ahora,
                    'updated_at' => $ahora,
                ]);

            // Crear nueva asignación vigente
            return AsignacionVehiculoMotorista::create([
                'vehiculo_id'  => $vehiculoId,
                'motorista_id' => $motoristaId,
                'desde'        => $ahora,
                'hasta'        => null,
                'vigente'      => true,
            ]);
        });
    }

    public function desasignar(int $vehiculoId): void
    {
        DB::transaction(function () use ($vehiculoId) {
            AsignacionVehiculoMotorista::where('vehiculo_id', $vehiculoId)
                ->where('vigente', true)
                ->whereNull('hasta')
                ->update([
                    'vigente'    => false,
                    'hasta'      => now(),
                    'updated_at' => now(),
                ]);
        });
    }
}