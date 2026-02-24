<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehModelo extends Model
{
    protected $table = 'veh_modelos';

    // Agregamos 'veh_marca_id' al fillable para que Laravel permita guardarlo
    protected $fillable = ['nombre', 'activo', 'veh_marca_id'];

    protected $casts = [
        'activo' => 'boolean'
    ];

    /**
     * Relación con la Marca (Inversa)
     * Un modelo PERTENECE a una marca.
     */
    public function marca(): BelongsTo
    {
        return $this->belongsTo(VehMarca::class, 'veh_marca_id');
    }

    public function vehiculos(): HasMany
    {
        return $this->hasMany(Vehiculo::class, 'veh_modelos_id');
    }
}