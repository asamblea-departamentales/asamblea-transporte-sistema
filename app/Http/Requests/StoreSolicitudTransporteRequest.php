<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSolicitudTransporteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'unidad_solicitante_id' => ['required', 'exists:unidad_solicitantes,id'],
            'motivo_actividad' => ['required', 'string'],
            'origen' => ['required', 'string'],
            'destino_principal' => ['required', 'string'],
            'destino_adicional' => ['nullable', 'string'],
            'fecha_salida' => ['required', 'date'],
            'fecha_retorno' => ['nullable', 'date', 'after_or_equal:fecha_salida'],
            'hora_salida' => ['nullable'],
            'cantidad_personas' => ['required', 'integer', 'min:1'],
            'prioridad' => ['required', 'string'],
            'tipo_vehiculo' => ['required', 'string'],
            'encargado' => ['required', 'string'],
            'subencargado' => ['nullable', 'string'],
            'hora_retorno' => ['nullable'],
            'origen_lat' => ['nullable', 'numeric'],
            'origen_lng' => ['nullable', 'numeric'],
            'destino_lat' => ['nullable', 'numeric'],
            'destino_lng' => ['nullable', 'numeric'],
            'destino_adicional_lat' => ['nullable', 'numeric'],
            'destino_adicional_lng' => ['nullable', 'numeric'],
            'destinos_adicionales' => ['nullable', 'array'],
            'destinos_adicionales.*.nombre' => ['required_with:destinos_adicionales', 'string', 'max:255'],
            'destinos_adicionales.*.lat' => ['nullable', 'numeric'],
            'destinos_adicionales.*.lng' => ['nullable', 'numeric'],
        ];
    }
}
