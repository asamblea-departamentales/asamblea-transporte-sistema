<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Proveedor extends Model
{
    use SoftDeletes;

    protected $table = 'proveedores';

    protected $fillable = [
        'municipio_id', 'actividad_economica_id', 'tamano_proveedor_id',
        'nombre_comercial', 'nombre', 'apellido', 'direccion',
        'dui', 'nit', 'nrc', 'tipo_persona', 'activo',
    ];

    protected $casts = ['activo' => 'boolean'];

    public function municipio(): BelongsTo
    {
        return $this->belongsTo(Municipio::class);
    }

    public function actividadEconomica(): BelongsTo
    {
        return $this->belongsTo(ActividadEconomica::class);
    }

    public function tamanoProveedor(): BelongsTo
    {
        return $this->belongsTo(TamanoProveedor::class);
    }

    public function getNombreCompletoAttribute(): string
    {
        return $this->nombre_comercial ?: $this->nombre;
    }
}
