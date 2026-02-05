<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HistorialEstado extends Model
{
    protected $fillable = [
        'entidad_tipo',
        'entidad_id',
        'estado_anterior',
        'estado_nuevo',
        'user_id',
        'comentario',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
