<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DecisionOperativa extends Model
{
    protected $table = 'decisiones_operativas';

    protected $fillable = [
        'solicitud_id',
        'usuario_operativo_id',
        'vehiculo_final_id',
        'motorista_final_id',
        'cambio_detectado',
        'justificacion',
    ];

    public function solicitud(): BelongsTo
    {
        return $this->belongsTo(SolicitudTransporte::class, 'solicitud_id');
    }

    public function usuarioOperativo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_operativo_id');
    }

    public function vehiculoFinal(): BelongsTo
    {
        return $this->belongsTo(Vehiculo::class, 'vehiculo_final_id');
    }

    public function motoristaFinal(): BelongsTo
    {
        return $this->belongsTo(Motorista::class, 'motorista_final_id');
    }
}
