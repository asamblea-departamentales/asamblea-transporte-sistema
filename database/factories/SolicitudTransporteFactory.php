<?php

namespace Database\Factories;

use App\Models\SolicitudTransporte;
use App\Models\UnidadSolicitante;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SolicitudTransporte>
 */
class SolicitudTransporteFactory extends Factory
{
    protected $model = SolicitudTransporte::class;

    public function definition(): array
    {
        $fechaSalida = fake()->dateTimeBetween('+1 week', '+1 month');
        $fechaRetorno = (clone $fechaSalida)->modify('+'.fake()->numberBetween(1, 8).' hours');

        return [
            'unidad_solicitante_id' => UnidadSolicitante::firstOrCreate(
                ['codigo' => 'DPT-001'],
                [
                    'nombre' => 'Dirección General',
                    'siglas' => 'DG',
                    'estado' => true,
                    'puede_solicitar_transporte' => true,
                    'puede_solicitar_mantenimiento' => true,
                    'puede_solicitar_combustible' => true,
                ]
            )->id,
            'solicitante_id' => User::factory(),
            'motivo_actividad' => fake()->sentence(),
            'origen' => fake()->city(),
            'destino' => fake()->city(),
            'fecha_salida' => $fechaSalida,
            'fecha_retorno' => $fechaRetorno,
            'cantidad_personas' => fake()->numberBetween(1, 10),
            'prioridad' => 'media',
            'prioridad_grupo' => 'media',
            'estado' => 'pendiente',
            'tipo_vehiculo_nombre' => 'Camioneta',
            'encargado' => fake()->name(),
            'horas_estimadas' => round(($fechaRetorno->getTimestamp() - $fechaSalida->getTimestamp()) / 3600, 2),
        ];
    }

    public function borrador(): static
    {
        return $this->state(fn () => [
            'estado' => 'borrador',
        ]);
    }

    public function pendiente(): static
    {
        return $this->state(fn () => [
            'estado' => 'pendiente',
        ]);
    }

    public function aprobada(): static
    {
        return $this->state(fn () => [
            'estado' => 'aprobada',
        ]);
    }

    public function programada(): static
    {
        return $this->state(fn () => [
            'estado' => 'programada',
        ]);
    }

    public function completada(): static
    {
        return $this->state(fn () => [
            'estado' => 'completada',
        ]);
    }
}
