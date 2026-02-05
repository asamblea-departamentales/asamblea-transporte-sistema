<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BitacoraEvento extends Model
{
    protected $fillable = [
        'entidad_tipo',
        'entidad_id',
        'accion',
        'user_id',
        'datos_extra',
    ];

    protected $casts = [
        'datos_extras' => 'array',
    ];

    // Relaciones
    public function usuario(){
        return $this->belongsTo(User::class, 'user_id');
}

}