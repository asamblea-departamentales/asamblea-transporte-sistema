<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ActividadesEconomicasSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('actividades_economicas')->insertOrIgnore([
            ['id' => 1, 'nombre' => 'VENTAS',        'activo' => true],
            ['id' => 2, 'nombre' => 'PRODUCCIÓN',    'activo' => true],
            ['id' => 3, 'nombre' => 'DISTRIBUCIÓN',  'activo' => true],
        ]);
    }
}
