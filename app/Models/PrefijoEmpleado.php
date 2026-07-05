<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrefijoEmpleado extends Model
{
    protected $table = 'prefijos_empleado';

    protected $fillable = ['prefijo', 'descripcion', 'activo'];

    protected $casts = ['activo' => 'boolean'];
}
