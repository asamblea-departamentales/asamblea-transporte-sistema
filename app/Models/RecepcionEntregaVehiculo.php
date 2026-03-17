<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class RecepcionEntregaVehiculo extends Model
{
    use SoftDeletes;

    protected $table = 'recepciones_entregas_vehiculo';

    protected $fillable = [
        'vehiculo_id',
        'motorista_id',
        'user_id',
        'tipo_movimiento',
        'fecha_hora',
        'kilometraje',
        'nivel_combustible',
        'estado_exterior',
        'estado_interior',
        'herramientas_completas',
        'accesorios_completos',
        'entregado_por',
        'recibido_por',
        'observaciones',
        'adjuntos',
        'solicitud_transporte_id',

    ];

    protected $casts = [
        'fecha_hora' => 'datetime',
        'herramientas_completas' => 'boolean',
        'accesorios_completos' => 'boolean',
        'adjuntos' => 'array',
    ];

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class);
    }

    public function motorista()
    {
        return $this->belongsTo(Motorista::class);
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function tieneAdjuntos(): bool
    {
        return !empty($this->adjuntos);
    }

    public function solicitud(): BelongsTo
    {
        return $this->belongsTo(SolicitudTransporte::class, 'solicitud_transporte_id');
    }
}