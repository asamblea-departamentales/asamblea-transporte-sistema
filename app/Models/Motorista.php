<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
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

    //NUEVOS: Scopes y Accesors para estados operativos
    //True si el motorista no tiene estado o su estado actual es activo, false si su estado actual es inactivo
    public function getEstaDisponibleAttribute(): bool
    {
        return (bool) ($this->estadoActual?->activo ?? true);
    }

    //Filtra motoristas sin estado o con estado activo
    public function scopeDisponibles(Builder $query): Builder
    {
        $disponiblesIds = MotoristaEstado::query()
            ->select('motorista_id')
            ->whereIn('id', function ($q) {
                $q->selectRaw('MAX(id)')
                    ->from('motorista_estados')
                    ->groupBy('motorista_id');
            })
            ->where('activo', true)
            ->pluck('motorista_id');

        $sinEstado = Motorista::whereDoesntHave('estados')->pluck('id');

        $ids = $disponiblesIds->merge($sinEstado)->unique();

        return $query->whereIn('id', $ids);
    }

    //Filtra motoristas con estado inactivo (o con estado activo pero que no es el último)
    public function scopeNoDisponibles(Builder $query): Builder
    {
        $noDisponiblesIds = MotoristaEstado::query()
            ->select('motorista_id')
            ->whereIn('id', function ($q) {
                $q->selectRaw('MAX(id)')
                    ->from('motorista_estados')
                    ->groupBy('motorista_id');
            })
            ->where('activo', false)
            ->pluck('motorista_id');

        return $query->whereIn('id', $noDisponiblesIds);
    }
}
