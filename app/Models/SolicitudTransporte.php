<?php

namespace App\Models;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Domain\Solicitudes\Services\TicketService;
use App\Domain\Solicitudes\Enums\NivelPrioridadEnum;
use Illuminate\Database\Eloquent\Relations\HasOne;

class SolicitudTransporte extends Model
{
    use SoftDeletes;

    protected $table = 'solicitud_transportes';

    protected $fillable = [
        'codigo',
        'unidad_solicitante_id',
        'solicitante_id',
        'motivo_actividad',
        'origen',
        'destino',
        'fecha_salida',
        'fecha_retorno',
        'cantidad_personas',
        'prioridad',
        'prioridad_grupo',
        'estado',
        'motivo_cancelacion',
        'decidido_por',
        'decidido_en',
        'comentario_jefe',
        'firma_aprobador',       // ← nuevo
        'destino_adicional',
        'vehiculo_id',
        'motorista_id',
        'tipo_vehiculo_id',
        'tipo_vehiculo_nombre',
        'fecha_salida_real',
        'fecha_retorno_real',
        'despachado_por',
        'confirmado_por',
        'confirmado_en',
        //NUEVOS CAMPOS PARA HORAS MANEJADAS DE MOTORISTAS
        'decision_final',
        'horas_estimadas',
        'horas_reales',
        'horas_espera',
        'fecha_llegada_destino',
        'fecha_inicio_retorno',

        // --- CAMPOS DE GEOLOCALIZACIÓN PARA EL MAPA ---
        'origen_lat',
        'origen_lng',
        'destino_lat',
        'destino_lng',
        'destino_adicional_lat',
        'destino_adicional_lng',
    ];

    protected $casts = [
        'prioridad' => PrioridadSolicitudEnum::class,
        'prioridad_grupo' => NivelPrioridadEnum::class,
        'estado' => EstadoSolicitudEnum::class,
        'fecha_salida' => 'datetime',
        'fecha_retorno' => 'datetime',
        'decidido_en' => 'datetime',
        'fecha_salida_real' => 'datetime',
        'fecha_retorno_real' => 'datetime',
        'confirmado_en' => 'datetime', // Nuevo
        'horas_estimadas' => 'decimal:2',
        'horas_reales' => 'decimal:2',
        'horas_espera' => 'decimal:2',
        'fecha_llegada_destino' => 'datetime',
        'fecha_inicio_retorno' => 'datetime',
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
            $userId = $solicitud->solicitante_id ?? auth()->id();

            $ultima = static::where('solicitante_id', $userId)
                ->where('codigo', 'like', "TR-{$year}-%")
                ->latest('id')
                ->first();

            $numero = $ultima ? ((int) substr($ultima->codigo, -6)) + 1 : 1;

            $solicitud->codigo = "TR-{$year}-".str_pad($numero, 6, '0', STR_PAD_LEFT);

            app(TicketService::class)->generar($solicitud);
        });
    }

    // Este método hará la magia al mostrar el dato
    public function getDestinoAdicionalAttribute($value)
    {
        return $value ?? 'Sin destino adicional';
    }

    // Relaciones
    public function unidad()
    {
        return $this->belongsTo(UnidadSolicitante::class, 'unidad_solicitante_id');
    }

    public function solicitante()
    {
        return $this->belongsTo(User::class, 'solicitante_id');
    }

    public function autorizador()
    {
        return $this->belongsTo(User::class, 'decidido_por');
    }

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class, 'vehiculo_id');
    }

    public function motorista()
    {
        return $this->belongsTo(Motorista::class, 'motorista_id');
    }

    // Para los estados
    public function historiales()
    {
        return $this->hasMany(HistorialEstado::class, 'entidad_id')
            ->where('entidad_tipo', 'solicitud_transporte')
            ->latest();
    }

    // Para tipo de vehículo
    public function tipoVehiculo()
    {
        return $this->belongsTo(TipoVehiculo::class, 'tipo_vehiculo_id');
    }

    public function despachador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'despachado_por');
    }

    public function confirmador()
    {
        return $this->belongsTo(User::class, 'confirmado_por');
    }

    public function solicitudCombustible()
    {
        return $this->hasOne(SolicitudCombustible::class, 'solicitud_transporte_id');
    }

    // Relacion con incidencias
    public function incidencias()
    {
        return $this->morphMany(Incidencia::class, 'entidad', 'entidad_tipo', 'entidad_id');
    }

    //Relacion con Grupo de prioridades
    public function grupo()
    {
        return $this->belongsTo(Grupo::class, 'prioridad_grupo');
    }

    public function sugerencia(): HasOne
    {
        return $this->hasOne(SugerenciaAsignacion::class, 'solicitud_id');
    }

    public function decisionOperativa(): HasOne
    {
        return $this->hasOne(DecisionOperativa::class, 'solicitud_id');
    }
}
