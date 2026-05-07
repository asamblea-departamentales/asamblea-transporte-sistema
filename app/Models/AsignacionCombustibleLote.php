<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Domain\Solicitudes\Enums\EstadoLoteEnum;

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
        'fecha' => 'date',
        'estado' => EstadoLoteEnum::class,
    ];

    public function getTotalMontoAttribute(): float
    {
        return $this->detalles->sum('monto_asignado');
    }

    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creado_por');
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(AsignacionCombustibleLoteDetalle::class, 'lote_id');
    }
}
