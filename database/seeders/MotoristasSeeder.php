<?php

namespace Database\Seeders;

use App\Models\Motorista;
use App\Models\TipoLicencia;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MotoristasSeeder extends Seeder
{
    public function run(): void
    {
        $motoristas = [
            ['nombre' => 'ALFREDO LOPEZ LOPEZ', 'expediente' => 3500],
            ['nombre' => 'ANGEL ORLANDO ZAPATA RAMIREZ', 'expediente' => 8766],
            ['nombre' => 'BRANDON ADONAY GOMEZ RODAS', 'expediente' => 7870],
            ['nombre' => 'CARLOS ERNESTO VILLACORTA PANAMEÑO', 'expediente' => 187],
            ['nombre' => 'CARLOS ROBERTO ROSALES PEREZ', 'expediente' => 8762],
            ['nombre' => 'JAIME EDGARDO CARRANZA DIMAS', 'expediente' => 1187],
            ['nombre' => 'JORGE HUMBERTO INTERIANO AGUILAR', 'expediente' => 481],
            ['nombre' => 'JOSE ANTONIO BATRES JAIMES', 'expediente' => 7765],
            ['nombre' => 'LUIS ANTONIO RECINOS MONGE', 'expediente' => 209],
            ['nombre' => 'LUIS OSMIN TAMACAS HUEZO', 'expediente' => 1544],
            ['nombre' => 'MARVIN ISAAC SOLIS BENAVIDES', 'expediente' => 6952],
            ['nombre' => 'MIGUEL ANGEL MENJIVAR', 'expediente' => 880],
            ['nombre' => 'NEFTALY AMILCAR RAMIREZ ORELLANA', 'expediente' => 7764],
            ['nombre' => 'NELSON EDGARDO COLORADO', 'expediente' => 2793],
            ['nombre' => 'OSCAR ERNESTO TOBAR ARGUIETA', 'expediente' => 4344],
            ['nombre' => 'OSCAR RENE RIVERA REYES', 'expediente' => 8767],
            ['nombre' => 'RICARDO HERRERA MERCADO', 'expediente' => 4369],
            ['nombre' => 'ROBERTO ALEXANDER RIVERA VILLEDA', 'expediente' => 7156],
            ['nombre' => 'ROBERTO CARLOS SARAVIA', 'expediente' => 7158],
            ['nombre' => 'RUBEN ALCIDES POSADA LEMUS', 'expediente' => 4699],
            ['nombre' => 'TOMAS VARELA ALFARO', 'expediente' => 5589],
            ['nombre' => 'VICTOR EMILIO ALVAREZ COLINDRES', 'expediente' => 8014],
        ];

        $tipoLicencia = TipoLicencia::firstOrCreate(
            ['id' => 3],
            ['nombre' => 'LIVIANA', 'activo' => true]
        );

        foreach ($motoristas as $m) {
            $correo = strtolower(Str::slug($m['nombre'], '.')).'@asamblea.gob.sv';

            $username = "motorista_{$m['expediente']}";
            $counter = 1;
            while (User::where('username', $username)->exists()) {
                $username = "motorista_{$m['expediente']}_{$counter}";
                $counter++;
            }

            $user = User::create([
                'name' => $m['nombre'],
                'username' => $username,
                'email' => $correo,
                'password' => bcrypt('password'),
                'debe_cambiar_password' => true,
            ]);

            $user->assignRole('motorista');

            Motorista::updateOrCreate(
                ['numero_empleado' => $m['expediente']],
                [
                    'user_id' => $user->id,
                    'tipo_licencia_id' => $tipoLicencia->id,
                    'nombre' => $m['nombre'],
                    'dui' => null,
                    'numero_licencia' => null,
                    'telefono' => null,
                    'correo' => $correo,
                    'radio' => null,
                    'fecha_vencimiento_licencia' => null,
                    'activo' => true,
                ]
            );
        }

        $this->command->info('MotoristasSeeder ejecutado correctamente. 22 motoristas creados.');
    }
}
