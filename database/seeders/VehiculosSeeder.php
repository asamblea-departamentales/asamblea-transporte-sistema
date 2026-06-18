<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\TipoVehiculo;

class VehiculosSeeder extends Seeder
{
    public function run(): void
    {
        $sedan       = TipoVehiculo::where('nombre', 'Sedán')->value('id');
        $microbus    = TipoVehiculo::where('nombre', 'Microbús')->value('id');
        $camion      = TipoVehiculo::where('nombre', 'Camión Pesado')->value('id');
        $pickup      = TipoVehiculo::where('nombre', 'Pickup')->value('id');
        $moto        = TipoVehiculo::where('nombre', 'Motocicleta')->value('id');

        $marcas  = DB::table('veh_marcas')->pluck('id', 'nombre');
        $modelos = DB::table('veh_modelos')->pluck('id', 'nombre');

        $disponible = DB::table('veh_estados_catalogo')->where('nombre', 'Disponible')->value('id');
        $gris       = DB::table('veh_colores')->where('nombre', 'GRIS')->value('id');
        $blanco     = DB::table('veh_colores')->where('nombre', 'BLANCO')->value('id');
        $plateado   = DB::table('veh_colores')->where('nombre', 'PLATEADO')->value('id');
        $negro      = DB::table('veh_colores')->where('nombre', 'NEGRO')->value('id');
        $azul       = DB::table('veh_colores')->where('nombre', 'AZUL')->value('id');
        $rojo       = DB::table('veh_colores')->where('nombre', 'ROJO')->value('id');
        $manual     = DB::table('veh_transmisiones')->where('nombre', 'Manual')->value('id');
        $auto       = DB::table('veh_transmisiones')->where('nombre', 'Automática')->value('id');
        $gasolina   = DB::table('veh_tipo_combustible')->where('nombre', 'GASOLINA')->value('id');
        $diesel     = DB::table('veh_tipo_combustible')->where('nombre', 'DIESEL')->value('id');
        $tracc4x2   = DB::table('veh_tracciones')->where('nombre', '4x2')->value('id');
        $tracc4x4   = DB::table('veh_tracciones')->where('nombre', '4x4')->value('id');
        $clasifAdmin = DB::table('veh_clasificaciones')->where('nombre', 'ADMINISTRATIVO')->value('id');
        $clasifTransp = DB::table('veh_clasificaciones')->where('nombre', 'TRANSPORTE DE PERSONAL')->value('id');

        $deptos = DB::table('departamentales')->pluck('id', 'codigo');
        $nrm = fn($m, $mo) => ['veh_marca_id' => $marcas[$m] ?? null, 'veh_modelo_id' => $modelos[$mo] ?? null];

        $vehiculos = [
            // Sedanes
            ['placa' => 'P42697',  'tipo_vehiculo_id' => $sedan,    'anio' => 2011, 'capacidad_personas' => 5, ...$nrm('Toyota', 'Hilux'),                          'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P618426', 'tipo_vehiculo_id' => $sedan,    'anio' => 2009, 'capacidad_personas' => 5, ...$nrm('Mitsubishi', 'Lancer EX'),                  'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P636163', 'tipo_vehiculo_id' => $sedan,    'anio' => 2009, 'capacidad_personas' => 5, ...$nrm('Toyota', 'Hilux'),                          'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P618428', 'tipo_vehiculo_id' => $sedan,    'anio' => 2009, 'capacidad_personas' => 5, ...$nrm('Mitsubishi', 'Lancer EX'),                  'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P243639', 'tipo_vehiculo_id' => $sedan,    'anio' => 2013, 'capacidad_personas' => 5, ...$nrm('Toyota', 'Corolla GLI'),                    'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P131011', 'tipo_vehiculo_id' => $microbus, 'anio' => 2011, 'capacidad_personas' => 20,...$nrm('Toyota', 'Coaster'),                        'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P131644', 'tipo_vehiculo_id' => $microbus, 'anio' => 2010, 'capacidad_personas' => 15,...$nrm('Toyota', 'Hiace'),                          'estado' => 'disponible', 'activo' => true],
            ['placa' => 'C72526',  'tipo_vehiculo_id' => $camion,   'anio' => 2012, 'capacidad_personas' => 3, ...$nrm('Isuzu', 'NMR'),                             'estado' => 'disponible', 'activo' => true],
            ['placa' => 'C72530',  'tipo_vehiculo_id' => $camion,   'anio' => 2012, 'capacidad_personas' => 3, ...$nrm('Isuzu', 'NMR'),                             'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P618425', 'tipo_vehiculo_id' => $sedan,    'anio' => 2009, 'capacidad_personas' => 5, ...$nrm('Mitsubishi', 'Lancer EX'),                  'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P618489', 'tipo_vehiculo_id' => $sedan,    'anio' => 2009, 'capacidad_personas' => 5, ...$nrm('Mitsubishi', 'Lancer EX'),                  'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P585521', 'tipo_vehiculo_id' => $sedan,    'anio' => 2008, 'capacidad_personas' => 5, ...$nrm('Mitsubishi', 'Lancer GLX'),                  'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P122798', 'tipo_vehiculo_id' => $sedan,    'anio' => 2008, 'capacidad_personas' => 5, ...$nrm('Toyota', 'Corolla GLI'),                    'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P585513', 'tipo_vehiculo_id' => $sedan,    'anio' => 2008, 'capacidad_personas' => 5, ...$nrm('Mitsubishi', 'Lancer GLX'),                  'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P662565', 'tipo_vehiculo_id' => $pickup,   'anio' => 2015, 'capacidad_personas' => 5, ...$nrm('Toyota', 'Hilux'),                          'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P592075', 'tipo_vehiculo_id' => $sedan,    'anio' => 2008, 'capacidad_personas' => 5, ...$nrm('Nissan', 'Tiida SE'),                       'estado' => 'disponible', 'activo' => true],
            ['placa' => 'N5351',   'tipo_vehiculo_id' => $sedan,    'anio' => 2018, 'capacidad_personas' => 5, ...$nrm('Hyundai', 'I10'),                           'estado' => 'disponible', 'activo' => true],
            ['placa' => 'N5388',   'tipo_vehiculo_id' => $sedan,    'anio' => 2018, 'capacidad_personas' => 5, ...$nrm('Hyundai', 'I10'),                           'estado' => 'disponible', 'activo' => true],
            ['placa' => 'N6647',   'tipo_vehiculo_id' => $pickup,   'anio' => 2013, 'capacidad_personas' => 5, ...$nrm('Nissan', 'Frontier'),                       'estado' => 'disponible', 'activo' => true, 'departamental_id' => $deptos['CU']],
            ['placa' => 'N6645',   'tipo_vehiculo_id' => $pickup,   'anio' => 2013, 'capacidad_personas' => 5, ...$nrm('Nissan', 'Frontier'),                       'estado' => 'disponible', 'activo' => true, 'departamental_id' => $deptos['SM']],
            ['placa' => 'N6654',   'tipo_vehiculo_id' => $pickup,   'anio' => 2013, 'capacidad_personas' => 5, ...$nrm('Nissan', 'Frontier'),                       'estado' => 'disponible', 'activo' => true, 'departamental_id' => $deptos['SA']],
            ['placa' => 'N6646',   'tipo_vehiculo_id' => $pickup,   'anio' => 2013, 'capacidad_personas' => 5, ...$nrm('Nissan', 'Frontier'),                       'estado' => 'disponible', 'activo' => true, 'departamental_id' => $deptos['SO']],
            ['placa' => 'N6662',   'tipo_vehiculo_id' => $pickup,   'anio' => 2013, 'capacidad_personas' => 5, ...$nrm('Nissan', 'Frontier'),                       'estado' => 'disponible', 'activo' => true, 'departamental_id' => $deptos['SV']],
            ['placa' => 'N6660',   'tipo_vehiculo_id' => $pickup,   'anio' => 2013, 'capacidad_personas' => 5, ...$nrm('Nissan', 'Frontier'),                       'estado' => 'disponible', 'activo' => true, 'departamental_id' => $deptos['LP']],
            ['placa' => 'N7375',   'tipo_vehiculo_id' => $pickup,   'anio' => 2013, 'capacidad_personas' => 5, ...$nrm('Toyota', 'Hilux'),                          'estado' => 'disponible', 'activo' => true, 'departamental_id' => $deptos['LU']],
            ['placa' => 'N21907',  'tipo_vehiculo_id' => $sedan,    'anio' => 2024, 'capacidad_personas' => 5, ...$nrm('Volkswagen', 'Nivus'),                      'estado' => 'disponible', 'activo' => true],
            ['placa' => 'N2272',   'tipo_vehiculo_id' => $pickup,   'anio' => 2014, 'capacidad_personas' => 5, ...$nrm('Nissan', 'Frontier LCV'),                   'estado' => 'disponible', 'activo' => true, 'departamental_id' => $deptos['US']],
            ['placa' => 'N9025',   'tipo_vehiculo_id' => $pickup,   'anio' => 2015, 'capacidad_personas' => 5, ...$nrm('Nissan', 'Frontier LCV'),                   'estado' => 'disponible', 'activo' => true, 'departamental_id' => $deptos['SO']],
            ['placa' => 'N6702',   'tipo_vehiculo_id' => $pickup,   'anio' => 2016, 'capacidad_personas' => 5, ...$nrm('Nissan', 'Frontier LCV'),                   'estado' => 'disponible', 'activo' => true, 'departamental_id' => $deptos['CA']],
            ['placa' => 'N5690',   'tipo_vehiculo_id' => $microbus, 'anio' => 2012, 'capacidad_personas' => 15,...$nrm('Toyota', 'Hiace'),                          'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P8929',   'tipo_vehiculo_id' => $pickup,   'anio' => 2014, 'capacidad_personas' => 5, ...$nrm('Mitsubishi', 'L200'),                        'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P585518', 'tipo_vehiculo_id' => $sedan,    'anio' => 2008, 'capacidad_personas' => 5, ...$nrm('Mitsubishi', 'Lancer GLXI'),                  'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P618427', 'tipo_vehiculo_id' => $sedan,    'anio' => 2009, 'capacidad_personas' => 5, ...$nrm('Mitsubishi', 'Lancer EX'),                  'estado' => 'disponible', 'activo' => true],
            ['placa' => 'N8768',   'tipo_vehiculo_id' => $pickup,   'anio' => 2014, 'capacidad_personas' => 5, ...$nrm('Nissan', 'Frontier LCV'),                   'estado' => 'disponible', 'activo' => true, 'departamental_id' => $deptos['LL']],
            ['placa' => 'P131006', 'tipo_vehiculo_id' => $pickup,   'anio' => 2011, 'capacidad_personas' => 5, ...$nrm('Toyota', 'Hilux'),                          'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P42614',  'tipo_vehiculo_id' => $pickup,   'anio' => 2011, 'capacidad_personas' => 5, ...$nrm('Toyota', 'Hilux'),                          'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P645586', 'tipo_vehiculo_id' => $pickup,   'anio' => 2010, 'capacidad_personas' => 5, ...$nrm('Toyota', 'Hilux'),                          'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P212307', 'tipo_vehiculo_id' => $pickup,   'anio' => 2011, 'capacidad_personas' => 5, ...$nrm('Toyota', 'Hilux'),                          'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P212296', 'tipo_vehiculo_id' => $pickup,   'anio' => 2011, 'capacidad_personas' => 5, ...$nrm('Toyota', 'Hilux'),                          'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P571331', 'tipo_vehiculo_id' => $pickup,   'anio' => 2015, 'capacidad_personas' => 5, ...$nrm('Mitsubishi', 'L200'),                        'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P573715', 'tipo_vehiculo_id' => $pickup,   'anio' => 2015, 'capacidad_personas' => 5, ...$nrm('Mitsubishi', 'L200'),                        'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P131053', 'tipo_vehiculo_id' => $pickup,   'anio' => 2011, 'capacidad_personas' => 5, ...$nrm('Toyota', 'Hilux'),                          'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P42696',  'tipo_vehiculo_id' => $pickup,   'anio' => 2011, 'capacidad_personas' => 5, ...$nrm('Toyota', 'Hilux'),                          'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P501B4',  'tipo_vehiculo_id' => $pickup,   'anio' => 2014, 'capacidad_personas' => 5, ...$nrm('Mitsubishi', 'L200'),                        'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P125795', 'tipo_vehiculo_id' => $pickup,   'anio' => 2012, 'capacidad_personas' => 5, ...$nrm('Mitsubishi', 'L200'),                        'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P575210', 'tipo_vehiculo_id' => $pickup,   'anio' => 2015, 'capacidad_personas' => 5, ...$nrm('Mitsubishi', 'L200'),                        'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P574782', 'tipo_vehiculo_id' => $pickup,   'anio' => 2015, 'capacidad_personas' => 5, ...$nrm('Mitsubishi', 'L200'),                        'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P686864', 'tipo_vehiculo_id' => $pickup,   'anio' => 2015, 'capacidad_personas' => 5, ...$nrm('Toyota', 'Hilux'),                          'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P686859', 'tipo_vehiculo_id' => $pickup,   'anio' => 2015, 'capacidad_personas' => 5, ...$nrm('Toyota', 'Hilux'),                          'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P686861', 'tipo_vehiculo_id' => $pickup,   'anio' => 2015, 'capacidad_personas' => 5, ...$nrm('Toyota', 'Hilux'),                          'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P686860', 'tipo_vehiculo_id' => $pickup,   'anio' => 2015, 'capacidad_personas' => 5, ...$nrm('Toyota', 'Hilux'),                          'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P686863', 'tipo_vehiculo_id' => $pickup,   'anio' => 2015, 'capacidad_personas' => 5, ...$nrm('Toyota', 'Hilux'),                          'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P732388', 'tipo_vehiculo_id' => $pickup,   'anio' => 2017, 'capacidad_personas' => 5, ...$nrm('Toyota', 'Hilux'),                          'estado' => 'disponible', 'activo' => true],
            ['placa' => 'N9770',   'tipo_vehiculo_id' => $pickup,   'anio' => 2017, 'capacidad_personas' => 5, ...$nrm('Nissan', 'NP300 Frontier'),                  'estado' => 'disponible', 'activo' => true],
            ['placa' => 'N9768',   'tipo_vehiculo_id' => $pickup,   'anio' => 2017, 'capacidad_personas' => 5, ...$nrm('Nissan', 'NP300 Frontier'),                  'estado' => 'disponible', 'activo' => true],
            ['placa' => 'N9766',   'tipo_vehiculo_id' => $pickup,   'anio' => 2017, 'capacidad_personas' => 5, ...$nrm('Nissan', 'NP300 Frontier'),                  'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P964698', 'tipo_vehiculo_id' => $pickup,   'anio' => 2017, 'capacidad_personas' => 5, ...$nrm('Mitsubishi', 'L200'),                        'estado' => 'disponible', 'activo' => true],
            ['placa' => 'N9653',   'tipo_vehiculo_id' => $pickup,   'anio' => 2017, 'capacidad_personas' => 5, ...$nrm('Mitsubishi', 'L200'),                        'estado' => 'disponible', 'activo' => true, 'departamental_id' => $deptos['CH']],
            ['placa' => 'N9654',   'tipo_vehiculo_id' => $pickup,   'anio' => 2017, 'capacidad_personas' => 5, ...$nrm('Mitsubishi', 'L200'),                        'estado' => 'disponible', 'activo' => true, 'departamental_id' => $deptos['MO']],
            ['placa' => 'P828642', 'tipo_vehiculo_id' => $pickup,   'anio' => 2018, 'capacidad_personas' => 5, ...$nrm('Nissan', 'Frontier'),                       'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P951603', 'tipo_vehiculo_id' => $sedan,    'anio' => 2020, 'capacidad_personas' => 5, ...$nrm('Hyundai', 'Santa Fe'),                       'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P951609', 'tipo_vehiculo_id' => $sedan,    'anio' => 2020, 'capacidad_personas' => 5, ...$nrm('Hyundai', 'Santa Fe'),                       'estado' => 'disponible', 'activo' => true],
            ['placa' => 'M104760', 'tipo_vehiculo_id' => $moto,     'anio' => 2013, 'capacidad_personas' => 2, ...$nrm('Suzuki', 'GN125H'),                         'estado' => 'disponible', 'activo' => true],
            ['placa' => 'M585805', 'tipo_vehiculo_id' => $moto,     'anio' => 2019, 'capacidad_personas' => 2, ...$nrm('United Motors', 'FastWind 180'),              'estado' => 'disponible', 'activo' => true],
            ['placa' => 'M585997', 'tipo_vehiculo_id' => $moto,     'anio' => 2019, 'capacidad_personas' => 2, ...$nrm('United Motors', 'FastWind 180'),              'estado' => 'disponible', 'activo' => true],
            ['placa' => 'M585795', 'tipo_vehiculo_id' => $moto,     'anio' => 2019, 'capacidad_personas' => 2, ...$nrm('United Motors', 'FastWind 180'),              'estado' => 'disponible', 'activo' => true],
            ['placa' => 'M585996', 'tipo_vehiculo_id' => $moto,     'anio' => 2019, 'capacidad_personas' => 2, ...$nrm('United Motors', 'FastWind 180'),              'estado' => 'disponible', 'activo' => true],
            ['placa' => 'M585802', 'tipo_vehiculo_id' => $moto,     'anio' => 2019, 'capacidad_personas' => 2, ...$nrm('United Motors', 'FastWind 180'),              'estado' => 'disponible', 'activo' => true],
            ['placa' => 'M585808', 'tipo_vehiculo_id' => $moto,     'anio' => 2019, 'capacidad_personas' => 2, ...$nrm('United Motors', 'FastWind 180'),              'estado' => 'disponible', 'activo' => true],
            ['placa' => 'M585811', 'tipo_vehiculo_id' => $moto,     'anio' => 2019, 'capacidad_personas' => 2, ...$nrm('United Motors', 'FastWind 180'),              'estado' => 'disponible', 'activo' => true],
            ['placa' => 'M585801', 'tipo_vehiculo_id' => $moto,     'anio' => 2019, 'capacidad_personas' => 2, ...$nrm('United Motors', 'FastWind 180'),              'estado' => 'disponible', 'activo' => true],
            ['placa' => 'M585810', 'tipo_vehiculo_id' => $moto,     'anio' => 2019, 'capacidad_personas' => 2, ...$nrm('United Motors', 'FastWind 180'),              'estado' => 'disponible', 'activo' => true],
            ['placa' => 'M586003', 'tipo_vehiculo_id' => $moto,     'anio' => 2019, 'capacidad_personas' => 2, ...$nrm('United Motors', 'FastWind 180'),              'estado' => 'disponible', 'activo' => true],
            ['placa' => 'M585800', 'tipo_vehiculo_id' => $moto,     'anio' => 2019, 'capacidad_personas' => 2, ...$nrm('United Motors', 'MAX 200x'),                   'estado' => 'disponible', 'activo' => true],
            ['placa' => 'M585792', 'tipo_vehiculo_id' => $moto,     'anio' => 2019, 'capacidad_personas' => 2, ...$nrm('United Motors', 'MAX 200x'),                   'estado' => 'disponible', 'activo' => true],
            ['placa' => 'P-312D2', 'tipo_vehiculo_id' => $microbus, 'anio' => 2023, 'capacidad_personas' => 14,...$nrm('Nissan', 'Urvan'),                           'estado' => 'disponible', 'activo' => true],
            ['placa' => 'N-19432', 'tipo_vehiculo_id' => $microbus, 'anio' => 2022, 'capacidad_personas' => 25,...$nrm('Hyundai', 'County'),                          'estado' => 'disponible', 'activo' => true],
            ['placa' => 'N-872E2', 'tipo_vehiculo_id' => $pickup,   'anio' => 2025, 'capacidad_personas' => 5, ...$nrm('Mitsubishi', 'L200'),                        'estado' => 'disponible', 'activo' => true],
            ['placa' => 'N-19313', 'tipo_vehiculo_id' => $pickup,   'anio' => 2023, 'capacidad_personas' => 5, ...$nrm('Volkswagen', 'Amarok'),                      'estado' => 'disponible', 'activo' => true],
            ['placa' => 'N-19314', 'tipo_vehiculo_id' => $pickup,   'anio' => 2023, 'capacidad_personas' => 5, ...$nrm('Volkswagen', 'Amarok'),                      'estado' => 'disponible', 'activo' => true],
            ['placa' => 'N-19318', 'tipo_vehiculo_id' => $pickup,   'anio' => 2023, 'capacidad_personas' => 5, ...$nrm('Volkswagen', 'Amarok'),                      'estado' => 'disponible', 'activo' => true],
            ['placa' => 'N-19317', 'tipo_vehiculo_id' => $pickup,   'anio' => 2023, 'capacidad_personas' => 5, ...$nrm('Volkswagen', 'Amarok'),                      'estado' => 'disponible', 'activo' => true],
        ];

        $modeloNombres = [
            'Hilux', 'Lancer EX', 'Lancer GLX', 'Lancer GLXI', 'Corolla GLI', 'Coaster',
            'Hiace', 'NMR', 'Tiida SE', 'I10', 'Frontier', 'Frontier LCV',
            'NP300 Frontier', 'Nivus', 'L200', 'Santa Fe', 'GN125H',
            'FastWind 180', 'MAX 200x', 'Urvan', 'County', 'Amarok',
        ];
        $modeloStr = DB::table('veh_modelos')->whereIn('nombre', $modeloNombres)->pluck('nombre', 'id');
        $marcaStr  = DB::table('veh_marcas')->pluck('nombre', 'id');

        foreach ($vehiculos as $v) {
            $mid = $v['veh_modelo_id'] ?? null;
            $bid = $v['veh_marca_id'] ?? null;
            DB::table('vehiculos')->insertOrIgnore(array_merge($v, [
                'marca'                   => $marcaStr[$bid] ?? null,
                'modelo'                  => $modeloStr[$mid] ?? null,
                'veh_color_id'            => null,
                'veh_tipo_motor_id'       => null,
                'veh_transmision_id'      => null,
                'veh_traccion_id'         => null,
                'veh_tipo_llanta_id'      => null,
                'veh_tipo_combustible_id' => null,
                'veh_clasificacion_id'    => null,
                'veh_estado_catalogo_id'  => $disponible,
                'created_at'              => now(),
                'updated_at'              => now(),
            ]));
        }

        $this->command->info('Vehículos reales insertados correctamente.');
    }
}
