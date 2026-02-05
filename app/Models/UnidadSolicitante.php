<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UnidadSolicitante extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nombre',
        'siglas',
        'estado',
        'puede_solicitar_transporte',
    ];

    //Relacion con solicitudes (una unidad solicitante puede tener muchas solicitudes)
    public function solicitudes(){
        return $this->hasMany(SolicitudTransporte::class);
    }
}
