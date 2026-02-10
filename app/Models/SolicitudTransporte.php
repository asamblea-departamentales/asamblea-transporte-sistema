<?php

namespace App\Models;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SolicitudTransporte extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'codigo', // ✅ Agregado al fillable
        'unidad_solicitante_id',
        'solicitante_id',
        'motivo_actividad',
        'origen',
        'destino',
        'fecha_salida',
        'fecha_retorno',
        'cantidad_personas',
        'prioridad',
        'estado',
        'decidido_por',
        'decidido_en',
        'comentario_jefe',
    ];

    protected $casts = [
        'prioridad' => PrioridadSolicitudEnum::class,
        'estado' => EstadoSolicitudEnum::class,
        'fecha_salida' => 'datetime',
        'fecha_retorno' => 'datetime',
        'decidido_en' => 'datetime',
    ];

    /**
     * Generar código único automáticamente antes de crear
     */
     /**
     * Generar código único por usuario automáticamente
     */
    protected static function booted()
    {
        static::creating(function ($solicitud) {
            $year = now()->year;
            $userId = $solicitud->solicitante_id;
            
            // Contar cuántas solicitudes tiene ESTE USUARIO en este año
            $cantidad = static::where('solicitante_id', $userId)
                ->whereYear('created_at', $year)
                ->count();
            
            $numero = $cantidad + 1;
            
            // Formato: TR-2025-000001 (resetea por usuario)
            $solicitud->codigo = "TR-{$year}-" . str_pad($numero, 6, '0', STR_PAD_LEFT);
        });
    }

    // Relaciones
    public function unidad() { return $this->belongsTo(UnidadSolicitante::class, 'unidad_solicitante_id'); }
    public function solicitante() { return $this->belongsTo(User::class, 'solicitante_id'); }
    public function autorizador() { return $this->belongsTo(User::class, 'decidido_por'); }
}