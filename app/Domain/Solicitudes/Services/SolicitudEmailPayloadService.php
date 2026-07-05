<?php

namespace App\Domain\Solicitudes\Services;

/**
 * Servicio encargado de construir el payload (estructura de datos) que se envía
 * a la plantilla de correo electrónico, según el tipo de solicitud y el evento.
 *
 * Cada método privado se especializa en un tipo de solicitud (transporte,
 * combustible, mantenimiento) y agrega los campos relevantes según el evento
 * (aprobada, rechazada, completada, liquidada, etc.).
 */
class SolicitudEmailPayloadService
{
    /**
     * Punto de entrada principal: construye el payload completo para un correo.
     *
     * @param  object  $record  Modelo de la solicitud (Transporte, Combustible o Mantenimiento)
     * @param  string  $tipo  Tipo de solicitud: 'transporte', 'combustible', 'mantenimiento'
     * @param  string  $evento  Evento ocurrido (ej. 'solicitud_aprobada', 'solicitud_rechazada')
     * @param  string|null  $mensaje  Mensaje personalizado; si es null se usa el mensaje por defecto
     * @return array Payload estructurado para la vista del correo
     */
    public function build($record, string $tipo, string $evento, ?string $mensaje = null): array
    {
        // Carga las relaciones necesarias según el tipo de solicitud
        $record->loadMissing($this->relationsFor($tipo));

        $payload = [
            'tipo' => $tipo,
            'evento' => $evento,
            'mensaje' => $mensaje ?? $this->defaultMessage($tipo, $evento),
            'solicitud' => $this->buildSolicitudData($record, $tipo, $evento),
            'solicitante' => [
                'name' => $record->solicitante?->name,
                'email' => $record->solicitante?->email,
                'unidadSolicitante' => [
                    'nombre' => $record->solicitante?->unidadSolicitante?->nombre ?? $record->unidad?->nombre ?? 'N/A',
                    'siglas' => $record->solicitante?->unidadSolicitante?->siglas ?? $record->unidad?->siglas ?? 'N/A',
                ],
            ],
            'timestamp' => now()->toIso8601String(),
        ];

        return $payload;
    }

    /**
     * Delega la construcción de los datos de la solicitud según el tipo.
     */
    private function buildSolicitudData($record, string $tipo, string $evento): array
    {
        $data = match ($tipo) {
            'transporte' => $this->buildTransporte($record, $evento),
            'combustible' => $this->buildCombustible($record, $evento),
            'mantenimiento' => $this->buildMantenimiento($record, $evento),
            default => ['codigo' => $record->codigo, 'estado' => $record->estado?->value ?? 'desconocido'],
        };
        $data['estado'] = match ($evento) {
            'solicitud_enviada' => 'enviada',
            'ruta_modificada' => 'ruta_modificada',
            default => $data['estado'],
        };

        return $data;
    }

