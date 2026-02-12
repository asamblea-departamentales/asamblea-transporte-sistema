<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Departamental extends Model
{
    // indica a Eloquent el nombre correcto de la tabla
    protected $table = 'departamentales';

    protected $fillable = ['nombre', 'codigo', 'activo'];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}