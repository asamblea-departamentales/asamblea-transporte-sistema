<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VehCatalogosSeeder extends Seeder
{
    public function run(): void
    {
        // 1. MARCAS
        $marcas = ['Mitsubishi', 'Toyota', 'International', 'Nissan', 'Comil', 'Ford', 'Suzuki', 'Isuzu', 'Suzuki', 'Honda', 'Futian', 'Hyundai', 'United Motors', 'Volkswagen'];
        foreach ($marcas as $marca) {
            DB::table('veh_marcas')->insertOrIgnore(['nombre' => $marca, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

        // 2. MODELOS (con su marca correspondiente)
        $toyotaId = DB::table('veh_marcas')->where('nombre', 'Toyota')->value('id');
        $mitsubishiId = DB::table('veh_marcas')->where('nombre', 'Mitsubishi')->value('id');
        $internationalId = DB::table('veh_marcas')->where('nombre', 'International')->value('id');
        $nissanId = DB::table('veh_marcas')->where('nombre', 'Nissan')->value('id');
        $comilId = DB::table('veh_marcas')->where('nombre', 'Comil')->value('id');
        $isuzuId = DB::table('veh_marcas')->where('nombre', 'Isuzu')->value('id');
        $fordId = DB::table('veh_marcas')->where('nombre', 'Ford')->value('id');
        $suzukiId = DB::table('veh_marcas')->where('nombre', 'Suzuki')->value('id');
        $hondaId = DB::table('veh_marcas')->where('nombre', 'Honda')->value('id');
        $futianId = DB::table('veh_marcas')->where('nombre', 'Futian')->value('id');
        $hyundaiId = DB::table('veh_marcas')->where('nombre', 'Hyundai')->value('id');
        $unitedMotorsId = DB::table('veh_marcas')->where('nombre', 'United Motors')->value('id');
        $volkswagenId = DB::table('veh_marcas')->where('nombre', 'Volkswagen')->value('id');

        $modelos = [
            ['nombre' => 'Coaster',       'veh_marca_id' => $toyotaId],
            ['nombre' => 'Corolla',       'veh_marca_id' => $toyotaId],
            ['nombre' => 'Corolla GLI',   'veh_marca_id' => $toyotaId],
            ['nombre' => 'Hiace',         'veh_marca_id' => $toyotaId],
            ['nombre' => 'Hilux',         'veh_marca_id' => $toyotaId],
            ['nombre' => 'Hilux 4x4',     'veh_marca_id' => $toyotaId],
            ['nombre' => 'Land Cruiser',  'veh_marca_id' => $toyotaId],
            ['nombre' => 'DX',            'veh_marca_id' => $mitsubishiId],
            ['nombre' => 'L200',          'veh_marca_id' => $mitsubishiId],
            ['nombre' => 'L200 4x4',      'veh_marca_id' => $mitsubishiId],
            ['nombre' => 'L300',          'veh_marca_id' => $mitsubishiId],
            ['nombre' => 'Lancer',        'veh_marca_id' => $mitsubishiId],
            ['nombre' => 'Lancer EX',     'veh_marca_id' => $mitsubishiId],
            ['nombre' => 'Lancer GLX',    'veh_marca_id' => $mitsubishiId],
            ['nombre' => 'Lancer GLXI',   'veh_marca_id' => $mitsubishiId],
            ['nombre' => 'Ayco',          'veh_marca_id' => $internationalId],
            ['nombre' => 'Frontier',      'veh_marca_id' => $nissanId],
            ['nombre' => 'Frontier LCV',  'veh_marca_id' => $nissanId],
            ['nombre' => 'NP300 Frontier', 'veh_marca_id' => $nissanId],
            ['nombre' => 'Tiida SE',      'veh_marca_id' => $nissanId],
            ['nombre' => 'Urvan',         'veh_marca_id' => $nissanId],
            ['nombre' => 'NV350',         'veh_marca_id' => $nissanId],
            ['nombre' => 'PIA',           'veh_marca_id' => $comilId],
            ['nombre' => 'Explorer Sport', 'veh_marca_id' => $fordId],
            ['nombre' => 'GN125H',         'veh_marca_id' => $suzukiId],
            ['nombre' => 'V-Men',          'veh_marca_id' => $hondaId],
            ['nombre' => 'CA6371',        'veh_marca_id' => $futianId],
            ['nombre' => 'NMR',           'veh_marca_id' => $isuzuId],
            ['nombre' => 'Santa Fe',      'veh_marca_id' => $hyundaiId],
            ['nombre' => 'County',        'veh_marca_id' => $hyundaiId],
            ['nombre' => 'I10',        'veh_marca_id' => $hyundaiId],
            ['nombre' => 'FastWind 180', 'veh_marca_id' => $unitedMotorsId],
            ['nombre' => 'MAX 200x',      'veh_marca_id' => $unitedMotorsId],
            ['nombre' => 'Amarok',        'veh_marca_id' => $volkswagenId],
            ['nombre' => 'Nivus',         'veh_marca_id' => $volkswagenId],
            ['nombre' => 'Nibus',         'veh_marca_id' => $volkswagenId],

        ];

        foreach ($modelos as $modelo) {
            DB::table('veh_modelos')->insertOrIgnore(array_merge($modelo, [
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 3. COLORES REALES
        $coloresReales = [
            'BLANCO', 'GRIS OSCURO', 'CAFÉ', 'BLANCO C/DIST COM', 'GRIS CLARO',
            'AZUL', 'GRIS', 'AZUL/NARANJA/VERDE/PLATA', 'ROJO', 'VERDE',
            'PLATEADO', 'CAFE', 'VERDE METALICO', 'NEGRO', 'GRIS C/FRANJAS',
            'AZUL CON FRANJAS', 'NEGRO C/FRANJAS', 'AZUL C/FRANJAS', 'ROJO C/FRANJAS',
            'AZUL C/F MULTICOLOR', 'AZUL F/MULTICOLOR', 'GRIS/PLATEADO', 'GRIS ',
            'BLANCO DIST INST', 'CELESTE', 'BEIGE',
        ];
        foreach ($coloresReales as $color) {
            DB::table('veh_colores')->insertOrIgnore(['nombre' => $color, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

        // 4. TIPOS DE COMBUSTIBLE REALES (tpc_tipo_combustible)
        $combustiblesReales = ['DIESEL', 'GASOLINA'];
        foreach ($combustiblesReales as $tipo) {
            DB::table('veh_tipo_combustible')->insertOrIgnore(['nombre' => $tipo, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

        // 5. CLASIFICACIONES REALES (cfv_clasif_vehiculo)
        $clasificacionesReales = [
            'TRANSPORTE DE PERSONAL',
            'ADMINISTRATIVO',
            'DISCRECIONAL',
            'OFICINA DEPARTAMENTAL',
        ];
        foreach ($clasificacionesReales as $clasificacion) {
            DB::table('veh_clasificaciones')->insertOrIgnore(['nombre' => $clasificacion, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

        // 6. ESTADOS (STATUS) REALES (stv_status_vehiculo)
        $estadosReales = ['Disponible', 'Reservado', 'En Taller', 'Baja']; // Agregué Taller y Baja por lógica de flota
        foreach ($estadosReales as $estado) {
            DB::table('veh_estados_catalogo')->insertOrIgnore(['nombre' => $estado, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

        // 7. TIPOS DE LLANTA (MEDIDAS REALES basado en tpl_tipo_llanta)
        $llantasReales = [
            '265/70R16', '205/60R16', '255/70R15', '205/55R16', '11.0R22.5',
            '7.0R16', '195R15', '195R14', '215/75R17.5', '215/75R17',
            '7.0R15', '195/60R15', '235/70R16', '245/70R16', '205R16',
            '2.75R18 / 110/90R16', '3.25R18 / 110/90R16', '285/65R17',
            '205/70R15', '165/70R14', '255/70R16', '225/70R17', '155/70/R13', '205/75R17',
        ];
        foreach ($llantasReales as $llanta) {
            DB::table('veh_tipo_llantas')->insertOrIgnore(['nombre' => $llanta, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

        // 8. TIPOS DE MOTOR REALES
        $tiposMotor = ['2500 CC', '1100 CC', 'DIESEL', 'GASOLINA'];
        foreach ($tiposMotor as $tipo) {
            DB::table('veh_tipos_motor')->insertOrIgnore(['nombre' => $tipo, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

        $transmisiones = ['Manual', 'Automática'];
        foreach ($transmisiones as $transmision) {
            DB::table('veh_transmisiones')->insertOrIgnore(['nombre' => $transmision, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

        $tracciones = ['4x2', '4x4', 'TRASERA', 'DELANTERA'];
        foreach ($tracciones as $traccion) {
            DB::table('veh_tracciones')->insertOrIgnore(['nombre' => $traccion, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

        $tiposMantenimiento = [
            ['nombre' => 'MANTENIMIENTO PREVENTIVO', 'descripcion' => 'MANTENIMIENTO PREVENTIVO'],
            ['nombre' => 'MANTENIMIENTO CORRECTIVO', 'descripcion' => 'MANTENIMIENTO PARA CORREGIR FALLAS'],
        ];
        foreach ($tiposMantenimiento as $tipo) {
            DB::table('veh_tipo_mantenimientos')->insertOrIgnore(array_merge($tipo, [
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        $this->command->info('Base de datos de catálogos sincronizada con éxito.');
    }
}
