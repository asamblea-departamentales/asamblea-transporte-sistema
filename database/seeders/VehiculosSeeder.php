<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\TipoVehiculo;

class VehiculosSeeder extends Seeder
{
    public function run(): void
    {
        // IDs de catálogos — asegúrate de correr VehCatalogosSeeder primero
        $marcaToyota     = DB::table('veh_marcas')->where('nombre', 'Toyota')->value('id');
        $marcaMitsubishi = DB::table('veh_marcas')->where('nombre', 'Mitsubishi')->value('id');
        $marcaHino       = DB::table('veh_marcas')->where('nombre', 'Hino')->value('id');
        $marcaNissan     = DB::table('veh_marcas')->where('nombre', 'Nissan')->value('id');
        $marcaIsuzu      = DB::table('veh_marcas')->where('nombre', 'Isuzu')->value('id');

        $modeloCorolla   = DB::table('veh_modelos')->where('nombre', 'Corolla')->value('id');
        $modeloMontero   = DB::table('veh_modelos')->where('nombre', 'Montero')->value('id');
        $modeloDutro     = DB::table('veh_modelos')->where('nombre', 'Dutro')->value('id');
        $modeloUrvan     = DB::table('veh_modelos')->where('nombre', 'Urvan')->value('id');
        $modeloNPR       = DB::table('veh_modelos')->where('nombre', 'NPR')->value('id');

        $colorBlanco     = DB::table('veh_colores')->where('nombre', 'Blanco')->value('id');
        $colorGris       = DB::table('veh_colores')->where('nombre', 'Gris')->value('id');
        $colorPlata      = DB::table('veh_colores')->where('nombre', 'Plata')->value('id');

        $motorGasolina   = DB::table('veh_tipos_motor')->where('nombre', 'Gasolina')->value('id');
        $motorDiesel     = DB::table('veh_tipos_motor')->where('nombre', 'Diesel')->value('id');

        $transManual     = DB::table('veh_transmisiones')->where('nombre', 'Manual')->value('id');
        $transAuto       = DB::table('veh_transmisiones')->where('nombre', 'Automática')->value('id');

        $traccion4x2     = DB::table('veh_tracciones')->where('nombre', '4x2')->value('id');
        $traccion4x4     = DB::table('veh_tracciones')->where('nombre', '4x4')->value('id');

        $llantaEstandar  = DB::table('veh_tipo_llantas')->where('nombre', 'Estándar')->value('id');
        $llantaTT        = DB::table('veh_tipo_llantas')->where('nombre', 'Todo terreno')->value('id');

        $combGasolina    = DB::table('veh_tipo_combustible')->where('nombre', 'Gasolina')->value('id');
        $combDiesel      = DB::table('veh_tipo_combustible')->where('nombre', 'Diesel')->value('id');

        $clasSedán       = DB::table('veh_clasificaciones')->where('nombre', 'Sedán')->value('id');
        $clasMicrobus    = DB::table('veh_clasificaciones')->where('nombre', 'Microbús')->value('id');
        $clasCamion      = DB::table('veh_clasificaciones')->where('nombre', 'Camión 2 Toneladas')->value('id');

        $estadoDisponible = DB::table('veh_estados_catalogo')->where('nombre', 'Disponible')->value('id');

        // TipoVehiculo (basado en el seeder de TipoVehiculoSeeder)
        $tipoSedan = TipoVehiculo::where('nombre', 'Sedán')->value('id');
        $tipoMicrobus = TipoVehiculo::where('nombre', 'Microbús')->value('id');
        $tipoCamion = TipoVehiculo::where('nombre', 'Camión 2 Toneladas')->value('id');
       
        $vehiculos = [
            // Sedanes
            [
                'placa'                  => 'P-123456',
                'tipo_vehiculo_id'       => $tipoSedan,
                'anio'                   => 2020,
                'capacidad_personas'     => 5,
                'estado'                 => 'disponible',
                'activo'                 => true,
                'veh_marca_id'           => $marcaToyota,
                'veh_modelo_id'          => $modeloCorolla,
                'veh_color_id'           => $colorBlanco,
                'veh_tipo_motor_id'      => $motorGasolina,
                'veh_transmision_id'     => $transAuto,
                'veh_traccion_id'        => $traccion4x2,
                'veh_tipo_llanta_id'     => $llantaEstandar,
                'veh_tipo_combustible_id'=> $combGasolina,
                'veh_clasificacion_id'   => $clasSedán,
                'veh_estado_catalogo_id' => $estadoDisponible,
                'num_llantas'            => 4,
                'chasis'                 => 'CHS-001-2020',
                'vin'                    => 'VIN-TOY-001',
                'motor_numero'           => 'MOT-001',
            ],
            [
                'placa'                  => 'P-234567',
                'tipo_vehiculo_id'       => $tipoSedan,
                'anio'                   => 2021,
                'capacidad_personas'     => 5,
                'estado'                 => 'disponible',
                'activo'                 => true,
                'veh_marca_id'           => $marcaMitsubishi,
                'veh_modelo_id'          => $modeloMontero,
                'veh_color_id'           => $colorPlata,
                'veh_tipo_motor_id'      => $motorGasolina,
                'veh_transmision_id'     => $transAuto,
                'veh_traccion_id'        => $traccion4x4,
                'veh_tipo_llanta_id'     => $llantaEstandar,
                'veh_tipo_combustible_id'=> $combGasolina,
                'veh_clasificacion_id'   => $clasSedán,
                'veh_estado_catalogo_id' => $estadoDisponible,
                'num_llantas'            => 4,
                'chasis'                 => 'CHS-002-2021',
                'vin'                    => 'VIN-MIT-001',
                'motor_numero'           => 'MOT-002',
            ],
            [
                'placa'                  => 'P-345678',
                'tipo_vehiculo_id'       => $tipoSedan,
                'anio'                   => 2019,
                'capacidad_personas'     => 5,
                'estado'                 => 'disponible',
                'activo'                 => true,
                'veh_marca_id'           => $marcaToyota,
                'veh_modelo_id'          => $modeloCorolla,
                'veh_color_id'           => $colorGris,
                'veh_tipo_motor_id'      => $motorGasolina,
                'veh_transmision_id'     => $transManual,
                'veh_traccion_id'        => $traccion4x2,
                'veh_tipo_llanta_id'     => $llantaEstandar,
                'veh_tipo_combustible_id'=> $combGasolina,
                'veh_clasificacion_id'   => $clasSedán,
                'veh_estado_catalogo_id' => $estadoDisponible,
                'num_llantas'            => 4,
                'chasis'                 => 'CHS-003-2019',
                'vin'                    => 'VIN-TOY-002',
                'motor_numero'           => 'MOT-003',
            ],

            // Microbuses
            [
                'placa'                  => 'M-100001',
                'tipo_vehiculo_id'       => $tipoMicrobus,
                'anio'                   => 2018,
                'capacidad_personas'     => 15,
                'estado'                 => 'disponible',
                'activo'                 => true,
                'veh_marca_id'           => $marcaNissan,
                'veh_modelo_id'          => $modeloUrvan,
                'veh_color_id'           => $colorBlanco,
                'veh_tipo_motor_id'      => $motorDiesel,
                'veh_transmision_id'     => $transManual,
                'veh_traccion_id'        => $traccion4x2,
                'veh_tipo_llanta_id'     => $llantaEstandar,
                'veh_tipo_combustible_id'=> $combDiesel,
                'veh_clasificacion_id'   => $clasMicrobus,
                'veh_estado_catalogo_id' => $estadoDisponible,
                'num_llantas'            => 4,
                'chasis'                 => 'CHS-004-2018',
                'vin'                    => 'VIN-NIS-001',
                'motor_numero'           => 'MOT-004',
            ],
            [
                'placa'                  => 'M-100002',
                'tipo_vehiculo_id'       => $tipoMicrobus,
                'anio'                   => 2020,
                'capacidad_personas'     => 20,
                'estado'                 => 'disponible',
                'activo'                 => true,
                'veh_marca_id'           => $marcaNissan,
                'veh_modelo_id'          => $modeloUrvan,
                'veh_color_id'           => $colorBlanco,
                'veh_tipo_motor_id'      => $motorDiesel,
                'veh_transmision_id'     => $transManual,
                'veh_traccion_id'        => $traccion4x2,
                'veh_tipo_llanta_id'     => $llantaEstandar,
                'veh_tipo_combustible_id'=> $combDiesel,
                'veh_clasificacion_id'   => $clasMicrobus,
                'veh_estado_catalogo_id' => $estadoDisponible,
                'num_llantas'            => 4,
                'chasis'                 => 'CHS-005-2020',
                'vin'                    => 'VIN-NIS-002',
                'motor_numero'           => 'MOT-005',
            ],
            [
                'placa'                  => 'M-100003',
                'tipo_vehiculo_id'       => $tipoMicrobus,
                'anio'                   => 2019,
                'capacidad_personas'     => 25,
                'estado'                 => 'disponible',
                'activo'                 => true,
                'veh_marca_id'           => $marcaIsuzu,
                'veh_modelo_id'          => $modeloNPR,
                'veh_color_id'           => $colorBlanco,
                'veh_tipo_motor_id'      => $motorDiesel,
                'veh_transmision_id'     => $transManual,
                'veh_traccion_id'        => $traccion4x2,
                'veh_tipo_llanta_id'     => $llantaEstandar,
                'veh_tipo_combustible_id'=> $combDiesel,
                'veh_clasificacion_id'   => $clasMicrobus,
                'veh_estado_catalogo_id' => $estadoDisponible,
                'num_llantas'            => 6,
                'chasis'                 => 'CHS-006-2019',
                'vin'                    => 'VIN-ISU-001',
                'motor_numero'           => 'MOT-006',
            ],

            // Camiones 2 Toneladas
            [
                'placa'                  => 'C-200001',
                'tipo_vehiculo_id'       => $tipoCamion,
                'anio'                   => 2017,
                'capacidad_personas'     => 3,
                'estado'                 => 'disponible',
                'activo'                 => true,
                'veh_marca_id'           => $marcaHino,
                'veh_modelo_id'          => $modeloDutro,
                'veh_color_id'           => $colorBlanco,
                'veh_tipo_motor_id'      => $motorDiesel,
                'veh_transmision_id'     => $transManual,
                'veh_traccion_id'        => $traccion4x2,
                'veh_tipo_llanta_id'     => $llantaEstandar,
                'veh_tipo_combustible_id'=> $combDiesel,
                'veh_clasificacion_id'   => $clasCamion,
                'veh_estado_catalogo_id' => $estadoDisponible,
                'num_llantas'            => 6,
                'chasis'                 => 'CHS-007-2017',
                'vin'                    => 'VIN-HIN-001',
                'motor_numero'           => 'MOT-007',
            ],
            [
                'placa'                  => 'C-200002',
                'tipo_vehiculo_id'       => $tipoCamion,
                'anio'                   => 2018,
                'capacidad_personas'     => 3,
                'estado'                 => 'disponible',
                'activo'                 => true,
                'veh_marca_id'           => $marcaHino,
                'veh_modelo_id'          => $modeloDutro,
                'veh_color_id'           => $colorGris,
                'veh_tipo_motor_id'      => $motorDiesel,
                'veh_transmision_id'     => $transManual,
                'veh_traccion_id'        => $traccion4x2,
                'veh_tipo_llanta_id'     => $llantaEstandar,
                'veh_tipo_combustible_id'=> $combDiesel,
                'veh_clasificacion_id'   => $clasCamion,
                'veh_estado_catalogo_id' => $estadoDisponible,
                'num_llantas'            => 6,
                'chasis'                 => 'CHS-008-2018',
                'vin'                    => 'VIN-HIN-002',
                'motor_numero'           => 'MOT-008',
            ],
            [
                'placa'                  => 'C-200003',
                'tipo_vehiculo_id'       => $tipoCamion,
                'anio'                   => 2016,
                'capacidad_personas'     => 3,
                'estado'                 => 'disponible',
                'activo'                 => true,
                'veh_marca_id'           => $marcaIsuzu,
                'veh_modelo_id'          => $modeloNPR,
                'veh_color_id'           => $colorBlanco,
                'veh_tipo_motor_id'      => $motorDiesel,
                'veh_transmision_id'     => $transManual,
                'veh_traccion_id'        => $traccion4x2,
                'veh_tipo_llanta_id'     => $llantaEstandar,
                'veh_tipo_combustible_id'=> $combDiesel,
                'veh_clasificacion_id'   => $clasCamion,
                'veh_estado_catalogo_id' => $estadoDisponible,
                'num_llantas'            => 6,
                'chasis'                 => 'CHS-009-2016',
                'vin'                    => 'VIN-ISU-002',
                'motor_numero'           => 'MOT-009',
            ],
        ];

        foreach ($vehiculos as $vehiculo) {
            DB::table('vehiculos')->insertOrIgnore(array_merge($vehiculo, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        $this->command->info('Vehículos de prueba insertados correctamente.');
    }
}