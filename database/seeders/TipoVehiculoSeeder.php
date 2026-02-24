<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TipoVehiculoSeeder extends Seeder
{
    public function run(): void
    {
        $tipos = [
            ['nombre' => 'Sedán',               'activo' => true],
            ['nombre' => 'Microbús',             'activo' => true],
            ['nombre' => 'Camión 2 Toneladas',   'activo' => true],
        ];

        foreach ($tipos as $tipo) {
            DB::table('tipo_vehiculos')->insertOrIgnore(array_merge($tipo, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        $this->command->info('Tipos de vehículo insertados correctamente.');
    }
}