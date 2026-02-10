<?php

namespace Database\Seeders;

use App\Models\UnidadSolicitante;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash; // Importante para el password

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        // Buscamos la unidad (asegúrate que el seeder de unidades corra antes)
        $seg = UnidadSolicitante::where('siglas', 'SEG')->first();
        $unidadId = $seg ? $seg->id : null;

        // Usuario Jefe (autorizador)
        $jefe = User::create([
            'name' => 'Jefe autorizador',
            'email' => 'jefe.transporte@asamblea.gob.sv',
            'password' => Hash::make('boss123'), // SIEMPRE con Hash::make
            'unidad_solicitante_id' => $unidadId,
        ]);
        $jefe->assignRole('jefe');

        // Usuario Solicitante
        $solicitante = User::create([
            'name' => 'Julian Solicitante',
            'email' => 'julian.alvarez@asamblea.gob.sv',
            'password' => Hash::make('solicitante123'),
            'unidad_solicitante_id' => $unidadId,
        ]);
        $solicitante->assignRole('solicitante');

        // SuperAdmin (El que necesitas para entrar al panel)
        $admin = User::create([
            'name' => 'Super Administrador',
            'email' => 'admin@asamblea.gob.sv',
            'password' => Hash::make('admin123'),
            'unidad_solicitante_id' => $unidadId,
        ]);
        $admin->assignRole('super_admin');
    }
}