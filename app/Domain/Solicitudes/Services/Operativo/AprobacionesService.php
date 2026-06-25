<?php

namespace App\Domain\Solicitudes\Services\Operativo;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Services\SolicitudEmailDispatchService;
use App\Models\BitacoraEvento;
use App\Models\HistorialEstado;
use App\Models\SolicitudCombustible;
use App\Models\SolicitudMantenimiento;
use App\Models\SolicitudTransporte;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class AprobacionesService
{
    public function obtenerSolicitudes(array $filters = []): Collection
    {
        $rows = collect()
            ->merge($this->mapTransporte($filters))
            ->merge($this->mapCombustible($filters))
            ->merge($this->mapMantenimiento($filters))
            ->sortBy('fecha_ingreso')
            ->values();

        if (! empty($filters['tipo'])) {
            $rows = $rows->where('tipo', $filters['tipo'])->values();
        }

        if (! empty($filters['prioridad'])) {
            $rows = $rows->where('prioridad', $filters['prioridad'])->values();
        }

        if (! empty($filters['prioridad_grupo'])) {
            $rows = $rows->where('prioridad_grupo', $filters['prioridad_grupo'])->values();
        }

        return $rows;
    }

    public function getKpis(array $filters = []): array
    {
        $rows = $this->obtenerSolicitudes($filters);

        return [
            'total' => $rows->count(),
            'transporte' => $rows->where('tipo', 'transporte')->count(),
            'combustible' => $rows->where('tipo', 'combustible')->count(),
            'mantenimiento' => $rows->where('tipo', 'mantenimiento')->count(),
        ];
    }

    public function aprobar(string $tipo, int $id, int $userId, string $comentario, ?string $firma = null): void
    {
        $record = $this->resolverModelo($tipo, $id);

        $relations = match ($tipo) {
            'transporte' => ['solicitante'],
            'mantenimiento' => ['solicitante', 'tipoMantenimiento', 'vehiculo'],
            'combustible' => ['solicitante', 'vehiculo'],
            default => ['solicitante'],
        };
        $record->load($relations);

        $estadoAnterior = $record->estado;
        $nuevoEstado = $this->resolverEstadoAprobado($tipo);

        $record->estado = $nuevoEstado;
        $this->guardarComentario($record, $comentario);
        $this->guardarAprobador($record, $userId);
        $this->guardarFirma($record, $firma);  // ← nuevo
        $record->save();

        $this->enviarCorreoAprobacion($record, $tipo);

        HistorialEstado::create([
            'entidad_tipo' => $this->resolverEntidadTipo($tipo),
            'entidad_id' => $record->id,
            'estado_anterior' => $this->enumValue($estadoAnterior),
            'estado_nuevo' => $this->enumValue($nuevoEstado),
            'user_id' => $userId,
            'comentario' => $comentario,
        ]);

        BitacoraEvento::create([
            'entidad_tipo' => $this->resolverEntidadTipo($tipo),
            'entidad_id' => $record->id,
            'accion' => 'APROBAR_FINAL',
            'user_id' => $userId,
            'datos_extras' => [
                'comentario' => $comentario,
                'estado_resultante' => $this->enumValue($nuevoEstado),
                'con_firma' => ! empty($firma),
            ],
        ]);
    }

    private function enviarCorreoAprobacion($record, string $tipo): void
    {
        try {
            app(SolicitudEmailDispatchService::class)->toSolicitante(
                $record, $tipo, 'solicitud_aprobada'
            );
        } catch (\Exception $e) {
            Log::error('Error enviando correo de aprobación: '.$e->getMessage());
        }
    }

    private function enviarCorreoRechazo($record, string $tipo, string $motivo): void
    {
        try {
            app(SolicitudEmailDispatchService::class)->toSolicitante(
                $record, $tipo, 'solicitud_rechazada'
            );
        } catch (\Exception $e) {
            Log::error('Error enviando correo de rechazo: '.$e->getMessage());
        }
    }

    public function rechazar(string $tipo, int $id, int $userId, string $comentario): void
    {
        $record = $this->resolverModelo($tipo, $id);

        $relations = match ($tipo) {
            'transporte' => ['solicitante'],
            'mantenimiento' => ['solicitante', 'tipoMantenimiento', 'vehiculo'],
            'combustible' => ['solicitante', 'vehiculo'],
            default => ['solicitante'],
        };
        $record->load($relations);

        $estadoAnterior = $record->estado;

        $record->estado = EstadoSolicitudEnum::RECHAZADA;
        $this->guardarComentario($record, $comentario);
        $this->guardarAprobador($record, $userId);
        $this->guardarMotivoRechazo($record, $comentario);
        $record->save();

        $this->enviarCorreoRechazo($record, $tipo, $comentario);

        HistorialEstado::create([
            'entidad_tipo' => $this->resolverEntidadTipo($tipo),
            'entidad_id' => $record->id,
            'estado_anterior' => $this->enumValue($estadoAnterior),
            'estado_nuevo' => EstadoSolicitudEnum::RECHAZADA->value,
            'user_id' => $userId,
            'comentario' => $comentario,
        ]);

        BitacoraEvento::create([
            'entidad_tipo' => $this->resolverEntidadTipo($tipo),
            'entidad_id' => $record->id,
            'accion' => 'RECHAZAR_FINAL',
            'user_id' => $userId,
            'datos_extras' => [
                'comentario' => $comentario,
            ],
        ]);
    }

    public function condicionar(string $tipo, int $id, int $userId, string $comentario): void
    {
        $record = $this->resolverModelo($tipo, $id);
        $estadoAnterior = $record->estado;

        $record->estado = EstadoSolicitudEnum::EN_REVISION;
        $this->guardarComentario($record, $comentario);
        $record->save();

        HistorialEstado::create([
            'entidad_tipo' => $this->resolverEntidadTipo($tipo),
            'entidad_id' => $record->id,
            'estado_anterior' => $this->enumValue($estadoAnterior),
            'estado_nuevo' => EstadoSolicitudEnum::EN_REVISION->value,
            'user_id' => $userId,
            'comentario' => $comentario,
        ]);

        BitacoraEvento::create([
            'entidad_tipo' => $this->resolverEntidadTipo($tipo),
            'entidad_id' => $record->id,
            'accion' => 'CONDICIONAR',
            'user_id' => $userId,
            'datos_extras' => [
                'comentario' => $comentario,
            ],
        ]);
    }

    public function reabrir(string $tipo, int $id, int $userId, string $comentario): void
    {
        $record = $this->resolverModelo($tipo, $id);
        $estadoAnterior = $record->estado;

        $record->estado = EstadoSolicitudEnum::PENDIENTE;
        if (array_key_exists('decision_final', $record->getAttributes())) {
            $record->decision_final = null;
        }
        if (array_key_exists('vehiculo_id', $record->getAttributes())) {
            $record->vehiculo_id = null;
        }
        if (array_key_exists('motorista_id', $record->getAttributes())) {
            $record->motorista_id = null;
        }
        $this->guardarComentario($record, $comentario);
        $record->save();

        HistorialEstado::create([
            'entidad_tipo' => $this->resolverEntidadTipo($tipo),
            'entidad_id' => $record->id,
            'estado_anterior' => $this->enumValue($estadoAnterior),
            'estado_nuevo' => EstadoSolicitudEnum::PENDIENTE->value,
            'user_id' => $userId,
            'comentario' => $comentario,
        ]);

        BitacoraEvento::create([
            'entidad_tipo' => $this->resolverEntidadTipo($tipo),
            'entidad_id' => $record->id,
            'accion' => 'REABRIR',
            'user_id' => $userId,
            'datos_extras' => [
                'comentario' => $comentario,
            ],
        ]);
    }

    private function mapTransporte(array $filters = []): Collection
    {
        $query = SolicitudTransporte::query()
            ->with([
                'solicitante.grupo',
                'solicitante.unidadSolicitante',
                'unidad',
                'sugerencia.vehiculoSugerido',
                'sugerencia.motoristaSugerido',
                'decisionOperativa.vehiculoFinal',
                'decisionOperativa.motoristaFinal',
            ])
            ->whereIn('estado', [
                EstadoSolicitudEnum::PRE_APROBADA,
                EstadoSolicitudEnum::ASIGNADA,
                EstadoSolicitudEnum::EN_EJECUCION,
            ]);

        if (! empty($filters['date_from'])) {
            $query->where('updated_at', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->where('updated_at', '<=', $filters['date_to']);
        }

        return $query->get()->map(function (SolicitudTransporte $r) {
            $sugerencia = $r->sugerencia;
            $decision = $r->decisionOperativa;

            return [
                'id' => $r->id,
                'tipo' => 'transporte',
                'codigo' => $r->codigo,
                'fecha_ingreso' => optional($r->updated_at)?->format('Y-m-d H:i:s'),
                'solicitante' => $r->solicitante?->name ?? '—',
                'unidad' => $r->unidad?->nombre ?? $r->solicitante?->unidadSolicitante?->nombre ?? '—',
                'tipo_vehiculo_nombre' => $r->tipo_vehiculo_nombre,
                'detalle' => $r->motivo_actividad ?? 'Solicitud de transporte',
                'prioridad' => $this->enumValue($r->prioridad),
                'prioridad_grupo' => $r->prioridad_grupo?->value ?? $r->solicitante?->grupo?->nivel_prioridad,
                'grupo_nombre' => $r->solicitante?->grupo?->nombre,
                'estado' => $this->enumValue($r->estado),
                'asignado' => $r->motorista?->nombre ?? $r->vehiculo?->placa ?? null,
                'fecha_salida' => $r->fecha_salida?->format('d/m/Y H:i'),
                'fecha_retorno' => $r->fecha_retorno?->format('d/m/Y H:i'),
                'horas_estimadas' => $r->horas_estimadas,
                'horas_reales' => $r->horas_reales,
                'decision_final' => $r->decision_final,
                'sugerencia' => $sugerencia ? [
                    'vehiculo' => $sugerencia->vehiculoSugerido?->placa ?? '—',
                    'motorista' => $sugerencia->motoristaSugerido?->nombre ?? '—',
                    'score_confianza' => $sugerencia->score_confianza,
                    'combustible_porcentaje' => $sugerencia->combustible_porcentaje,
                    'horas_motorista_periodo' => $sugerencia->horas_motorista_periodo,
                    'bullets_tecnicos' => $sugerencia->bullets_tecnicos,
                ] : null,
                'decision_operativa' => $decision ? [
                    'vehiculo' => $decision->vehiculoFinal?->placa ?? '—',
                    'motorista' => $decision->motoristaFinal?->nombre ?? '—',
                    'cambio_detectado' => $decision->cambio_detectado,
                    'justificacion' => $decision->justificacion,
                ] : null,
            ];
        });
    }

    private function mapCombustible(array $filters = []): Collection
    {
        $query = SolicitudCombustible::query()
            ->with(['solicitante.grupo', 'solicitante.unidadSolicitante', 'decisionOperativa.usuarioOperativo'])
            ->where('estado', EstadoSolicitudEnum::PRE_APROBADA);

        if (! empty($filters['date_from'])) {
            $query->where('updated_at', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->where('updated_at', '<=', $filters['date_to']);
        }

        return $query->get()->map(function (SolicitudCombustible $r) {
            $decision = $r->decisionOperativa;

            return [
                'id' => $r->id,
                'tipo' => 'combustible',
                'codigo' => $r->codigo,
                'fecha_ingreso' => optional($r->updated_at)?->format('Y-m-d H:i:s'),
                'solicitante' => $r->solicitante?->name ?? '—',
                'unidad' => $r->solicitante?->unidadSolicitante?->nombre ?? '—',
                'detalle' => $r->destino_actividad ?? 'Solicitud de combustible',
                'prioridad' => $this->enumValue($r->prioridad),
                'prioridad_grupo' => $r->prioridad_grupo?->value ?? $r->solicitante?->grupo?->nivel_prioridad,
                'grupo_nombre' => $r->solicitante?->grupo?->nombre,
                'estado' => $this->enumValue($r->estado),
                'decision_operativa' => $decision ? [
                    'monto_aprobado' => $decision->monto_aprobado,
                    'operativo' => $decision->usuarioOperativo?->name ?? '—',
                    'justificacion' => $decision->justificacion,
                ] : null,
            ];
        });
    }

    private function mapMantenimiento(array $filters = []): Collection
    {
        $query = SolicitudMantenimiento::query()
            ->with(['solicitante.unidadSolicitante', 'tipoMantenimiento'])
            ->where('estado', EstadoSolicitudEnum::PRE_APROBADA);

        if (! empty($filters['date_from'])) {
            $query->where('updated_at', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->where('updated_at', '<=', $filters['date_to']);
        }

        return $query->get()->map(function (SolicitudMantenimiento $r) {
            return [
                'id' => $r->id,
                'tipo' => 'mantenimiento',
                'codigo' => $r->codigo,
                'fecha_ingreso' => optional($r->updated_at)?->format('Y-m-d H:i:s'),
                'solicitante' => $r->solicitante?->name ?? '—',
                'unidad' => $r->solicitante?->unidadSolicitante?->nombre ?? '—',
                'detalle' => $r->tipoMantenimiento?->nombre
                    ? $r->tipoMantenimiento->nombre.' - '.$r->detalle
                    : $r->detalle,
                'prioridad' => $this->enumValue($r->prioridad),
                'estado' => $this->enumValue($r->estado),
            ];
        });
    }

    private function resolverModelo(string $tipo, int $id)
    {
        return match ($tipo) {
            'transporte' => SolicitudTransporte::findOrFail($id),
            'combustible' => SolicitudCombustible::findOrFail($id),
            'mantenimiento' => SolicitudMantenimiento::findOrFail($id),
            default => throw new \InvalidArgumentException('Tipo no válido.'),
        };
    }

    private function resolverEntidadTipo(string $tipo): string
    {
        return match ($tipo) {
            'transporte' => 'solicitud_transporte',
            'combustible' => 'solicitud_combustible',
            'mantenimiento' => 'solicitud_mantenimiento',
            default => 'solicitud',
        };
    }

    private function resolverEstadoAprobado(string $tipo)
    {
        return match ($tipo) {
            'transporte' => EstadoSolicitudEnum::APROBADA,
            'combustible' => EstadoSolicitudEnum::APROBADA,
            'mantenimiento' => EstadoSolicitudEnum::APROBADA,
            default => EstadoSolicitudEnum::APROBADA,
        };
    }

    private function guardarComentario($record, string $comentario): void
    {
        if (array_key_exists('comentario_jefe', $record->getAttributes())) {
            $record->comentario_jefe = $comentario;
        }

        if (array_key_exists('observaciones', $record->getAttributes())) {
            $record->observaciones = $comentario;
        }
    }

    private function guardarAprobador($record, int $userId): void
    {
        if (array_key_exists('decidido_por', $record->getAttributes())) {
            $record->decidido_por = $userId;
        }

        if (array_key_exists('decidido_en', $record->getAttributes())) {
            $record->decidido_en = now();
        }

        if (array_key_exists('aprobador_id', $record->getAttributes())) {
            $record->aprobador_id = $userId;
        }

        if (array_key_exists('fecha_aprobacion', $record->getAttributes())) {
            $record->fecha_aprobacion = now();
        }
    }

    private function guardarMotivoRechazo($record, string $comentario): void
    {
        if (array_key_exists('motivo_rechazo', $record->getAttributes())) {
            $record->motivo_rechazo = $comentario;
        }
    }

    // Metodo nuevo para la firma
    private function guardarFirma($record, ?string $firma): void
    {
        if (empty($firma)) {
            return;
        }

        if (in_array('firma_aprobador', $record->getFillable())) {
            $record->firma_aprobador = $firma;
        }
    }

    private function enumValue($value): string
    {
        return $value instanceof \UnitEnum ? $value->value : (string) $value;
    }
}
