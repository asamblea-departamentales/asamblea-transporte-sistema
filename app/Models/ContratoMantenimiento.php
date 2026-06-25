<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContratoMantenimiento extends Model
{
    protected $table = 'contratos_mantenimiento';

    protected $fillable = [
        'proveedor_id',
        'numero_contrato',
        'nombre',
        'monto_inicial',
        'monto_disponible',
        'fecha_inicio',
        'fecha_fin',
        'activo',
        'observaciones',
    ];

    protected $casts = [
        'monto_inicial' => 'decimal:2',
        'monto_disponible' => 'decimal:2',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'activo' => 'boolean',
    ];

    public function proveedor()
    {
        return $this->belongsTo(\App\Models\Proveedor::class, 'proveedor_id');
    }
}
