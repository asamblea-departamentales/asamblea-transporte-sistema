<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

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
        'herramientas_verificadas',
        'entregado_por',
        'recibido_por',
        'observaciones',
        'adjuntos',
        'solicitud_transporte_id',
    ];

    protected $casts = [
        'fecha_hora' => 'datetime',
        'nivel_combustible' => 'integer',
        'herramientas_verificadas' => 'array',
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
        return ! empty($this->adjuntos);
    }

    public function solicitud(): BelongsTo
    {
        return $this->belongsTo(SolicitudTransporte::class, 'solicitud_transporte_id');
    }

    public static function opcionesHerramientas(): array
    {
        return [
            'llavero' => 'Llavero con llaves',
            'gato' => 'Gato Hidráulico',
            'bateria' => 'Batería',
            'espejos retrovisores' => 'Espejos Retrovisores',
            'espejo interior' => 'Espejo Interior',
            'escobillas' => 'Escobillas Limpiaparabrisas',
            'copas de rueda' => 'Copas de Rueda',
            'cubos de seguridad' => 'Cubos de Seguridad',
            'emblemas' => 'Emblemas',
            'polarizado' => 'Polarizado',
            'loderas' => 'Loderas',
            'llanta_repuesto' => 'Llanta de Repuesto',
            'micas' => 'Micas',
            'herramientas' => 'Kit de Herramientas',
            'llave de ruedas' => 'Llave de Ruedas',
            'triangulos o conos' => 'Triángulos/Conos (2)',
            'extintor' => 'Extintor Vigente',
            'sobre_alfombra' => 'Sobre Alfombra',
            'encendedor' => 'Encendedor',
            'antena' => 'Antena',
            'radio cd_casette_DVD' => 'Radio CD/Cassette/DVD',
            'reloj_funcional' => 'Reloj Funcional',
            'A/C funcional' => 'A/C Funcional',
            'alarma_funcional' => 'Alarma Funcional',
            'Estado de asientos' => 'Estado de Asientos Correcto',
            'cables_paso_corriente' => 'Cables de Paso de Corriente',
            'asientos_forrados' => 'Asientos Forrados',
            'pilotos_tablero' => 'Pilotos del Tablero Funcionales',
            'tarjeta_circulacion' => 'Tarjeta de Circulación',
            'tarjeta_seguro' => 'Tarjeta de Seguro',
        ];
    }

    public function getHerramientasFaltantesAttribute(): array
    {
        $verificadas = $this->herramientas_verificadas ?? [];

        return array_diff(array_keys(static::opcionesHerramientas()), $verificadas);
    }

    public function getNivelCombustibleLabelAttribute(): string
    {
        if ($this->nivel_combustible === null) {
            return '—';
        }

        return \App\Domain\Solicitudes\Enums\NivelCombustibleEnum::fromInt($this->nivel_combustible)->label();
    }
}
