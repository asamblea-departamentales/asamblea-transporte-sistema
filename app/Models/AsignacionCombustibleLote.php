<?php
// app/Models/AsignacionCombustibleLote.php

namespace App\Models;

use App\Domain\Solicitudes\Enums\EstadoLoteEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AsignacionCombustibleLote extends Model
{
    protected $table = 'asignaciones_combustibles_lotes';

    protected $fillable = [
        'fecha',
        'creado_por',
        'estado',
        'observaciones',
    ];

    protected $casts = [
        'fecha'  => 'date',
        'estado' => EstadoLoteEnum::class,
    ];

    public function getTotalMontoAttribute(): float
    {
        return $this->detalles->sum('monto_asignado');
    }

    public function getTotalGalonesAttribute(): float
    {
        return $this->detalles->sum('cantidad_galones');
    }

    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creado_por');
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(AsignacionCombustibleLoteDetalle::class, 'lote_id');
    }

    /** Todos los detalles tienen monto > 0 */
    public function todosConMonto(): bool
    {
        return $this->detalles->every(fn ($d) => $d->monto_asignado > 0);
    }

    /** Todos los detalles tienen campos operativos completos */
    public function todosCompletos(): bool
    {
        return $this->detalles->every(fn ($d) => $d->estaCompleto());
    }
}