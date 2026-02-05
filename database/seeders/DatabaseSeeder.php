<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesSeeder::class,      // 1. Crea los permisos
            UnidadesSeeder::class,   // 2. Crea las oficinas/unidades
            UsersSeeder::class,      // 3. Crea los usuarios vinculados a lo anterior
        ]);
    }
}