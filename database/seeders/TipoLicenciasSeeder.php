<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TipoLicenciasSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tipo_licencias')->insertOrIgnore([
            ['id' => 1, 'nombre' => 'LICENCIA JUVENIL', 'activo' => true],
            ['id' => 2, 'nombre' => 'PESADA',           'activo' => true],
            ['id' => 3, 'nombre' => 'LIVIANA',          'activo' => true],
            ['id' => 4, 'nombre' => 'MOTOCICLETA',      'activo' => true],
        ]);
    }
}