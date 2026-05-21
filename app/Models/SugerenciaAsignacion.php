<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SugerenciaAsignacion extends Model
{
    protected $table = 'sugerencias_asignacion';

    protected $fillable = [
        'solicitud_id',
        'vehiculo_sugerido_id',
        'motorista_sugerido_id',
        'horas_motorista_periodo',
        'combustible_porcentaje',
        'score_confianza',
        'bullets_tecnicos',
    ];

    protected $casts = [
        'bullets_tecnicos' => 'array',
    ];

    public function solicitud(): BelongsTo
    {
        return $this->belongsTo(SolicitudTransporte::class, 'solicitud_id');
    }

    public function vehiculoSugerido(): BelongsTo
    {
        return $this->belongsTo(Vehiculo::class, 'vehiculo_sugerido_id');
    }

    public function motoristaSugerido(): BelongsTo
    {
        return $this->belongsTo(Motorista::class, 'motorista_sugerido_id');
    }
}
