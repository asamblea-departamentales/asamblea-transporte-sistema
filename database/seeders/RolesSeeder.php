<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'solicitante', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'jefe', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'ti', 'guard_name' => 'web']);

        // Nuevos roles del flujo
        Role::firstOrCreate(['name' => 'operativo', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'liquidador', 'guard_name' => 'web']);
        // Nuevo rol para interfaz de motorista
        Role::firstOrCreate(['name' => 'motorista', 'guard_name' => 'web']);
    }
}
