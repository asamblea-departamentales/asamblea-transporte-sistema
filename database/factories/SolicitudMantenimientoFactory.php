<?php

namespace Database\Factories;

use App\Models\SolicitudMantenimiento;
use App\Models\User;
use App\Models\VehTipoMantenimiento;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SolicitudMantenimiento>
 */
class SolicitudMantenimientoFactory extends Factory
{
    protected $model = SolicitudMantenimiento::class;

    public function definition(): array
    {
        return [
            'vehiculo_id' => \App\Models\Vehiculo::factory(),
            'veh_tipo_mantenimiento_id' => VehTipoMantenimiento::firstOrCreate(
                ['nombre' => 'Cambio de Aceite'],
                ['activo' => true]
            )->id,
            'tipo_solicitud' => 'taller',
            'detalle' => fake()->sentence(),
            'fecha_sugerida' => fake()->dateTimeBetween('+1 week', '+1 month'),
            'solicitante_id' => User::factory(),
            'prioridad' => 'media',
            'costo_estimado' => fake()->randomFloat(2, 50, 500),
            'estado' => 'pendiente',
            'observaciones' => fake()->optional(0.5)->sentence(),
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

    public function completada(): static
    {
        return $this->state(fn () => [
            'estado' => 'completada',
        ]);
    }
}
