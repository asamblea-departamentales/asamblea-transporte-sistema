<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MotoristaEstado extends Model
{
    protected $fillable = [
        'motorista_id',
        'activo',
        'motivo',
        'archivo',
        'fecha_inicio',
        'fecha_fin',
        'user_id',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
    ];

    // Relacion directa con motorista
    public function motorista()
    {
        return $this->belongsTo(Motorista::class);
    }
}
