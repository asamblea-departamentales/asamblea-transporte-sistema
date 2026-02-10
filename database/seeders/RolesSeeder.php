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
}