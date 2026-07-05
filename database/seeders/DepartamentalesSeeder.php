<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartamentalesSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['codigo' => 'AH', 'nombre' => 'Ahuachapán'],
            ['codigo' => 'SA', 'nombre' => 'Santa Ana'],
            ['codigo' => 'SO', 'nombre' => 'Sonsonate'],
            ['codigo' => 'CH', 'nombre' => 'Chalatenango'],
            ['codigo' => 'LL', 'nombre' => 'La Libertad'],
            ['codigo' => 'SS', 'nombre' => 'San Salvador'],
            ['codigo' => 'CU', 'nombre' => 'Cuscatlán'],
            ['codigo' => 'LP', 'nombre' => 'La Paz'],
            ['codigo' => 'CA', 'nombre' => 'Cabañas'],
            ['codigo' => 'SV', 'nombre' => 'San Vicente'],
            ['codigo' => 'US', 'nombre' => 'Usulután'],
            ['codigo' => 'SM', 'nombre' => 'San Miguel'],
            ['codigo' => 'MO', 'nombre' => 'Morazán'],
            ['codigo' => 'LU', 'nombre' => 'La Unión'],
        ];

        foreach ($rows as $r) {
            // Usamos updateOrInsert
            DB::table('departamentales')->updateOrInsert(
                ['codigo' => $r['codigo']],
                [
                    'nombre' => $r['nombre'],
                    'updated_at' => now(),
                    'created_at' => now(), // Simplificado para pruebas
                ]
            );

            // Esto imprimirá cada departamento en la consola mientras se inserta
            $this->command->info(string: "Procesado: {$r['nombre']}");
        }

        $this->command->info('¡Departamentos cargados con éxito!');
    }
}
