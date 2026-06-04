<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Motorista;
use App\Models\TipoLicencia;
use App\Models\User;

class MotoristasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Este seeder mapea parte del volcado legacy `mot_motorista` al modelo
     * `Motorista` usado por la aplicación. Intenta resolver el nombre del
     * motorista buscando el `User` con `id = mot_empleado`; si no existe
     * usará un nombre generico.
     */
    public function run()
    {
        // Datos extraídos y adaptados del volcado SQL proporcionado.
        $rows = [
            // mot_id_tlc, mot_empleado, mot_licencia, mot_correo, mot_telefono, mot_fecha_venci, mot_estado
            [2, 1078, '0210-210957-003-3', null, '7797-1102', '2020-09-30', 1],
            [2, 1079, '0811-101257-001-6', null, '7749-7107', '2021-12-31', 0],
            [2, 1080, '1001-110909-650-0', null, '7496-4259', '2019-09-30', 0],
            [2, 1081, '0103-110264-001-5', null, '7874-8681', '2019-02-28', 1],
            [3, 1082, '0821-270662-002-6', null, '7807-8657', '2019-06-30', 1],
            [3, 1083, '0814-010468-101-3', null, '7981-9391', '2016-04-13', 0],
            [2, 1084, '0419-210366-101-4', null, '7870-9967', '2018-03-31', 1],
            [3, 1085, '0407-260672-101-9', null, '6009-8954', '2019-06-30', 0],
            [2, 1086, '1006-081156-001-9', null, '7295-5141', '2020-11-30', 0],
            [2, 1088, '0801-040864-101-7', null, '7812-1993', '2020-08-31', 1],
            [3, 1077, '0614-050962-012-9', null, '7981-8356', '2018-09-30', 1],
            [3, 1090, '0203-120273-101-5', null, '7981-8014', '2018-02-28', 1],
            [3, 1087, '0614-050770-103-3', null, '7981-9309', '2020-04-30', 1],
            [3, 1099, '0614-280475-107-7', null, '7495-9960', '2019-04-30', 1],
            [2, 1100, '0614-110179-127-5', null, null, '2016-10-06', 1],
            [3, 1098, '0614-160975-141-4', null, '6188-8829', '2018-09-30', 1],
            [3, 1102, '1001-271171-101-1', null, '7171-3793', '2019-11-30', 1],
            [3, 429,  '1002-311075-101-8', 'JAIME.CARRANZA@ASAMBLEA.GOB.SV', '7323-3579', '2018-10-31', 1],
            [3, 215,  null, null, null, '2017-02-22', 1],
            [3, 461,  null, null, null, '2017-02-22', 1],
        ];

        foreach ($rows as $r) {
            [$mot_tlc, $mot_empleado, $mot_licencia, $mot_correo, $mot_telefono, $mot_fecha_venci, $mot_estado] = $r;

            // Resolver tipo de licencia (crear uno si no existe)
            $tipo = TipoLicencia::find($mot_tlc);
            if (! $tipo) {
                $tipo = TipoLicencia::create(['nombre' => "TLC {$mot_tlc}", 'activo' => true]);
            }

            // Intentar resolver nombre desde la tabla users (si existe)
            $user = User::find($mot_empleado);
            $nombre = $user ? ($user->name ?? "Empleado {$mot_empleado}") : "Empleado {$mot_empleado}";

            // Construir datos mínimos para el modelo Motorista
            $motorista = new Motorista();
            $motorista->nombre = $nombre;

            // DUI: si viene null en el volcado, generamos un placeholder legible
            $motorista->dui = $mot_licencia ?? "DUI-{$mot_empleado}";

            // Teléfono: si falta, rellenar con placeholder para evitar nulls
            $motorista->telefono = $mot_telefono ?? '0000-0000';

            $motorista->activo = (bool) $mot_estado;

            // Si no viene correo en el volcado, generamos uno razonable
            if (empty($mot_correo)) {
                $generated = strtolower(preg_replace('/[^a-z0-9]+/i', '.', trim($nombre)));
                $mot_correo = $generated ? "{$generated}@asamblea.gob.sv" : "motorista{$mot_empleado}@asamblea.gob.sv";
            }

            // Si la columna tipo_licencia_id existe en la tabla, asignarla.
            if (schemaHasColumn('motoristas', 'tipo_licencia_id')) {
                $motorista->tipo_licencia_id = $tipo->id;
            }

            // Número de empleado en la tabla real
            if (schemaHasColumn('motoristas', 'numero_empleado')) {
                $motorista->numero_empleado = $mot_empleado;
            }

            // Número de licencia (campo adicional en la tabla real)
            if (schemaHasColumn('motoristas', 'numero_licencia')) {
                $motorista->numero_licencia = $mot_licencia ?? "LIC-{$mot_empleado}";
            }

            // Si el modelo usa 'correo' como email, asignarlo (no es obligatorio)
            if (schemaHasColumn('motoristas', 'correo')) {
                $motorista->correo = $mot_correo;
            }

            // Radio (no presente en el volcado original, conservamos por compatibilidad)
            if (schemaHasColumn('motoristas', 'radio')) {
                $motorista->radio = null;
            }

            // Si existe columna para vencimiento de licencia, asignar
            if (schemaHasColumn('motoristas', 'fecha_vencimiento_licencia')) {
                $motorista->fecha_vencimiento_licencia = $mot_fecha_venci;
            }

            $motorista->save();
        }

        $this->command->info('Motoristas seed completed: ' . count($rows) . ' records.');
    }
}

/**
 * Helper pequeño: comprueba si una columna existe en la tabla usando el schema builder.
 * Definimos fuera de la clase para mantener compatibilidad en versiones de Laravel.
 */
function schemaHasColumn(string $table, string $column): bool
{
    try {
        return \Schema::hasColumn($table, $column);
    } catch (\Exception $e) {
        return false;
    }
}
