<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LiquidacionCombustible extends Model
{
    protected $table = 'liquidaciones_combustible';

    protected $fillable = [
        'solicitud_id',
        'user_id',
        'monto_solicitado',
        'monto_validado',
        'resultado',
        'observaciones',
        'fecha_liquidacion',
    ];

    protected $casts = [
        'fecha_liquidacion' => 'datetime',
    ];

    // Relaciones
    public function solicitud()
    {
        return $this->belongsTo(SolicitudCombustible::class, 'solicitud_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
