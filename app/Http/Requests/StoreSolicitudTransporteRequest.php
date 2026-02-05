<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSolicitudTransporteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
{
    return [
        'unidad_solicitante_id' => ['required', 'exists:unidad_solicitantes,id'],
        'motivo_actividad' => ['required', 'string', 'max:5000'],
        'origen' => ['required', 'string', 'max:255'],
        'destino' => ['required', 'string', 'max:255'],
        'fecha_salida' => ['required', 'date', 'after_or_equal:now'],
        'fecha_retorno' => ['nullable', 'date', 'after:fecha_salida'],
        'cantidad_personas' => ['required', 'integer', 'min:1', 'max:60'],
        'prioridad' => ['required', 'in:baja,media,alta'],
    ];
}

}
