<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TipoVehiculo extends Model
{
    protected $table = 'tipo_vehiculos';

    protected $fillable = [
        'nombre',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    public function vehiculos(): HasMany
    {
        return $this->hasMany(Vehiculo::class, 'tipo_vehiculo_id');
    }
}