    /**
     * Construye los datos específicos de una solicitud de transporte.
     *
     * Incluye origen, destino, fechas, vehículo, motorista y datos de geolocalización.
     * Según el evento, agrega campos adicionales (motivo de rechazo, vehículo asignado, etc.).
     */
    private function buildTransporte($r, string $evento): array
    {
        $destinosAdicionales = collect($r->destinosAdicionales ?? [])
            ->map(fn ($d) => [
                'nombre' => data_get($d, 'nombre'),
                'lat' => data_get($d, 'lat'),
                'lng' => data_get($d, 'lng'),
                'agregado_durante_viaje' => (bool) data_get($d, 'agregado_durante_viaje', false),
                'agregado_por_nombre' => data_get($d, 'agregadoPor.name') ?? data_get($d, 'agregadoPor.username'),
                'orden' => data_get($d, 'orden'),
            ])
            ->filter(fn ($d) => filled($d['nombre']))
            ->values();

        if ($destinosAdicionales->isEmpty() && filled($r->destino_adicional)) {
            $destinosAdicionales = collect(preg_split('/\s*(?:\|| - )\s*/', $r->destino_adicional))
                ->map(fn ($nombre) => trim((string) $nombre))
                ->filter(fn ($nombre) => $nombre !== '' && mb_strtolower($nombre) !== 'sin destino adicional')
                ->values()
                ->map(fn ($nombre, $i) => [
                    'nombre' => $nombre,
                    'lat' => $i === 0 ? $r->destino_adicional_lat : null,
                    'lng' => $i === 0 ? $r->destino_adicional_lng : null,
                    'agregado_durante_viaje' => false,
                    'agregado_por_nombre' => null,
                    'orden' => $i,
                ]);
        }

        $destinosSolicitados = $destinosAdicionales
            ->reject(fn ($d) => $d['agregado_durante_viaje'])
            ->values()
            ->map(fn ($d, $i) => $d + ['etiqueta' => 'Destino adicional '.($i + 1)])
            ->toArray();

        $destinosJefaturaBase = $destinosAdicionales
            ->filter(fn ($d) => $d['agregado_durante_viaje'])
            ->values();

        $destinosJefatura = $destinosJefaturaBase
            ->map(fn ($d, $i) => $d + [
                'etiqueta' => 'Destino nuevo asignado por jefatura'
                    .($destinosJefaturaBase->count() > 1 ? ' '.($i + 1) : ''),
            ])
            ->toArray();

        $data = [
            'id' => $r->id,
            'codigo' => $r->codigo,
            'estado' => $r->estado?->value ?? 'desconocido',
            'tipo_vehiculo_nombre' => $r->tipo_vehiculo_nombre ?? ($r->vehiculo?->tipo?->nombre ?? 'N/A'),
            'cantidad_personas' => $r->cantidad_personas,
            'origen' => $r->origen,
            'destino' => $r->destino,
            'destino_adicional' => $r->destino_adicional,
            'origen_lat' => $r->origen_lat,
            'origen_lng' => $r->origen_lng,
            'destino_lat' => $r->destino_lat,
            'destino_lng' => $r->destino_lng,
            'destino_adicional_lat' => $r->destino_adicional_lat,
            'destino_adicional_lng' => $r->destino_adicional_lng,
            'destinos_adicionales' => $destinosAdicionales->toArray(),
            'destinos_solicitados' => $destinosSolicitados,
            'destinos_jefatura' => $destinosJefatura,
            'fecha_salida' => $r->fecha_salida,
            'fecha_retorno' => $r->fecha_retorno,
            'motivo_actividad' => $r->motivo_actividad,
            'vehiculo_placa' => $r->vehiculo?->placa ?? 'N/A',
            'motorista_nombre' => $r->motorista?->nombre ?? 'N/A',
            'comentario_jefe' => $r->comentario_jefe,
        ];

        // Cuando se aprueba o programa, se incluyen explícitamente vehículo y motorista
        if (in_array($evento, ['solicitud_aprobada', 'solicitud_programada'], true)) {
            $data['vehiculo'] = $r->vehiculo?->placa ?? 'N/A';
            $data['motorista'] = $r->motorista?->nombre ?? 'N/A';
        }

        // Si fue rechazada y hay comentario del jefe, se usa como motivo de rechazo
        if ($evento === 'solicitud_rechazada' && $r->comentario_jefe) {
            $data['motivo_rechazo'] = $r->comentario_jefe;
        }

        // Cuando se asigna un motorista, se incluye su nombre
        if ($evento === 'motorista_asignado') {
            $data['motorista'] = $r->motorista?->nombre ?? 'N/A';
        }

        return $data;
    }

