<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SolicitudDestinoAdicional extends Model
{
    protected $table = 'solicitud_destinos_adicionales';

    protected $fillable = [
        'solicitud_transporte_id',
        'nombre',
        'lat',
        'lng',
        'agregado_por',
        'agregado_durante_viaje',
        'orden',
    ];

    protected function casts(): array
    {
        return [
            'lat' => 'decimal:8',
            'lng' => 'decimal:8',
            'agregado_durante_viaje' => 'boolean',
            'orden' => 'integer',
        ];
    }

    public function solicitudTransporte(): BelongsTo
    {
        return $this->belongsTo(SolicitudTransporte::class);
    }

    public function agregadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agregado_por');
    }
}
