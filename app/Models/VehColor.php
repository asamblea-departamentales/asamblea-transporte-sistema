<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VehColor extends Model
{
    protected $table = 'veh_colores';
    protected $fillable = ['nombre', 'activo'];
    protected $casts = ['activo' => 'boolean'];

    public function vehiculos(): HasMany
    {
        return $this->hasMany(Vehiculo::class, 'veh_colores_id');
    }
}