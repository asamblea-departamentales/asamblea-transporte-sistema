<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Domain\Vehiculos\Services\AsignacionVehiculoMotoristaService;
use Illuminate\Support\Facades\DB;

class AsignacionVehiculoMotoristaSeeder extends Seeder
{
    public function run(): void
    {
        $service = new AsignacionVehiculoMotoristaService();

        $vehiculos  = DB::table('vehiculos')->pluck('id')->toArray();
        $motoristas = DB::table('motoristas')->pluck('id')->toArray();

        // Asignar un motorista a cada vehículo (máximo 9 pares)
        $pares = min(count($vehiculos), count($motoristas));

        for ($i = 0; $i < $pares; $i++) {
            $service->asignar($vehiculos[$i], $motoristas[$i]);
        }

        $this->command->info("{$pares} asignaciones vehículo-motorista creadas.");
    }
}