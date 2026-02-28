<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ActividadEconomica extends Model
{
    protected $table = 'actividades_economicas';
    protected $fillable = ['nombre', 'activo'];
    protected $casts = ['activo' => 'boolean'];

    public function proveedores(): HasMany
    {
        return $this->hasMany(Proveedor::class);
    }
}