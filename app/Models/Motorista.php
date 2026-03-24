<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Motorista extends Model
{
    use SoftDeletes;

    protected $table = 'motoristas';

    protected $fillable = [
        'nombre',
        'dui',
        'telefono',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];
    
    //Relacion con sus estados
    public function estados()
    {
        return $this->hasMany(MotoristaEstado::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function estadoActual()
    {
        return $this->hasOne(MotoristaEstado::class)->latestOfMany('fecha_inicio');    
    }

    public function asignacionesVehiculo(): HasMany
    {
        return $this->hasMany(AsignacionVehiculoMotorista::class, 'motorista_id');
    }

    public function tipoLicencia(): BelongsTo
{
    return $this->belongsTo(\App\Models\TipoLicencia::class);
}

    /**
     * Vehículo vigente del motorista (si existe).
     */
    public function asignacionVigenteVehiculo(): HasOne
    {
        return $this->hasOne(AsignacionVehiculoMotorista::class, 'motorista_id')
            ->where('vigente', true)
            ->whereNull('hasta')
            ->latest('desde');
    }
}
