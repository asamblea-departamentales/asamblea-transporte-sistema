<?php

namespace App\Models;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SolicitudMantenimiento extends Model
{
    use SoftDeletes;

    protected $table = 'solicitudes_mantenimiento';

    protected $fillable = [
        'codigo',
        'vehiculo_id',
        'veh_tipo_mantenimiento_id',
        'tipo_solicitud',
        'detalle',
        'fecha_sugerida',
        'fecha_realizada',
        'solicitante_id',
        'prioridad',
        'costo_estimado',
        'costo_real',
        'estado',
        'aprobador_id',
        'fecha_aprobacion',
        'motivo_rechazo',
        'observaciones',
        'adjuntos',
        'finalizado_por',
        'fecha_finalizacion',
    ];

    protected $casts = [
        'fecha_sugerida'   => 'date',
        'fecha_realizada'  => 'date',
        'fecha_aprobacion' => 'datetime',
        'costo_estimado'   => 'decimal:2',
        'costo_real'       => 'decimal:2',
        'adjuntos'         => 'array',
        'estado'           => EstadoSolicitudEnum::class,
        'prioridad'        => PrioridadSolicitudEnum::class,
        'fecha_finalizacion',
    ];

    // ── Booted ──────────────────────────────────────────────

    protected static function booted()
    {
        static::creating(function ($solicitud) {
            $year   = now()->year;
            $ultima = static::where('codigo', 'like', "SM-{$year}-%")
                ->latest('id')
                ->first();

            $numero = $ultima ? ((int) substr($ultima->codigo, -6)) + 1 : 1;

            $solicitud->codigo = "SM-{$year}-" . str_pad($numero, 6, '0', STR_PAD_LEFT);
        });
    }

    // ── Relaciones ──────────────────────────────────────────

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class);
    }

    public function tipoMantenimiento()
    {
        return $this->belongsTo(VehTipoMantenimiento::class, 'veh_tipo_mantenimiento_id');
    }

    public function solicitante()
    {
        return $this->belongsTo(User::class, 'solicitante_id');
    }

    public function aprobador()
    {
        return $this->belongsTo(User::class, 'aprobador_id');
    }

    public function finalizador()
    {
        return $this->belongsTo(User::class, 'finalizado_por');
    }

    // ── Helpers ─────────────────────────────────────────────

    public function tieneAdjuntos(): bool
    {
        return !empty($this->adjuntos);
    }

    public function puedeCompletarse(): bool
    {
        return $this->estado === EstadoSolicitudEnum::EN_EJECUCION
            && $this->tieneAdjuntos();
    }
}