<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Incidencia extends Model
{
    protected $fillable = [
        'entidad_tipo',
        'entidad_id',
        'tipo',
        'severidad',
        'descripcion',
        'estado',
        'reportado_por',
        'asignado_a',
        'resolucion',
        'fecha_resolucion',
        'evidencias',
    ];

    protected $casts = [
        'evidencias' => 'array',
        'fecha_resolucion' => 'datetime',
    ];

    public function entidad()
    {
        return $this->morphTo('entidad', 'entidad_tipo', 'entidad_id');
    }

    public function reportadoPor()
    {
        return $this->belongsTo(User::class, 'reportado_por');
    }

    public function asignadoA()
    {
        return $this->belongsTo(User::class, 'asignado_a');
    }
}
