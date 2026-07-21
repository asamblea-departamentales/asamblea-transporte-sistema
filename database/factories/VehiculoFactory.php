<?php

namespace Database\Factories;

use App\Models\VehClasificacion;
use App\Models\VehColor;
use App\Models\VehEstadoCatalogo;
use App\Models\Vehiculo;
use App\Models\VehMarca;
use App\Models\VehModelo;
use App\Models\VehTipoCombustible;
use App\Models\VehTipoLlanta;
use App\Models\VehTipoMotor;
use App\Models\VehTraccion;
use App\Models\VehTransmision;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vehiculo>
 */
class VehiculoFactory extends Factory
{
    protected $model = Vehiculo::class;

    public function definition(): array
    {
        $placa = strtoupper(fake()->randomLetter().fake()->randomLetter().fake()->randomLetter()).'-'.fake()->numerify('###');

        return [
            'placa' => $placa,
            'veh_marca_id' => VehMarca::firstOrCreate(['nombre' => 'Toyota'], ['activo' => true])->id,
            'veh_modelo_id' => fn (array $attr) => VehModelo::firstOrCreate(
                ['nombre' => 'Hilux', 'veh_marca_id' => $attr['veh_marca_id']],
                ['activo' => true]
            )->id,
            'veh_color_id' => VehColor::firstOrCreate(['nombre' => 'Blanco'], ['activo' => true])->id,
            'veh_tipo_motor_id' => VehTipoMotor::firstOrCreate(['nombre' => 'Diésel'], ['activo' => true])->id,
            'veh_transmision_id' => VehTransmision::firstOrCreate(['nombre' => 'Manual'], ['activo' => true])->id,
            'veh_traccion_id' => VehTraccion::firstOrCreate(['nombre' => '4x4'], ['activo' => true])->id,
            'veh_tipo_llanta_id' => VehTipoLlanta::firstOrCreate(['nombre' => 'Normal'], ['activo' => true])->id,
            'veh_tipo_combustible_id' => VehTipoCombustible::firstOrCreate(['nombre' => 'Diésel'], ['activo' => true])->id,
            'veh_clasificacion_id' => VehClasificacion::firstOrCreate(['nombre' => 'Oficial'], ['activo' => true])->id,
            'veh_estado_catalogo_id' => VehEstadoCatalogo::firstOrCreate(['nombre' => 'Disponible'], ['activo' => true])->id,
            'tipo_vehiculo_id' => fn () => \App\Models\TipoVehiculo::firstOrCreate(['nombre' => 'Camioneta'], ['activo' => true])->id,
            'marca' => 'Toyota',
            'modelo' => 'Hilux',
            'anio' => fake()->year(),
            'capacidad_personas' => fake()->numberBetween(2, 8),
            'estado' => 'activo',
            'activo' => true,
            'accesorios' => [],
            'num_llantas' => 4,
            'chasis' => strtoupper(fake()->randomLetter().fake()->randomLetter().fake()->randomLetter().fake()->randomLetter()).fake()->numerify('######'),
            'vin' => strtoupper(fake()->randomLetter().fake()->randomLetter().fake()->randomLetter().fake()->randomLetter().fake()->randomLetter()).fake()->numerify('##########'),
            'motor_numero' => strtoupper(fake()->randomLetter().fake()->randomLetter().fake()->randomLetter()).fake()->numerify('######'),
            'vencimiento_tarjeta' => fake()->dateTimeBetween('+1 year', '+3 years'),
            'activo_fijo' => true,
        ];
    }
}