    /**
     * Construye los datos específicos de una solicitud de combustible.
     *
     * Incluye vehículo, motorista, cantidad de combustible, valor total,
     * forma de pago y datos del vale/ticket. Para eventos de liquidación
     * agrega monto validado y resultado.
     */
    private function buildCombustible($r, string $evento): array
    {
        $data = [
            'id' => $r->id,
            'codigo' => $r->codigo,
            'estado' => $r->estado?->value ?? 'desconocido',
            'vehiculo' => $r->vehiculo?->placa ?? 'N/A',
            'motorista' => $r->motorista?->nombre ?? 'N/A',
            'cantidad_combustible' => $r->cantidad_combustible,
            'valor_total' => $r->valor_total,
            'fecha_solicitud' => $r->fecha_solicitud,
            'destino_actividad' => $r->destino_actividad,
            'motivo_rechazo' => $r->motivo_rechazo,
        ];

        // Cuando se aprueba o asigna, se incluyen datos del contrato/serie/vale
        if (in_array($evento, ['solicitud_aprobada', 'solicitud_asignada'], true)) {
            $data['forma_pago'] = $r->forma_pago;
            $data['numero_vale_ticket'] = $r->numero_vale_ticket;
            $data['cantidad_vales'] = $r->cantidad_vales;
            $data['correlativo_inicio'] = $r->correlativo_inicio;
            $data['correlativo_fin'] = $r->correlativo_fin;
            $data['monto_asignado'] = $r->monto_asignado;
            $data['contrato'] = $r->contrato?->numero_contrato ?? 'N/A';
            $serie = $r->serieCarga ?? $r->serie ?? null;
            $data['serie'] = $serie?->nombre ?? 'N/A';
        }

        // Cuando se liquida, se agregan los datos de la liquidación
        if ($evento === 'solicitud_liquidada') {
            $liquidacion = $r->liquidacion;
            $data['monto_validado'] = $liquidacion?->monto_validado;
            $data['resultado'] = $liquidacion?->resultado;
        }

        return $data;
    }

    /**
     * Construye los datos específicos de una solicitud de mantenimiento.
     *
     * Incluye vehículo, tipo de mantenimiento, prioridad, detalle de la falla,
     * fechas sugeridas, costos y observaciones. Para liquidación agrega
     * monto validado y resultado.
     */
    private function buildMantenimiento($r, string $evento): array
    {
        $data = [
            'id' => $r->id,
            'codigo' => $r->codigo,
            'estado' => $r->estado?->value ?? 'desconocido',
            'vehiculo' => $r->vehiculo?->placa ?? 'N/A',
            'tipo_mantenimiento' => $r->tipoMantenimiento?->nombre ?? 'General',
            'prioridad' => $r->prioridad?->value ?? 'media',
            'detalle' => $r->detalle,
            'fecha_sugerida' => $r->fecha_sugerida,
            'costo_estimado' => $r->costo_estimado,
            'costo_real' => $r->costo_real,
            'observaciones' => $r->observaciones,
            'motivo_rechazo' => $r->motivo_rechazo,
        ];

        // Cuando se liquida, se agregan los datos de la liquidación
        if ($evento === 'solicitud_liquidada') {
            $liquidacion = $r->liquidacion;
            $data['monto_validado'] = $liquidacion?->monto_validado;
            $data['resultado'] = $liquidacion?->resultado;
        }

        return $data;
    }

    /**
     * Devuelve las relaciones de Eloquent que deben cargarse según el tipo.
     */
    private function relationsFor(string $tipo): array
    {
        return match ($tipo) {

            'transporte' => [
                'solicitante.unidadSolicitante',
                'vehiculo.tipo',
                'motorista',
                'unidad',
                'destinosAdicionales.agregadoPor',
            ],

            'combustible' => [
                'solicitante.unidadSolicitante',
                'vehiculo',
                'motorista',
                'contrato',
                'serieCarga',
                'liquidacion',
            ],

            'mantenimiento' => [
                'solicitante.unidadSolicitante',
                'vehiculo',
                'tipoMantenimiento',
                'liquidacion',
            ],

            default => ['solicitante'],
        };
    }

