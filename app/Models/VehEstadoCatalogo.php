<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehEstadoCatalogo extends Model
{
    protected $table = 'veh_estados_catalogo';
    protected $fillable = ['nombre', 'activo'];
    protected $casts = ['activo' => 'boolean'];
}