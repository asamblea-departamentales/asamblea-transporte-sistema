<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VehCatalogosSeeder extends Seeder
{
    public function run(): void
    {
        // 1. MARCAS
        $marcas = ['Toyota', 'Mitsubishi', 'Nissan', 'Hyundai', 'Ford', 'Chevrolet', 'Isuzu', 'Hino', 'Mercedes-Benz', 'Kia'];
        foreach ($marcas as $marca) {
            DB::table('veh_marcas')->insertOrIgnore(['nombre' => $marca, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

        // 2. MODELOS
        $modelos = ['Corolla', 'Hilux', 'Land Cruiser', 'L200', 'Montero', 'Urvan', 'NV350', 'Tucson', 'Accent', 'F-150', 'Transit', 'Silverado', 'NPR', 'Dutro', 'Sprinter', 'Sportage', 'Frontier'];
        foreach ($modelos as $modelo) {
            DB::table('veh_modelos')->insertOrIgnore(['nombre' => $modelo, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

        // 3. COLORES REALES
        $coloresReales = [
            'BLANCO', 'GRIS OSCURO', 'CAFÉ', 'BLANCO C/DIST COM', 'GRIS CLARO', 
            'AZUL', 'GRIS', 'AZUL/NARANJA/VERDE/PLATA', 'ROJO', 'VERDE', 
            'PLATEADO', 'CAFE', 'VERDE METALICO', 'NEGRO', 'GRIS C/FRANJAS', 
            'AZUL CON FRANJAS', 'NEGRO C/FRANJAS', 'AZUL C/FRANJAS', 'ROJO C/FRANJAS', 
            'AZUL C/F MULTICOLOR', 'AZUL F/MULTICOLOR', 'GRIS/PLATEADO', 'GRIS ', 
            'BLANCO DIST INST', 'CELESTE', 'BEIGE'
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
            'OFICINA DEPARTAMENTAL'
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
            '205/70R15', '165/70R14', '255/70R16', '225/70R17', '155/70/R13', '205/75R17'
        ];
        foreach ($llantasReales as $llanta) {
            DB::table('veh_tipo_llantas')->insertOrIgnore(['nombre' => $llanta, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

        // 8. OTROS CATÁLOGOS
        $tiposMotor = ['Combustión interna', 'Híbrido', 'Eléctrico'];
        foreach ($tiposMotor as $tipo) {
            DB::table('veh_tipos_motor')->insertOrIgnore(['nombre' => $tipo, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

        $transmisiones = ['Manual', 'Automática'];
        foreach ($transmisiones as $transmision) {
            DB::table('veh_transmisiones')->insertOrIgnore(['nombre' => $transmision, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

        $tracciones = ['4x2', '4x4'];
        foreach ($tracciones as $traccion) {
            DB::table('veh_tracciones')->insertOrIgnore(['nombre' => $traccion, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

        $this->command->info('Base de datos de catálogos sincronizada con éxito.');
    }
}