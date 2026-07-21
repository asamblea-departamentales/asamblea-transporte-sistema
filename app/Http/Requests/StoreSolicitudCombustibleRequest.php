<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSolicitudCombustibleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'vehiculo_id' => ['required', 'exists:vehiculos,id'],
            'motorista_id' => ['nullable', 'exists:motoristas,id'],
            'solicitud_transporte_id' => ['nullable', 'exists:solicitud_transportes,id'],
            'destino_actividad' => ['required', 'string'],
            'fecha_solicitud' => ['required', 'date'],
            'fecha_inicio_periodo' => ['nullable', 'date'],
            'fecha_fin_periodo' => ['nullable', 'date', 'after_or_equal:fecha_inicio_periodo'],
            'cantidad_combustible' => ['required', 'numeric', 'min:0'],
            'observaciones' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
