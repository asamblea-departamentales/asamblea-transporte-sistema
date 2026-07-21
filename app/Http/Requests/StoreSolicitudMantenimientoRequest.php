<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSolicitudMantenimientoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'vehiculo_id' => ['required', 'exists:vehiculos,id'],
            'veh_tipo_mantenimiento_id' => ['required', 'exists:veh_tipo_mantenimientos,id'],
            'tipo_solicitud' => ['required', 'in:taller,llantas'],
            'detalle' => ['required', 'string'],
            'fecha_sugerida' => ['required', 'date'],
            'costo_estimado' => ['nullable', 'numeric', 'min:0'],
            'observaciones' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
