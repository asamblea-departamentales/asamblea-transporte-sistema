<?php

namespace App\Models;

use App\Domain\Solicitudes\Enums\NivelPrioridadEnum;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;
use Override;

class Grupo extends Model
{
    protected $fillable = [
        'nombre',
        'descripcion',
        'nivel_prioridad',
        'orden',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'orden' => 'integer',
    ];

    // -------------------------------------------------------
    // Relaciones
    // -------------------------------------------------------
    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class);
    }

    // -------------------------------------------------------
    // Scopes
    // -------------------------------------------------------
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true)->orderBy('orden');
    }

    // -------------------------------------------------------
    // Métodos adicionales
    // -------------------------------------------------------
    public function nivelEnum(): NivelPrioridadEnum
    {
        return NivelPrioridadEnum::tryFrom($this->nivel_prioridad)
            ?? NivelPrioridadEnum::BAJA; // Valor por defecto si no se encuentra el valor en el enum
    }

    public function label(): string
    {
        return $this->nivelEnum()->label();
    }

    public function color(): string
    {
        return $this->nivelEnum()->color();
    }

    /// cache para evitar consultas repetitivas
    #[Override]
    public static function booted()
    {
        static::saved(function () {
            Cache::forget('grupos_activos');
        });

        static::deleted(function () {
            Cache::forget('grupos_activos');
        });
    }

    public static function activos()
    {
        return Cache::remember('grupos_activos', now()->addHours(24), function () {
            return self::where('activo', true)->orderBy('orden')->get();
        });
    }
}    