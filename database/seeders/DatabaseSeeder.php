<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // Sin dependencias
            RolesSeeder::class,
            PaisesSeeder::class,
            ActividadesEconomicasSeeder::class,
            TamanosProveedorSeeder::class,
            TipoLicenciasSeeder::class,
            UnidadesSeeder::class,
            DepartamentalesSeeder::class,
            TipoVehiculoSeeder::class,
            VehCatalogosSeeder::class,
            ParametrosSistemaSeeder::class,
            GruposSeeder::class,

            // Jerarquía geográfica
            DepartamentosSeeder::class,
            MunicipiosSeeder::class,

            // Dependen de los anteriores
            ProveedoresSeeder::class,
            UsersSeeder::class,
            VehiculosSeeder::class,
            MotoristasSeeder::class,

            // Dependen de tablas ya pobladas
            SerieCargasSeeder::class,
        ]);
    }
}