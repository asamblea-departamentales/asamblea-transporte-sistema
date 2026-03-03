<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VehMarca extends Model
{
    protected $table = 'veh_marcas';
    protected $fillable = ['nombre', 'activo'];
    protected $casts = ['activo' => 'boolean'];

    //Para evitar problemas de deletes
    public function modelos(): HasMany
    {
        return $this->hasMany(VehModelo::class, 'veh_marca_id');
    }
    public function vehiculos(): HasMany
    {
        return $this->hasMany(Vehiculo::class, 'veh_marca_id');
    }
}