<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MotoristaSeeder extends Seeder
{
    public function run(): void
    {
        $motoristas = [
            ['nombre' => 'Carlos Ernesto López Martínez',  'dui' => '01234567-8', 'telefono' => '7111-1111', 'activo' => true],
            ['nombre' => 'José Antonio Pérez González',    'dui' => '02345678-9', 'telefono' => '7222-2222', 'activo' => true],
            ['nombre' => 'Miguel Ángel Ramos Flores',      'dui' => '03456789-0', 'telefono' => '7333-3333', 'activo' => true],
            ['nombre' => 'Roberto Carlos Mejía Hernández', 'dui' => '04567890-1', 'telefono' => '7444-4444', 'activo' => true],
            ['nombre' => 'Juan Pablo Castillo Rivera',     'dui' => '05678901-2', 'telefono' => '7555-5555', 'activo' => true],
            ['nombre' => 'Eduardo José Morales Cruz',      'dui' => '06789012-3', 'telefono' => '7666-6666', 'activo' => true],
            ['nombre' => 'Héctor Manuel Gutiérrez Díaz',  'dui' => '07890123-4', 'telefono' => '7777-7777', 'activo' => true],
            ['nombre' => 'Oscar René Fuentes Aguilar',    'dui' => '08901234-5', 'telefono' => '7888-8888', 'activo' => true],
            ['nombre' => 'Luis Alberto Vásquez Pineda',   'dui' => '09012345-6', 'telefono' => '7999-9999', 'activo' => true],
        ];

        foreach ($motoristas as $motorista) {
            DB::table('motoristas')->insertOrIgnore(array_merge($motorista, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        $this->command->info('Motoristas insertados correctamente.');
    }
}