    /**
     * Genera un mensaje descriptivo por defecto según el tipo y el evento.
     */
    private function defaultMessage(string $tipo, string $evento): string
    {
        $labels = [
            'transporte' => 'Transporte',
            'combustible' => 'Combustible',
            'mantenimiento' => 'Mantenimiento',
        ];

        $label = $labels[$tipo] ?? 'Solicitud';

        return match ($evento) {
            'solicitud_enviada' => "Tu solicitud de {$label} ha sido ENVIADA y está pendiente de revisión.",
            'solicitud_aprobada' => "Tu solicitud de {$label} ha sido APROBADA.",
            'solicitud_rechazada' => "Tu solicitud de {$label} ha sido RECHAZADA.",
            'solicitud_completada' => "Tu solicitud de {$label} ha sido COMPLETADA.",
            'solicitud_cancelada' => "Tu solicitud de {$label} ha sido CANCELADA.",
            'solicitud_asignada' => "Tu solicitud de {$label} tiene recursos asignados.",
            'solicitud_liquidada' => "Tu solicitud de {$label} ha sido LIQUIDADA.",
            'solicitud_programada' => "Tu solicitud de {$label} ha sido PROGRAMADA.",
            'solicitud_pendiente_liquidacion' => "La solicitud de {$label} está en espera de revisión de liquidación.",
            'motorista_asignado' => 'Se te ha asignado un nuevo viaje.',
            'motorista_no_disponible' => 'Un motorista se ha reportado no disponible.',
            'ruta_modificada' => "La ruta de tu solicitud de {$label} ha sido modificada.",
            default => "Tu solicitud de {$label} ha sido actualizada.",
        };
    }

    public function motoristaNoDisponible($motorista, ?string $motivo = null, ?string $archivoPath = null): array
    {
        $payload = [
            'tipo' => 'motorista_estado',
            'evento' => 'motorista_no_disponible',
            'mensaje' => "El motorista {$motorista->nombre} se ha reportado no disponible.",
            'solicitud' => [
                'estado' => 'no_disponible',
                'motorista' => $motorista->nombre,
                'motivo' => $motivo,
            ],
            'timestamp' => now()->toIso8601String(),
        ];

        if ($motivo) {
            $payload['mensaje'] .= " Motivo: {$motivo}.";
        }

        if ($archivoPath) {
            $payload['evidencia'] = [
                'nombre' => basename(str_replace('\\', '/', $archivoPath)),
                'ruta' => $archivoPath,
                'url' => asset('storage/'.ltrim($archivoPath, '/')),
            ];
            $payload['attachments'] = [$archivoPath];
        }

        return $payload;
    }

    /**
     * Genera el asunto (subject) del correo según el tipo y el evento.
     *
     * @return string Asunto listo para usar en el Mailable
     */
    public function subjectFor(string $tipo, string $evento): string
    {
        $labels = [
            'transporte' => 'Transporte',
            'combustible' => 'Combustible',
            'mantenimiento' => 'Mantenimiento',
        ];

        $label = $labels[$tipo] ?? 'Solicitud';

        return match ($evento) {
            'solicitud_enviada' => "Solicitud de {$label} ENVIADA",
            'solicitud_aprobada' => "Solicitud de {$label} APROBADA",
            'solicitud_rechazada' => "Solicitud de {$label} RECHAZADA",
            'solicitud_completada' => "Solicitud de {$label} COMPLETADA",
            'solicitud_cancelada' => "Solicitud de {$label} CANCELADA",
            'solicitud_asignada' => "Solicitud de {$label} ASIGNADA",
            'solicitud_liquidada' => "Solicitud de {$label} LIQUIDADA",
            'solicitud_programada' => "Solicitud de {$label} PROGRAMADA",
            'solicitud_pendiente_liquidacion' => "Solicitud de {$label} pendiente de liquidación",
            'motorista_asignado' => 'Nuevo viaje asignado',
            'motorista_no_disponible' => 'Motorista no disponible',
            'ruta_modificada' => "Ruta modificada - {$label}",
            default => "Notificación de {$label}",
        };
    }
}
