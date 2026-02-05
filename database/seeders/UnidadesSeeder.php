<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\UnidadSolicitante;

class UnidadesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $unidades = [
            ['nombre' => 'Recursos Humanos', 'siglas' => 'RRHH', 'estado' => true, 'puede_solicitar_transporte' => true],
            ['nombre' => 'Television Legislativa', 'siglas' => 'TVL', 'estado' => true, 'puede_solicitar_transporte' => true],
            ['nombre' => 'Seguridad', 'siglas' => 'SEG', 'estado' => true, 'puede_solicitar_transporte' => true],
            ['nombre' => 'Logística', 'siglas' => 'LOG', 'estado' => true, 'puede_solicitar_transporte' => true],
            ['nombre' => 'Comunicación Social', 'siglas' => 'COMSOC', 'estado' => true, 'puede_solicitar_transporte' => true],
        ];

        foreach ($unidades as $unidad) {
            UnidadSolicitante::create($unidad);
        }
    }
}
