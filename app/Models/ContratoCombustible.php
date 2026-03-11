<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContratoCombustible extends Model
{
    protected $table = 'contrato_combustibles';

    protected $fillable = [
        'numero_contrato',
        'nombre',
        'monto_inicial',
        'monto_disponible',
        'fecha_inicio',
        'fecha_fin',
        'activo',
        'observaciones',
    ];

    protected $casts = [
        'monto_inicial' => 'decimal:2',
        'monto_disponible' => 'decimal:2',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'activo' => 'boolean',
    ];

    public function series()
    {
        return $this->hasMany(SerieVale::class, 'contrato_id');
    }

    public function solicitudes()
    {
        return $this->hasMany(SolicitudCombustible::class, 'contrato_id');
    }
}