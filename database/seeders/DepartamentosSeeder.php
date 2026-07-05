<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartamentosSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('departamentos')->insertOrIgnore([
            ['id' => 1,  'pais_id' => 1, 'nombre' => 'AHUACHAPÁN',    'activo' => true],
            ['id' => 2,  'pais_id' => 1, 'nombre' => 'SANTA ANA',     'activo' => true],
            ['id' => 3,  'pais_id' => 1, 'nombre' => 'SONSONATE',     'activo' => true],
            ['id' => 4,  'pais_id' => 1, 'nombre' => 'USULUTÁN',      'activo' => true],
            ['id' => 5,  'pais_id' => 1, 'nombre' => 'SAN MIGUEL',    'activo' => true],
            ['id' => 6,  'pais_id' => 1, 'nombre' => 'MORAZÁN',       'activo' => true],
            ['id' => 7,  'pais_id' => 1, 'nombre' => 'LA UNIÓN',      'activo' => true],
            ['id' => 8,  'pais_id' => 1, 'nombre' => 'LA LIBERTAD',   'activo' => true],
            ['id' => 9,  'pais_id' => 1, 'nombre' => 'CHALATENANGO',  'activo' => true],
            ['id' => 10, 'pais_id' => 1, 'nombre' => 'CUSCATLÁN',     'activo' => true],
            ['id' => 11, 'pais_id' => 1, 'nombre' => 'SAN SALVADOR',  'activo' => true],
            ['id' => 12, 'pais_id' => 1, 'nombre' => 'LA PAZ',        'activo' => true],
            ['id' => 13, 'pais_id' => 1, 'nombre' => 'CABAÑAS',       'activo' => true],
            ['id' => 14, 'pais_id' => 1, 'nombre' => 'SAN VICENTE',   'activo' => true],
        ]);
    }
}
