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
        $rows = [

            ['Carlos Ernesto López Martínez', 2, 1078, '0210-210957-003-3', null, '7797-1102', '2020-09-30', 1],
            ['José Antonio Pérez González', 2, 1079, '0811-101257-001-6', null, '7749-7107', '2021-12-31', 0],
            ['Miguel Ángel Ramos Flores', 2, 1080, '1001-110909-650-0', null, '7496-4259', '2019-09-30', 0],
            ['Roberto Carlos Mejía Hernández', 2, 1081, '0103-110264-001-5', null, '7874-8681', '2019-02-28', 1],
            ['Juan Pablo Castillo Rivera', 3, 1082, '0821-270662-002-6', null, '7807-8657', '2019-06-30', 1],
            ['Eduardo José Morales Cruz', 3, 1083, '0814-010468-101-3', null, '7981-9391', '2016-04-13', 0],
            ['Héctor Manuel Gutiérrez Díaz', 2, 1084, '0419-210366-101-4', null, '7870-9967', '2018-03-31', 1],
            ['Oscar René Fuentes Aguilar', 3, 1085, '0407-260672-101-9', null, '6009-8954', '2019-06-30', 0],
            ['Luis Alberto Vásquez Pineda', 2, 1086, '1006-081156-001-9', null, '7295-5141', '2020-11-30', 0],

        ];

        foreach ($rows as $r) {

            [
                $nombre,
                $tipoLicenciaId,
                $numeroEmpleado,
                $numeroLicencia,
                $correo,
                $telefono,
                $fechaVencimiento,
                $activo
            ] = $r;

            /*
            |--------------------------------------------------------------------------
            | Tipo licencia
            |--------------------------------------------------------------------------
            */

            $tipo = TipoLicencia::firstOrCreate(
                ['id' => $tipoLicenciaId],
                [
                    'nombre' => "TLC {$tipoLicenciaId}",
                    'activo' => true,
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | Primer nombre + primer apellido
            |--------------------------------------------------------------------------
            */

            $parts = array_values(array_filter(explode(' ', trim($nombre))));

            $firstName = $parts[0] ?? '';
            $lastName = $parts[1] ?? '';

            $shortName = trim("{$firstName} {$lastName}");

            /*
            |--------------------------------------------------------------------------
            | Username / correo limpio
            |--------------------------------------------------------------------------
            */

            $baseIdentity = Str::of($shortName)
                ->ascii()
                ->lower()
                ->slug('.');

            /*
            |--------------------------------------------------------------------------
            | Correo fallback
            |--------------------------------------------------------------------------
            */

            if (empty($correo)) {
                $correo = "{$baseIdentity}@asamblea.gob.sv";
            }

            /*
            |--------------------------------------------------------------------------
            | Buscar usuario o crearlo
            |--------------------------------------------------------------------------
            */

            $user = User::where('name', $nombre)->first();

            if (! $user) {

                $username = $baseIdentity;

                /*
                |--------------------------------------------------------------------------
                | Evitar usernames duplicados
                |--------------------------------------------------------------------------
                */

                $counter = 1;

                while (
                    User::where('username', $username)->exists()
                ) {
                    $username = "{$baseIdentity}{$counter}";
                    $counter++;
                }

                $user = User::create([
                    'name' => $nombre,
                    'username' => $username,
                    'email' => $correo,
                    'password' => bcrypt('password'),
                ]);

                $user->assignRole('motorista');
            }

            /*
            |--------------------------------------------------------------------------
            | Crear o actualizar motorista
            |--------------------------------------------------------------------------
            */

            Motorista::updateOrCreate(

                [
                    'numero_empleado' => $numeroEmpleado,
                ],

                [
                    'user_id' => $user->id,

                    'tipo_licencia_id' => $tipo->id,

                    'nombre' => $nombre,

                    'dui' => $numeroLicencia,

                    'numero_licencia' => $numeroLicencia,

                    'telefono' => $telefono ?? '0000-0000',

                    'correo' => $correo,

                    'radio' => null,

                    'fecha_vencimiento_licencia' => $fechaVencimiento,

                    'activo' => (bool) $activo,
                ]
            );
        }

        $this->command->info('MotoristasSeeder ejecutado correctamente.');
    }
}
