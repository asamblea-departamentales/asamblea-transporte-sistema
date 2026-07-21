<?php

namespace Database\Factories;

use App\Models\SolicitudCombustible;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SolicitudCombustible>
 */
class SolicitudCombustibleFactory extends Factory
{
    protected $model = SolicitudCombustible::class;

    public function definition(): array
    {
        $cantidad = fake()->randomFloat(2, 10, 100);

        return [
            'vehiculo_id' => \App\Models\Vehiculo::factory(),
            'motorista_id' => \App\Models\Motorista::factory(),
            'solicitante_id' => User::factory(),
            'destino_actividad' => fake()->sentence(),
            'fecha_solicitud' => fake()->dateTimeBetween('-1 week', 'now'),
            'fecha_inicio_periodo' => fake()->dateTimeBetween('-1 month', '-1 week'),
            'fecha_fin_periodo' => fake()->dateTimeBetween('-1 week', 'now'),
            'cantidad_combustible' => $cantidad,
            'valor_unitario' => 1,
            'valor_total' => $cantidad,
            'forma_pago' => 'carga',
            'estado' => 'pendiente',
            'prioridad' => 'media',
            'prioridad_grupo' => 'media',
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
