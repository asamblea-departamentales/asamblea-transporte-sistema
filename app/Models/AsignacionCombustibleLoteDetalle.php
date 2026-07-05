<?php

// app/Models/AsignacionCombustibleLoteDetalle.php

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
        // Campos operativos
        'asignado_por',
        'fecha_asignacion',
        'numero_serie',
        'numero_contrato',
        'tipo_combustible_id',
        'cantidad_galones',
        'estado_asignacion',
        'observaciones_operativas',
    ];

    protected $casts = [
        'monto_asignado' => 'decimal:2',
        'cantidad_galones' => 'decimal:2',
        'fecha_asignacion' => 'datetime',
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

    public function asignadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'asignado_por');
    }

    public function tipoCombustible(): BelongsTo
    {
        return $this->belongsTo(VehTipoCombustible::class, 'tipo_combustible_id');
    }

    public function estaCompleto(): bool
    {
        return ! empty($this->numero_serie)
            && ! empty($this->numero_contrato)
            && ! empty($this->tipo_combustible_id)
            && ! empty($this->cantidad_galones);
    }
}
