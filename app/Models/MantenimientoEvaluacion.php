<?php

// app/Models/MantenimientoEvaluacion.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MantenimientoEvaluacion extends Model
{
    protected $fillable = [
        'solicitud_mantenimiento_id',
        'user_id',
        'coincide',
        'observaciones',
    ];

    public function solicitud()
    {
        return $this->belongsTo(SolicitudMantenimiento::class);
    }

    public function evaluador()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
