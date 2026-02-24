<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VehModelo extends Model
{
    protected $table = 'veh_modelos';
    protected $fillable = ['nombre', 'activo'];
    protected $casts = ['activo' => 'boolean'];

    public function vehiculos(): HasMany
    {
        return $this->hasMany(Vehiculo::class, 'veh_modelos_id');
    }
}