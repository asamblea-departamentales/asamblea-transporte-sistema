<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MotoristaEstado extends Model
{
    protected $fillable = [
        'motorista_id',
        'activo',
        'motivo',
        'fecha_inicio',
        'fecha_fin',
        'user_id',
    ];

    //Relacion directa con motorista
    public function motorista()
    {
        return $this->belongsTo(Motorista::class);
    }
}
