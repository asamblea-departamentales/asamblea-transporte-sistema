<?php

namespace Database\Seeders;

use App\Models\UnidadSolicitante;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema; // Importamos Schema

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Desactivamos llaves foráneas para poder limpiar la tabla
        Schema::disableForeignKeyConstraints();
        
        // 2. Limpiamos la tabla de usuarios antes de insertar
        User::truncate(); 
        
        // 3. Reactivamos las restricciones inmediatamente
        Schema::enableForeignKeyConstraints();

        // Buscamos la unidad (asegúrate que el seeder de unidades corra antes)
        $seg = UnidadSolicitante::where('siglas', 'SEG')->first();
        $unidadId = $seg ? $seg->id : null;

        // Usuario Jefe (autorizador)
        $jefe = User::create([
            'name' => 'Jefe autorizador',
            'username' => 'jefe.transporte',
            'email' => 'jefe.transporte@asamblea.gob.sv',
            'password' => Hash::make('boss123'),
            'unidad_solicitante_id' => $unidadId,
        ]);
        $jefe->assignRole('jefe');

        // Usuario Solicitante
        $solicitante = User::create([
            'name' => 'Julian Solicitante',
            'username' => 'julian.alvarez',
            'email' => 'julian.alvarez@asamblea.gob.sv',
            'password' => Hash::make('solicitante123'),
            'unidad_solicitante_id' => $unidadId,
        ]);
        $solicitante->assignRole('solicitante');

        // SuperAdmin (El que necesitas para entrar al panel)
        $admin = User::create([
            'name' => 'Super Administrador',
            'username' => 'admin',
            'email' => 'admin@asamblea.gob.sv',
            'password' => Hash::make('admin123'),
            'unidad_solicitante_id' => $unidadId,
        ]);

        //Rol operativo
        $operativo = User::create([
            'name' => 'Operativo',
            'username' => 'operativo',
            'email' => 'operativo@asamblea.gob.sv',
            'password' => Hash::make('operativo123'),
            'unidad_solicitante_id' => $unidadId,
        ]);
        $operativo->assignRole('operativo');

        $admin->assignRole('super_admin');
    }
}
