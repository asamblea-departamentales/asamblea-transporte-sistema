<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SerieVale extends Model
{
    protected $table = 'serie_vales';
    protected $fillable = [
        'nombre', 'valor', 'valor_compra',
        'fecha_emision', 'fecha_vencimiento', 'fecha_recibido',
        'correlativo_inicio', 'correlativo_fin', 'cantidad',
        'observaciones', 'activo',
    ];
    protected $casts = [
        'activo'            => 'boolean',
        'fecha_emision'     => 'date',
        'fecha_vencimiento' => 'date',
        'fecha_recibido'    => 'date',
        'valor'             => 'decimal:2',
        'valor_compra'      => 'decimal:2',
    ];

    public function getEstaVigenteAttribute(): bool
    {
        return $this->activo && $this->fecha_vencimiento >= now()->toDateString();
    }
}