<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Vehiculo extends Model
{
    use SoftDeletes;

    protected $table = 'vehiculos';

    protected $fillable = [
        'placa',
        'tipo_vehiculo_id',
        'marca',
        'modelo',
        'anio',
        'capacidad_personas',
        'estado',
        'activo',
    ];

    protected $casts = [
        'anio' => 'integer',
        'capacidad_personas' => 'integer',
        'activo' => 'boolean',
    ];

    public function tipo(): BelongsTo
    {
        return $this->belongsTo(TipoVehiculo::class, 'tipo_vehiculo_id');
    }

    public function asignacionesMotorista(): HasMany
    {
        return $this->hasMany(AsignacionVehiculoMotorista::class, 'vehiculo_id');
    }

    /**
     * Motorista vigente del vehículo (si existe).
     */
    public function asignacionVigenteMotorista(): HasOne
    {
        return $this->hasOne(AsignacionVehiculoMotorista::class, 'vehiculo_id')
            ->where('vigente', true)
            ->whereNull('hasta')
            ->latest('desde');
    }
}
