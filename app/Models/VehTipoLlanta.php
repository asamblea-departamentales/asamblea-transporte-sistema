<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VehTipoLlanta extends Model
{
    protected $table = 'veh_tipo_llantas';
    protected $fillable = ['nombre', 'activo'];
    protected $casts = ['activo' => 'boolean'];

    public function vehiculos(): HasMany
    {
        return $this->hasMany(Vehiculo::class, 'veh_tipo_llantas_id');
    }
}