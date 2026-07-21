<?php

namespace App\Http\Requests\Traits;

trait ValidaVehiculoMotorista
{
    public function reglasVehiculoId(): array
    {
        return ['required', 'exists:vehiculos,id'];
    }

    public function reglasMotoristaId(): array
    {
        return ['nullable', 'exists:motoristas,id'];
    }
}
