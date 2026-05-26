<?php

namespace App\Models;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Domain\Solicitudes\Enums\NivelPrioridadEnum;
use App\Domain\Solicitudes\Services\TicketService;

class SolicitudCombustible extends Model
{
    use SoftDeletes;

    protected $table = 'solicitudes_combustible';

    protected $fillable = [
        'codigo',
        'fecha_solicitud',
        'fecha_inicio_periodo',
        'fecha_fin_periodo',
        'vehiculo_id',
        'motorista_id',
        'solicitud_transporte_id',
        'destino_actividad',
        'solicitante_id',
        'cantidad_combustible',
        'valor_unitario',
        'valor_total',
        'forma_pago',
        'numero_vale_ticket',
        'comprobantes',
        'estado',
        'prioridad',
        'prioridad_grupo',
        'aprobador_id',
        'fecha_aprobacion',
        'motivo_rechazo',
        'motivo_cancelacion',
        'observaciones',
        // Campos para contratos
        'contrato_id',
        'serie_vale_id',
        'correlativo_inicio',
        'correlativo_fin',
        'cantidad_vales',
        'valor_unitario_vale',
        'monto_asignado',
        'fecha_asignacion',
        'asignado_por',
    ];

    protected $casts = [
        'fecha_solicitud' => 'date',
        'fecha_inicio_periodo' => 'date',
        'fecha_fin_periodo' => 'date',
        'fecha_aprobacion' => 'datetime',
        'cantidad_combustible' => 'decimal:2',
        'valor_unitario' => 'decimal:2',
        'valor_total' => 'decimal:2',
        'comprobantes' => 'array',
        'estado' => EstadoSolicitudEnum::class,
        'prioridad' => PrioridadSolicitudEnum::class,

        // Casts para lo de contratos y vales
        'valor_unitario_vale' => 'decimal:2',
        'monto_asignado' => 'decimal:2',
        'fecha_asignacion' => 'datetime',

        // Casts para el grupo y prioridad (si se agregan)
        'prioridad_grupo' => NivelPrioridadEnum::class,
    ];

    // ── Booted ──────────────────────────────────────────────

    protected static function booted()
    {
        static::creating(function ($solicitud) {
            $year = now()->year;
            $ultima = static::where('codigo', 'like', "CB-{$year}-%")
                ->latest('id')
                ->first();

            $numero = $ultima ? ((int) substr($ultima->codigo, -6)) + 1 : 1;

            $solicitud->codigo = "CB-{$year}-".str_pad($numero, 6, '0', STR_PAD_LEFT);

            app(TicketService::class)->generar($solicitud);
        });
    }

    // ── Relaciones ──────────────────────────────────────────

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class);
    }

    public function motorista()
    {
        return $this->belongsTo(Motorista::class);
    }

    public function solicitudTransporte()
    {
        return $this->belongsTo(SolicitudTransporte::class);
    }

    public function solicitante()
    {
        return $this->belongsTo(User::class, 'solicitante_id');
    }

    public function aprobador()
    {
        return $this->belongsTo(User::class, 'aprobador_id');
    }

    public function contrato()
    {
        return $this->belongsTo(ContratoCombustible::class, 'contrato_id');
    }

    public function serieCarga()
    {
        return $this->belongsTo(SerieCarga::class, 'serie_vale_id');
    }

    public function asignador()
    {
        return $this->belongsTo(User::class, 'asignado_por');
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

    //Relacion con grupo de prioridades
    public function grupo()
    {
        return $this->belongsTo(Grupo::class, 'prioridad_grupo');
    }

    // ── Helpers ─────────────────────────────────────────────

    public function tieneComprobantes(): bool
    {
        return ! empty($this->comprobantes);
    }
}
