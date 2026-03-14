<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        // Forzamos el guard_name a 'web' para que Filament los vea
        Role::create(['name' => 'super_admin', 'guard_name' => 'web']);
        Role::create(['name' => 'solicitante', 'guard_name' => 'web']);
        Role::create(['name' => 'jefe', 'guard_name' => 'web']);
        Role::create(['name' => 'ti', 'guard_name' => 'web']);
    }
}<?php

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
    }
}