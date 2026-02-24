<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VehCatalogosSeeder extends Seeder
{
    public function run(): void
    {
        // Marcas
        $marcas = ['Toyota', 'Mitsubishi', 'Nissan', 'Hyundai', 'Ford', 'Chevrolet', 'Isuzu', 'Hino', 'Mercedes-Benz', 'Kia'];
        foreach ($marcas as $marca) {
            DB::table('veh_marcas')->insertOrIgnore(['nombre' => $marca, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

        // Modelos
        $modelos = ['Corolla', 'Hilux', 'Land Cruiser', 'L200', 'Montero', 'Urvan', 'NV350', 'Tucson', 'Accent', 'F-150', 'Transit', 'Silverado', 'NPR', 'Dutro', 'Sprinter', 'Sportage', 'Frontier'];
        foreach ($modelos as $modelo) {
            DB::table('veh_modelos')->insertOrIgnore(['nombre' => $modelo, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

       // COLORES REALES (Extraídos del SQL de clv_color_vehiculo)
        $coloresReales = [
            'BLANCO', 'GRIS OSCURO', 'CAFÉ', 'BLANCO C/DIST COM', 'GRIS CLARO', 
            'AZUL', 'GRIS', 'AZUL/NARANJA/VERDE/PLATA', 'ROJO', 'VERDE', 
            'PLATEADO', 'CAFE', 'VERDE METALICO', 'NEGRO', 'GRIS C/FRANJAS', 
            'AZUL CON FRANJAS', 'NEGRO C/FRANJAS', 'AZUL C/FRANJAS', 'ROJO C/FRANJAS', 
            'AZUL C/F MULTICOLOR', 'AZUL F/MULTICOLOR', 'GRIS/PLATEADO', 'GRIS ', 
            'BLANCO DIST INST', 'CELESTE', 'BEIGE'
        ];
        
        foreach ($coloresReales as $color) {
            DB::table('veh_colores')->insertOrIgnore([
                'nombre' => $color, 
                'activo' => true, 
                'created_at' => now(), 
                'updated_at' => now()
            ]);
        }

        // Tipos de motor
        $tiposMotor = ['Gasolina', 'Diesel', 'Híbrido', 'Eléctrico'];
        foreach ($tiposMotor as $tipo) {
            DB::table('veh_tipos_motor')->insertOrIgnore(['nombre' => $tipo, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

        // Transmisiones
        $transmisiones = ['Manual', 'Automática'];
        foreach ($transmisiones as $transmision) {
            DB::table('veh_transmisiones')->insertOrIgnore(['nombre' => $transmision, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

        // Tracciones
        $tracciones = ['4x2', '4x4'];
        foreach ($tracciones as $traccion) {
            DB::table('veh_tracciones')->insertOrIgnore(['nombre' => $traccion, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

        // Tipos de llanta
        $tiposLlanta = ['Estándar', 'Todo terreno', 'Radial', 'Diagonal'];
        foreach ($tiposLlanta as $tipo) {
            DB::table('veh_tipo_llantas')->insertOrIgnore(['nombre' => $tipo, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

        // Tipos de combustible
        $tiposCombustible = ['Gasolina', 'Diesel', 'GLP', 'Eléctrico'];
        foreach ($tiposCombustible as $tipo) {
            DB::table('veh_tipo_combustible')->insertOrIgnore(['nombre' => $tipo, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

        // Clasificaciones
        $clasificaciones = ['Sedán', 'Microbús', 'Camión 2 Toneladas', 'Pick-up', 'SUV', 'Van'];
        foreach ($clasificaciones as $clasificacion) {
            DB::table('veh_clasificaciones')->insertOrIgnore(['nombre' => $clasificacion, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

        // Estados catálogo
        $estados = ['Disponible', 'Ocupado', 'En Taller', 'Baja'];
        foreach ($estados as $estado) {
            DB::table('veh_estados_catalogo')->insertOrIgnore(['nombre' => $estado, 'activo' => true, 'created_at' => now(), 'updated_at' => now()]);
        }

        $this->command->info('Catálogos de vehículos poblados correctamente.');
    }
}