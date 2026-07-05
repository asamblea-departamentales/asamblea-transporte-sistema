<?php

namespace Database\Seeders;

use App\Models\Grupo;
use Illuminate\Database\Seeder;

class GruposSeeder extends Seeder
{
    public function run(): void
    {
        $grupos = [
            [
                'nombre' => 'Presidencia',
                'descripcion' => 'Despacho de la Presidencia',
                'nivel_prioridad' => 'critica',
                'orden' => 1,
                'activo' => true,
            ],
            [
                'nombre' => 'Junta Directiva',
                'descripcion' => 'Junta Directiva de la Asamblea',
                'nivel_prioridad' => 'alta',
                'orden' => 2,
                'activo' => true,
            ],
            [
                'nombre' => 'Nuevas Ideas',
                'descripcion' => 'Fracción Nuevas Ideas',
                'nivel_prioridad' => 'alta',
                'orden' => 3,
                'activo' => true,
            ],
            [
                'nombre' => 'VORDE',
                'descripcion' => 'Departamento VORDE',
                'nivel_prioridad' => 'media',
                'orden' => 4,
                'activo' => true,
            ],
            [
                'nombre' => 'Otros',
                'descripcion' => 'Usuarios sin grupo específico',
                'nivel_prioridad' => 'baja',
                'orden' => 5,
                'activo' => true,
            ],
        ];

        foreach ($grupos as $grupo) {
            Grupo::firstOrCreate(
                ['nombre' => $grupo['nombre']],
                $grupo
            );
        }
    }
}
