<?php

namespace Database\Seeders;

use App\Models\TipoLicencia;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            DepartamentalesSeeder::class, // 12. Crea las departamentales
            RolesSeeder::class,      // 1. Crea los permisos
            UnidadesSeeder::class,   // 2. Crea las oficinas/unidades
            UsersSeeder::class,      // 3. Crea los usuarios vinculados a lo anterior
            TipoVehiculoSeeder::class, // 4. Crea los tipos de vehículos
            VehCatalogosSeeder::class, // 5. Crea los catálogos de vehículos
            VehiculosSeeder::class,  // 6. Crea vehículos de prueba
            MotoristasSeeder::class,  // 7. Crea motoristas de prueba
            TipoLicenciasSeeder::class,  // 8. Crea tipos de licencia
            AsignacionVehiculoMotoristaSeeder::class, // 9. Crea asignaciones
            GruposSeeder::class,     // 10. Crea los grupos de prioridades
            ActividadesEconomicasSeeder::class, // 11. Crea actividades económicas
            PaisesSeeder::class, // 13. Crea los países
            MunicipiosSeeder::class, // 14. Crea los municipios
            ParametrosSistemaSeeder::class, // 15. Crea los parámetros del sistema
            ProveedoresSeeder::class, // 16. Crea los proveedores
            SerieCargasSeeder::class, // 17. Crea las series de cargas
            TamanosProveedorSeeder::class, // 18. Crea los tamaños de proveedor
            UsersSeeder::class, // 19. Crea los usuarios
        ]);
    }
}