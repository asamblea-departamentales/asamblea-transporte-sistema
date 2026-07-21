<?php

namespace Database\Factories;

use App\Models\Motorista;
use App\Models\TipoLicencia;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Motorista>
 */
class MotoristaFactory extends Factory
{
    protected $model = Motorista::class;

    public function definition(): array
    {
        return [
            'nombre' => fake()->name(),
            'dui' => fake()->numerify('########-#'),
            'telefono' => fake()->numerify('####-####'),
            'activo' => true,
            'correo' => fake()->unique()->safeEmail(),
            'numero_empleado' => fake()->numerify('EMP-#####'),
            'numero_licencia' => strtoupper(fake()->randomLetter().fake()->randomLetter().fake()->randomLetter()).fake()->numerify('######'),
            'tipo_licencia_id' => TipoLicencia::firstOrCreate(
                ['nombre' => 'Clase A'],
                ['activo' => true]
            )->id,
            'fecha_vencimiento_licencia' => fake()->dateTimeBetween('+1 year', '+5 years'),
            'radio' => fake()->optional(0.7)->word(),
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'activo' => false,
        ]);
    }

    public function withUser(int $userId): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $userId,
        ]);
    }
}
