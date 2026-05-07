<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AsignacionCombustibleLoteDetalle extends Model
{
    protected $table = 'asignaciones_combustibles_lote_detalles';

    protected $fillable = [
        'lote_id',
        'vehiculo_id',
        'solicitud_combustible_id',
        'placa_cache',
        'monto_asignado',
        'numero_ticket',
    ];

    protected $casts = [
        'monto_asignado' => 'decimal:2',
    ];

    public function lote(): BelongsTo
    {
        return $this->belongsTo(AsignacionCombustibleLote::class, 'lote_id');
    }

    public function vehiculo(): BelongsTo
    {
        return $this->belongsTo(Vehiculo::class, 'vehiculo_id');
    }

    public function solicitudCombustible(): BelongsTo
    {
        return $this->belongsTo(SolicitudCombustible::class, 'solicitud_combustible_id');
    }
}