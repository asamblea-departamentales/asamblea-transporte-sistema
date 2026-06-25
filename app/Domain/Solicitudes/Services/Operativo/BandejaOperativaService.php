<?php

namespace App\Domain\Solicitudes\Services\Operativo;

use App\Models\SolicitudCombustible;
use App\Models\SolicitudMantenimiento;
use App\Models\SolicitudTransporte;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\BitacoraEvento;
use App\Models\HistorialEstado;
use Illuminate\Support\Collection;


class BandejaOperativaService
{
    public function obtenerSolicitudes(array $filters = []): Collection
    {
        $rows = collect()
            ->merge($this->mapTransporte($filters))
            ->merge($this->mapCombustible($filters))
            ->merge($this->mapMantenimiento($filters))
            ->sortBy('fecha_ingreso')
            ->values();

        if (!empty($filters['tipo'])) {
            $rows = $rows->where('tipo', $filters['tipo'])->values();
        }

        if (!empty($filters['prioridad'])) {
            $rows = $rows->where('prioridad', $filters['prioridad'])->values();
        }

        if (!empty($filters['prioridad_grupo'])) {
            $rows = $rows->where('prioridad_grupo', $filters['prioridad_grupo'])->values();
        }

        if (!empty($filters['estado'])) {
            $rows = $rows->where('estado', $filters['estado'])->values();
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

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
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
            ->with(['solicitante.grupo'])
            ->whereIn('estado', [
                EstadoSolicitudEnum::PENDIENTE,
                EstadoSolicitudEnum::EN_REVISION,
            ]);

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        return $query->get()->map(function (SolicitudCombustible $r) {
            return [
                'id' => $r->id,
                'tipo' => 'combustible',
                'codigo' => $r->codigo,
                'fecha_ingreso' => optional($r->created_at)?->format('Y-m-d H:i:s'),
                'solicitante' => $r->solicitante?->name ?? '—',
                'unidad' => '—',
                'detalle' => $r->destino_actividad ?? 'Solicitud de combustible',
                'prioridad' => $this->enumValue($r->prioridad),
                'prioridad_grupo' => $r->prioridad_grupo?->value ?? $r->solicitante?->grupo?->nivel_prioridad,
                'grupo_nombre' => $r->solicitante?->grupo?->nombre,
                'estado' => $this->enumValue($r->estado),
            ];
        });
    }

    private function mapMantenimiento(array $filters = []): Collection
    {
        $query = SolicitudMantenimiento::query()
            ->with(['solicitante', 'tipoMantenimiento'])
            ->whereIn('estado', [
                EstadoSolicitudEnum::PENDIENTE,
                EstadoSolicitudEnum::EN_REVISION,
            ]);

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        return $query->get()->map(function (SolicitudMantenimiento $r) {
            return [
                'id' => $r->id,
                'tipo' => 'mantenimiento',
                'codigo' => $r->codigo,
                'fecha_ingreso' => optional($r->created_at)?->format('Y-m-d H:i:s'),
                'solicitante' => $r->solicitante?->name ?? '—',
                'unidad' => '—',
                'detalle' => $r->tipoMantenimiento?->nombre
                    ? $r->tipoMantenimiento->nombre . ' - ' . $r->detalle
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
            default => throw new \InvalidArgumentException('Tipo de solicitud no válido.'),
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

    private function enumValue($value): string
    {
        return $value instanceof \UnitEnum ? $value->value : (string) $value;
    }
}