<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TamanosProveedorSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tamanos_proveedor')->insertOrIgnore([
            ['id' => 1, 'nombre' => 'PEQUEÑO', 'activo' => true],
            ['id' => 2, 'nombre' => 'GRANDE',  'activo' => true],
            ['id' => 4, 'nombre' => 'MEDIANO', 'activo' => true],
        ]);
    }
}