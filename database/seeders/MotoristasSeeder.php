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
            ['nombre' => 'ALFREDO LOPEZ LOPEZ', 'expediente' => 3500, 'telefono' => '7000-0001'],
            ['nombre' => 'ANGEL ORLANDO ZAPATA RAMIREZ', 'expediente' => 8766, 'telefono' => '7000-0002'],
            ['nombre' => 'BRANDON ADONAY GOMEZ RODAS', 'expediente' => 7870, 'telefono' => '7000-0003'],
            ['nombre' => 'CARLOS ERNESTO VILLACORTA PANAMEÑO', 'expediente' => 187, 'telefono' => '7000-0004'],
            ['nombre' => 'CARLOS ROBERTO ROSALES PEREZ', 'expediente' => 8762, 'telefono' => '7000-0005'],
            ['nombre' => 'JAIME EDGARDO CARRANZA DIMAS', 'expediente' => 1187, 'telefono' => '7000-0006'],
            ['nombre' => 'JORGE HUMBERTO INTERIANO AGUILAR', 'expediente' => 481, 'telefono' => '7000-0007'],
            ['nombre' => 'JOSE ANTONIO BATRES JAIMES', 'expediente' => 7765, 'telefono' => '7000-0008'],
            ['nombre' => 'LUIS ANTONIO RECINOS MONGE', 'expediente' => 209, 'telefono' => '7000-0009'],
            ['nombre' => 'LUIS OSMIN TAMACAS HUEZO', 'expediente' => 1544, 'telefono' => '7000-0010'],
            ['nombre' => 'MARVIN ISAAC SOLIS BENAVIDES', 'expediente' => 6952, 'telefono' => '7000-0011'],
            ['nombre' => 'MIGUEL ANGEL MENJIVAR', 'expediente' => 880, 'telefono' => '7000-0012'],
            ['nombre' => 'NEFTALY AMILCAR RAMIREZ ORELLANA', 'expediente' => 7764, 'telefono' => '7000-0013'],
            ['nombre' => 'NELSON EDGARDO COLORADO', 'expediente' => 2793, 'telefono' => '7000-0014'],
            ['nombre' => 'OSCAR ERNESTO TOBAR ARGUIETA', 'expediente' => 4344, 'telefono' => '7000-0015'],
            ['nombre' => 'OSCAR RENE RIVERA REYES', 'expediente' => 8767, 'telefono' => '7000-0016'],
            ['nombre' => 'RICARDO HERRERA MERCADO', 'expediente' => 4369, 'telefono' => '7000-0017'],
            ['nombre' => 'ROBERTO ALEXANDER RIVERA VILLEDA', 'expediente' => 7156, 'telefono' => '7000-0018'],
            ['nombre' => 'ROBERTO CARLOS SARAVIA', 'expediente' => 7158, 'telefono' => '7000-0019'],
            ['nombre' => 'RUBEN ALCIDES POSADA LEMUS', 'expediente' => 4699, 'telefono' => '7000-0020'],
            ['nombre' => 'TOMAS VARELA ALFARO', 'expediente' => 5589, 'telefono' => '7000-0021'],
            ['nombre' => 'VICTOR EMILIO ALVAREZ COLINDRES', 'expediente' => 8014, 'telefono' => '7000-0022'],
        ];

        $tipoLicencia = TipoLicencia::firstOrCreate(
            ['id' => 3],
            ['nombre' => 'LIVIANA', 'activo' => true]
        );

        foreach ($motoristas as $m) {
            $telefonoLimpio = preg_replace('/\D/', '', $m['telefono']);

            $username = $telefonoLimpio;
            $counter = 1;
            while (User::where('username', $username)->exists()) {
                $username = "{$telefonoLimpio}{$counter}";
                $counter++;
            }

            $correo = strtolower(Str::slug($m['nombre'], '.')).'@asamblea.gob.sv';

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
                    'telefono' => $m['telefono'],
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
