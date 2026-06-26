<?php

namespace App\Models;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Domain\Solicitudes\Services\TicketService;


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
        'motivo_cancelacion',
        'observaciones',
        'firma_aprobador',
        'adjuntos',
        'finalizado_por',
        'fecha_finalizacion',
        'evaluacion_estado',
        'evaluacion_comentario',
        'evaluado_por',
        'fecha_evaluacion',
        'contrato_mantenimiento_id',
    ];

    protected $casts = [
        'fecha_sugerida' => 'date',
        'fecha_realizada' => 'date',
        'fecha_aprobacion' => 'datetime',
        'costo_estimado' => 'decimal:2',
        'costo_real' => 'decimal:2',
        'adjuntos' => 'array',
        'estado' => EstadoSolicitudEnum::class,
        'prioridad' => PrioridadSolicitudEnum::class,
        'fecha_finalizacion' => 'datetime',
        'fecha_evaluacion' => 'datetime',
    ];

    // ── Booted ──────────────────────────────────────────────

    protected static function booted()
    {
        static::creating(function ($solicitud) {
            $year = now()->year;
            $ultima = static::where('codigo', 'like', "SM-{$year}-%")
                ->latest('id')
                ->first();

            $numero = $ultima ? ((int) substr($ultima->codigo, -6)) + 1 : 1;

            $solicitud->codigo = "SM-{$year}-".str_pad($numero, 6, '0', STR_PAD_LEFT);

            app(TicketService::class)->generar($solicitud);
        });
    }

    public function contratoMantenimiento(): BelongsTo
    {
        return $this->belongsTo(ContratoMantenimiento::class);
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

    public function evaluador()
    {
        return $this->belongsTo(User::class, 'evaluado_por');
    }

    public function historialEstados()
    {
        return $this->morphMany(HistorialEstado::class, 'entidad', 'entidad_tipo', 'entidad_id');
    }

    public function liquidacion(): \Illuminate\Database\Eloquent\Relations\MorphOne
    {
        return $this->morphOne(Liquidacion::class, 'liquidable');
    }

    // Relacion para incidencias
    public function incidencias()
    {
        return $this->morphMany(Incidencia::class, 'entidad', 'entidad_tipo', 'entidad_id');
    }

    // ── Helpers ─────────────────────────────────────────────

    public function tieneAdjuntos(): bool
    {
        return ! empty($this->adjuntos);
    }

    public function puedeCompletarse(): bool
    {
        return $this->estado === EstadoSolicitudEnum::EN_EJECUCION
            && $this->tieneAdjuntos();
    }
}
