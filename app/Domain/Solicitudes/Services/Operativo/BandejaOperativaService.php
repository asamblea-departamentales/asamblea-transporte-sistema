<?php

namespace App\Domain\Solicitudes\Services\Operativo;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\BitacoraEvento;
use App\Models\HistorialEstado;
use App\Models\SolicitudCombustible;
use App\Models\SolicitudMantenimiento;
use App\Models\SolicitudTransporte;
use Illuminate\Support\Collection;

class BandejaOperativaService
{
    use OperativoTrait;

    public function tomarParaRevision(string $tipo, int $id, int $userId, ?string $comentario = null): void
    {
        $record = $this->resolverModelo($tipo, $id);

        $estadoAnterior = $record->estado;

        $record->estado = EstadoSolicitudEnum::EN_REVISION;

        if (property_exists($record, 'comentario_jefe') || array_key_exists('comentario_jefe', $record->getAttributes())) {
            $record->comentario_jefe = $comentario;
        }

        if (property_exists($record, 'observaciones') || array_key_exists('observaciones', $record->getAttributes())) {
            $record->observaciones = $comentario;
        }

        $record->save();

        HistorialEstado::create([
            'entidad_tipo' => $this->resolverEntidadTipo($tipo),
            'entidad_id' => $record->id,
            'estado_anterior' => $this->enumValue($estadoAnterior),
            'estado_nuevo' => EstadoSolicitudEnum::EN_REVISION->value,
            'user_id' => $userId,
            'comentario' => $comentario ?: 'Solicitud tomada para revisión operativa.',
        ]);

        BitacoraEvento::create([
            'entidad_tipo' => $this->resolverEntidadTipo($tipo),
            'entidad_id' => $record->id,
            'accion' => 'TOMAR_REVISION',
            'user_id' => $userId,
            'datos_extras' => [
                'comentario' => $comentario,
            ],
        ]);
    }

    public function actualizarPrioridad(string $tipo, int $id, string $prioridad, int $userId): void
    {
        $record = $this->resolverModelo($tipo, $id);
        $record->prioridad = $prioridad;
        $record->save();

        BitacoraEvento::create([
            'entidad_tipo' => $this->resolverEntidadTipo($tipo),
            'entidad_id' => $record->id,
            'accion' => 'CAMBIAR_PRIORIDAD',
            'user_id' => $userId,
            'datos_extras' => [
                'prioridad' => $prioridad,
            ],
        ]);
    }

    private function mapTransporte(array $filters = []): Collection
    {
        $query = SolicitudTransporte::query()
            ->with(['solicitante.grupo', 'solicitante.unidadSolicitante', 'unidad'])
            ->whereIn('estado', [
                EstadoSolicitudEnum::PENDIENTE,
                EstadoSolicitudEnum::EN_REVISION,
            ]);

        if (! empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        return $query->get()->map(function (SolicitudTransporte $r) {
            return [
                'id' => $r->id,
                'tipo' => 'transporte',
                'codigo' => $r->codigo,
                'fecha_ingreso' => optional($r->created_at)?->format('Y-m-d H:i:s'),
                'solicitante' => $r->solicitante?->name ?? '—',
                'unidad' => $r->unidad?->nombre ?? $r->solicitante?->unidadSolicitante?->nombre ?? '—',
                'tipo_vehiculo_nombre' => $r->tipo_vehiculo_nombre,
                'fecha_solicitud' => optional($r->fecha_solicitud)?->format('Y-m-d'),
                'detalle' => $r->motivo_actividad ?? 'Solicitud de transporte',
                'prioridad' => $this->enumValue($r->prioridad),
                'prioridad_grupo' => $r->prioridad_grupo?->value ?? $r->solicitante?->grupo?->nivel_prioridad,
                'grupo_nombre' => $r->solicitante?->grupo?->nombre,
                'estado' => $this->enumValue($r->estado),
            ];
        });
    }

    private function mapCombustible(array $filters = []): Collection
    {
        $query = SolicitudCombustible::query()
            ->with(['solicitante.grupo', 'solicitante.unidadSolicitante', 'vehiculo'])
            ->whereIn('estado', [
                EstadoSolicitudEnum::PENDIENTE,
                EstadoSolicitudEnum::EN_REVISION,
            ]);

        if (! empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        return $query->get()->map(function (SolicitudCombustible $r) {
            return [
                'id' => $r->id,
                'tipo' => 'combustible',
                'codigo' => $r->codigo,
                'fecha_ingreso' => optional($r->created_at)?->format('Y-m-d H:i:s'),
                'solicitante' => $r->solicitante?->name ?? '—',
                'unidad' => $r->solicitante?->unidadSolicitante?->nombre ?? '—',
                'detalle' => $r->destino_actividad ?? 'Solicitud de combustible',
                'prioridad' => $this->enumValue($r->prioridad),
                'prioridad_grupo' => $r->prioridad_grupo?->value ?? $r->solicitante?->grupo?->nivel_prioridad,
                'grupo_nombre' => $r->solicitante?->grupo?->nombre,
                'estado' => $this->enumValue($r->estado),
                'monto_solicitado' => (float) ($r->cantidad_combustible ?? 0),
                'vehiculo_id' => $r->vehiculo_id,
                'vehiculo_placa' => $r->vehiculo?->placa,
                'vales_solicitados' => (float) ($r->cantidad_combustible ?? 0),
                'fecha_solicitud' => optional($r->fecha_solicitud)?->format('Y-m-d'),
            ];
        });
    }

    private function mapMantenimiento(array $filters = []): Collection
    {
        $query = SolicitudMantenimiento::query()
            ->with(['solicitante.unidadSolicitante', 'tipoMantenimiento'])
            ->whereIn('estado', [
                EstadoSolicitudEnum::PENDIENTE,
                EstadoSolicitudEnum::EN_REVISION,
            ]);

        if (! empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        return $query->get()->map(function (SolicitudMantenimiento $r) {
            return [
                'id' => $r->id,
                'tipo' => 'mantenimiento',
                'codigo' => $r->codigo,
                'fecha_ingreso' => optional($r->created_at)?->format('Y-m-d H:i:s'),
                'solicitante' => $r->solicitante?->name ?? '—',
                'unidad' => $r->solicitante?->unidadSolicitante?->nombre ?? '—',
                'detalle' => $r->tipoMantenimiento?->nombre
                    ? $r->tipoMantenimiento->nombre.' - '.$r->detalle
                    : $r->detalle,
                'tipo_mantenimiento_nombre' => $r->tipoMantenimiento?->nombre ?? null,
                'prioridad' => $this->enumValue($r->prioridad),
                'estado' => $this->enumValue($r->estado),
                'fecha_solicitud' => optional($r->fecha_solicitud)?->format('Y-m-d'),
            ];
        });
    }
}
