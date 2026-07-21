<?php

namespace App\Models;

use App\Domain\Solicitudes\Contracts\Workflowable;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use App\Domain\Solicitudes\Services\TicketService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class SolicitudMantenimiento extends Model implements Workflowable
{
    use HasFactory, SoftDeletes;

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

            $codigo = DB::transaction(function () use ($year) {
                $ultima = static::where('codigo', 'like', "SM-{$year}-%")
                    ->latest('id')
                    ->lockForUpdate()
                    ->first();

                $numero = $ultima ? ((int) substr($ultima->codigo, -6)) + 1 : 1;

                return "SM-{$year}-".str_pad($numero, 6, '0', STR_PAD_LEFT);
            });

            $solicitud->codigo = $codigo;

            app(TicketService::class)->generar($solicitud);
        });
    }

    public function contratoMantenimiento(): BelongsTo
    {
        return $this->belongsTo(ContratoMantenimiento::class);
    }

    public function getRouteKeyName(): string
    {
        return 'codigo';
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

    public function decisionOperativa(): \Illuminate\Database\Eloquent\Relations\MorphOne
    {
        return $this->morphOne(DecisionOperativa::class, 'decidable');
    }

    // Relacion para incidencias
    public function incidencias()
    {
        return $this->morphMany(Incidencia::class, 'entidad', 'entidad_tipo', 'entidad_id');
    }

    // ── Workflowable ─────────────────────────────────────────

    public function getEstado(): EstadoSolicitudEnum
    {
        return $this->estado;
    }

    public function setEstado(EstadoSolicitudEnum $estado): static
    {
        $this->estado = $estado;

        return $this;
    }

    public function getEntidadTipo(): string
    {
        return 'solicitud_mantenimiento';
    }

    public function getSolicitanteId(): int
    {
        return $this->solicitante_id;
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
