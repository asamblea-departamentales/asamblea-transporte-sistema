<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Vehiculo extends Model
{
    use SoftDeletes;

    protected $table = 'vehiculos';

    protected $fillable = [
        // Campos 0riginales
        'placa',
        'tipo_vehiculo_id',
        'marca',
        'modelo',
        'anio',
        'capacidad_personas',
        'estado',
        'activo',
        'accesorios',

        // Nuevos catálogos
        'veh_marca_id',
        'veh_modelo_id',
        'veh_color_id',
        'veh_tipo_motor_id',
        'veh_transmision_id',
        'veh_traccion_id',
        'veh_tipo_llanta_id',
        'veh_tipo_combustible_id',
        'veh_clasificacion_id',
        'veh_estado_catalogo_id',

        // Campos técnicos
        'num_llantas',
        'chasis',
        'vin',
        'motor_numero',
        'vencimiento_tarjeta',
        'activo_fijo',
        'fotografia',
        'observacion',
    ];

    protected $casts = [
        'anio' => 'integer',
        'capacidad_personas' => 'integer',
        'num_llantas' => 'integer',
        'activo' => 'boolean',
        'vencimiento_tarjeta' => 'date',
        'accesorios' => 'array',
    ];

    protected $appends = ['fotografia_url'];

    // Accesor para la fotografía
    public function getFotografiaUrlAttribute(): ?string
    {
        if (! $this->fotografia) {
            return null;
        }

        return Storage::disk('public')->url($this->fotografia);
    }

    // Relaciones originales

    public function tipo(): BelongsTo
    {
        return $this->belongsTo(TipoVehiculo::class, 'tipo_vehiculo_id');
    }

    public function asignacionesMotorista(): HasMany
    {
        return $this->hasMany(AsignacionVehiculoMotorista::class, 'vehiculo_id');
    }

    public function asignacionVigenteMotorista(): HasOne
    {
        return $this->hasOne(AsignacionVehiculoMotorista::class, 'vehiculo_id')
            ->where('vigente', true)
            ->whereNull('hasta')
            ->latest('desde');
    }

    // Nuevas relaciones catálogos

    public function vehMarca(): BelongsTo
    {
        return $this->belongsTo(VehMarca::class, 'veh_marca_id');
    }

    public function vehModelo(): BelongsTo
    {
        return $this->belongsTo(VehModelo::class, 'veh_modelo_id');
    }

    public function color(): BelongsTo
    {
        return $this->belongsTo(VehColor::class, 'veh_color_id');
    }

    public function tipoMotor(): BelongsTo
    {
        return $this->belongsTo(VehTipoMotor::class, 'veh_tipo_motor_id');
    }

    public function transmision(): BelongsTo
    {
        return $this->belongsTo(VehTransmision::class, 'veh_transmision_id');
    }

    public function traccion(): BelongsTo
    {
        return $this->belongsTo(VehTraccion::class, 'veh_traccion_id');
    }

    public function tipoLlanta(): BelongsTo
    {
        return $this->belongsTo(VehTipoLlanta::class, 'veh_tipo_llanta_id');
    }

    public function tipoCombustible(): BelongsTo
    {
        return $this->belongsTo(VehTipoCombustible::class, 'veh_tipo_combustible_id');
    }

    public function clasificacion(): BelongsTo
    {
        return $this->belongsTo(VehClasificacion::class, 'veh_clasificacion_id');
    }

    public function estadoCatalogo(): BelongsTo
    {
        return $this->belongsTo(VehEstadoCatalogo::class, 'veh_estado_catalogo_id');
    }
}
