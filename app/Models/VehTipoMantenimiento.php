<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehTipoMantenimiento extends Model
{
    protected $table = 'veh_tipo_mantenimientos';

    protected $fillable = ['nombre', 'descripcion', 'activo'];

    protected $casts = ['activo' => 'boolean'];
}
