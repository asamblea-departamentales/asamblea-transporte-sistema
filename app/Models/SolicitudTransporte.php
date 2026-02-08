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
    protected static function booted()
    {
        // ✅ Cambiamos a 'creating' (antes de que la DB reciba los datos)
        static::creating(function ($solicitud) {
            $year = now()->year;
            
            // Como el ID aún no existe en 'creating', usamos el máximo actual + 1
            $ultimoId = static::max('id') ?? 0;
            $proximoId = $ultimoId + 1;
            
            $solicitud->codigo = "TR-{$year}-" . str_pad($proximoId, 6, '0', STR_PAD_LEFT);
            
            // ✅ IMPORTANTE: No necesitas save() ni saveQuietly() aquí, 
            // ya que estamos en el proceso de creación.
        });
    }

    // Relaciones
    public function unidad() { return $this->belongsTo(UnidadSolicitante::class, 'unidad_solicitante_id'); }
    public function solicitante() { return $this->belongsTo(User::class, 'solicitante_id'); }
    public function autorizador() { return $this->belongsTo(User::class, 'decidido_por'); }
}