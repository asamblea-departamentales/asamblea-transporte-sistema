<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AsignacionVehiculoMotorista extends Model
{
    protected $table = 'asignaciones_vehiculo_motorista';

    protected $fillable = [
        'vehiculo_id',
        'motorista_id',
        'desde',
        'hasta',
        'vigente',
    ];

    protected $casts = [
        'desde' => 'datetime',
        'hasta' => 'datetime',
        'vigente' => 'boolean',
    ];

    public function vehiculo(): BelongsTo
    {
        return $this->belongsTo(Vehiculo::class, 'vehiculo_id');
    }

    public function motorista(): BelongsTo
    {
        return $this->belongsTo(Motorista::class, 'motorista_id');
    }
}
