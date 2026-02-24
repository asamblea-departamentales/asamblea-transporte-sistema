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
            TipoVehiculoSeeder::class, // 4. Crea los tipos de vehículos
            VehCatalogosSeeder::class, // 5. Crea los catálogos de vehículos
            VehiculosSeeder::class,  // 6. Crea vehículos de prueba
        ]);
    }
}