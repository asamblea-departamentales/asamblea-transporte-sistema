<?php

namespace App\Models;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Vehiculo extends Model
{
    use SoftDeletes;

    protected $table = 'vehiculos';

    protected $fillable = [
        // Campos 0riginales
        'placa',
        'tipo_vehiculo_id',
        'marca',
        'modelo',
        'anio',
        'capacidad_personas',
        'estado',
        'activo',
        'accesorios',

        // Nuevos catálogos
        'veh_marca_id',
        'veh_modelo_id',
        'veh_color_id',
        'veh_tipo_motor_id',
        'veh_transmision_id',
        'veh_traccion_id',
        'veh_tipo_llanta_id',
        'veh_tipo_combustible_id',
        'veh_clasificacion_id',
        'veh_estado_catalogo_id',

        // Campos técnicos
        'num_llantas',
        'chasis',
        'vin',
        'motor_numero',
        'vencimiento_tarjeta',
        'activo_fijo',
        'fotografia',
        'observacion',
        'departamental_id',
    ];

    protected $casts = [
        'anio' => 'integer',
        'capacidad_personas' => 'integer',
        'num_llantas' => 'integer',
        'activo' => 'boolean',
        'vencimiento_tarjeta' => 'date',
        'accesorios' => 'array',
    ];

    protected $appends = ['fotografia_url'];

    // Accesor para la fotografía
    public function getFotografiaUrlAttribute(): ?string
    {
        if (! $this->fotografia) {
            return null;
        }

        return Storage::disk('public')->url($this->fotografia);
    }

    // NUEVOS: Scopes y Accesors para estados operativos
    public function getEstadoOperativoAttribute(): string
    {
        $tieneViajeActivo = SolicitudTransporte::where('vehiculo_id', $this->id)
            ->whereIn('estado', [
                EstadoSolicitudEnum::EN_EJECUCION,
                EstadoSolicitudEnum::PROGRAMADA,
                EstadoSolicitudEnum::APROBADA,
                EstadoSolicitudEnum::ASIGNADA,
            ])
            ->exists();

        if (! $tieneViajeActivo) {
            return 'disponible';
        }

        $enEjecucion = SolicitudTransporte::where('vehiculo_id', $this->id)
            ->where('estado', EstadoSolicitudEnum::EN_EJECUCION)
            ->exists();

        return $enEjecucion ? 'en_ruta' : 'reservado';
    }

    public function getEstaDisponibleAttribute(): bool
    {
        return $this->estado_operativo === 'disponible';
    }

    // Filtra vehiculos sin viajes activos (en ejecución, programada, aprobada o asignada)
    public function scopeDisponibles(Builder $query): Builder
    {
        $idsOcupados = SolicitudTransporte::whereIn('estado', [
            EstadoSolicitudEnum::EN_EJECUCION,
            EstadoSolicitudEnum::PROGRAMADA,
            EstadoSolicitudEnum::APROBADA,
            EstadoSolicitudEnum::ASIGNADA,
        ])
            ->whereNotNull('vehiculo_id')
            ->pluck('vehiculo_id')
            ->unique();

        return $query->whereNotIn('id', $idsOcupados);
    }

    // Filtra vehiculos con al menos un viaje activo (en ejecución, programada, aprobada o asignada)
    public function scopeNoDisponibles(Builder $query): Builder
    {
        $idsOcupados = SolicitudTransporte::whereIn('estado', [
            EstadoSolicitudEnum::EN_EJECUCION,
            EstadoSolicitudEnum::PROGRAMADA,
            EstadoSolicitudEnum::APROBADA,
            EstadoSolicitudEnum::ASIGNADA,
        ])
            ->whereNotNull('vehiculo_id')
            ->pluck('vehiculo_id')
            ->unique();

        return $query->whereIn('id', $idsOcupados);
    }

    // ──────────────────────────────────────────────
    // Reserva de combustible
    // ──────────────────────────────────────────────
    // Indica si el vehículo tiene una reserva activa de combustible,
    // es decir, en su última recepción el operativo marcó "tiene_reserva"
    // y aún no se ha registrado una entrega posterior que la consuma.
    public function getTieneReservaActivaAttribute(): bool
    {
        $ultimaRecepcionConReserva = RecepcionEntregaVehiculo::where('vehiculo_id', $this->id)
            ->where('tipo_movimiento', 'recepcion')
            ->where('tiene_reserva', true)
            ->latest('fecha_hora')
            ->first();

        if (! $ultimaRecepcionConReserva) {
            return false;
        }

        // La reserva se considera consumida si hay una entrega posterior
        // a la recepción que la originó.
        $entregaPosterior = RecepcionEntregaVehiculo::where('vehiculo_id', $this->id)
            ->where('tipo_movimiento', 'entrega')
            ->where('fecha_hora', '>', $ultimaRecepcionConReserva->fecha_hora)
            ->exists();

        return ! $entregaPosterior;
    }

    // Relaciones con otras tablas/modelos

    public function tipo(): BelongsTo
    {
        return $this->belongsTo(TipoVehiculo::class, 'tipo_vehiculo_id');
    }

    public function asignacionesMotorista(): HasMany
    {
        return $this->hasMany(AsignacionVehiculoMotorista::class, 'vehiculo_id');
    }

    public function asignacionVigenteMotorista(): HasOne
    {
        return $this->hasOne(AsignacionVehiculoMotorista::class, 'vehiculo_id')
            ->where('vigente', true)
            ->whereNull('hasta')
            ->latest('desde');
    }

    // Nuevas relaciones para los catálogos

    public function vehMarca(): BelongsTo
    {
        return $this->belongsTo(VehMarca::class, 'veh_marca_id');
    }

    public function vehModelo(): BelongsTo
    {
        return $this->belongsTo(VehModelo::class, 'veh_modelo_id');
    }

    public function color(): BelongsTo
    {
        return $this->belongsTo(VehColor::class, 'veh_color_id');
    }

    public function tipoMotor(): BelongsTo
    {
        return $this->belongsTo(VehTipoMotor::class, 'veh_tipo_motor_id');
    }

    public function transmision(): BelongsTo
    {
        return $this->belongsTo(VehTransmision::class, 'veh_transmision_id');
    }

    public function traccion(): BelongsTo
    {
        return $this->belongsTo(VehTraccion::class, 'veh_traccion_id');
    }

    public function tipoLlanta(): BelongsTo
    {
        return $this->belongsTo(VehTipoLlanta::class, 'veh_tipo_llanta_id');
    }

    public function tipoCombustible(): BelongsTo
    {
        return $this->belongsTo(VehTipoCombustible::class, 'veh_tipo_combustible_id');
    }

    public function clasificacion(): BelongsTo
    {
        return $this->belongsTo(VehClasificacion::class, 'veh_clasificacion_id');
    }

    public function estadoCatalogo(): BelongsTo
    {
        return $this->belongsTo(VehEstadoCatalogo::class, 'veh_estado_catalogo_id');
    }

    public function departamental(): BelongsTo
    {
        return $this->belongsTo(Departamental::class, 'departamental_id');
    }

    public function ultimaRecepcionEntrega(): HasOne
    {
        return $this->hasOne(RecepcionEntregaVehiculo::class)
            ->latest('fecha_hora');
    }
}
