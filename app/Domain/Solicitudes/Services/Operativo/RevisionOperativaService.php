<?php

namespace App\Domain\Solicitudes\Services\Operativo;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\BitacoraEvento;
use App\Models\HistorialEstado;
use App\Models\SolicitudCombustible;
use App\Models\SolicitudMantenimiento;
use App\Models\SolicitudTransporte;
use Illuminate\Support\Collection;

class RevisionOperativaService
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

    public function derivar(
        string $tipo,
        int $id,
        int $userId,
        int $derivadoA,
        string $comentario,
        array $validaciones = []
    ): void {
        $record = $this->resolverModelo($tipo, $id);

        $this->guardarComentario($record, $comentario);
        $record->save();

        BitacoraEvento::create([
            'entidad_tipo' => $this->resolverEntidadTipo($tipo),
            'entidad_id' => $record->id,
            'accion' => 'DERIVAR_REVISION',
            'user_id' => $userId,
            'datos_extras' => [
                'derivado_a' => $derivadoA,
                'comentario' => $comentario,
                'validaciones' => $validaciones,
            ],
        ]);
    }

    public function observar(
        string $tipo,
        int $id,
        int $userId,
        string $comentario,
        array $validaciones = []
    ): void {
        $record = $this->resolverModelo($tipo, $id);
        $estadoAnterior = $record->estado;

        $this->guardarComentario($record, $comentario);
        $record->save();

        HistorialEstado::create([
            'entidad_tipo' => $this->resolverEntidadTipo($tipo),
            'entidad_id' => $record->id,
            'estado_anterior' => $this->enumValue($estadoAnterior),
            'estado_nuevo' => $this->enumValue($record->estado),
            'user_id' => $userId,
            'comentario' => $comentario,
        ]);

        BitacoraEvento::create([
            'entidad_tipo' => $this->resolverEntidadTipo($tipo),
            'entidad_id' => $record->id,
            'accion' => 'OBSERVACION_REVISION_OPERATIVA',
            'user_id' => $userId,
            'datos_extras' => [
                'comentario' => $comentario,
                'validaciones' => $validaciones,
            ],
        ]);
    }

    public function validarYPreaprobar(
        string $tipo,
        int $id,
        int $userId,
        string $comentario,
        array $validaciones = [],
        ?float $montoAprobado = null,
    ): void {
        $record = $this->resolverModelo($tipo, $id);
        $estadoAnterior = $record->estado;

        $record->estado = EstadoSolicitudEnum::PRE_APROBADA;
        $this->guardarComentario($record, $comentario);
        $record->save();

        if ($record instanceof \App\Models\SolicitudCombustible && $montoAprobado !== null && $montoAprobado > 0) {
            \App\Models\DecisionOperativa::updateOrCreate(
                [
                    'decidable_id' => $record->id,
                    'decidable_type' => get_class($record),
                ],
                [
                    'usuario_operativo_id' => $userId,
                    'monto_aprobado' => $montoAprobado,
                    'cambio_detectado' => 'ninguno',
                    'justificacion' => $comentario,
                ]
            );
        }

        HistorialEstado::create([
            'entidad_tipo' => $this->resolverEntidadTipo($tipo),
            'entidad_id' => $record->id,
            'estado_anterior' => $this->enumValue($estadoAnterior),
            'estado_nuevo' => EstadoSolicitudEnum::PRE_APROBADA->value,
            'user_id' => $userId,
            'comentario' => $comentario,
        ]);

        BitacoraEvento::create([
            'entidad_tipo' => $this->resolverEntidadTipo($tipo),
            'entidad_id' => $record->id,
            'accion' => 'VALIDAR_PREAPROBAR',
            'user_id' => $userId,
            'datos_extras' => [
                'comentario' => $comentario,
                'validaciones' => $validaciones,
            ],
        ]);
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

    private function mapTransporte(array $filters = []): Collection
    {
        $query = SolicitudTransporte::query()
            ->with(['solicitante.grupo', 'solicitante.unidadSolicitante', 'unidad'])
            ->where('estado', EstadoSolicitudEnum::EN_REVISION);

        if (!empty($filters['date_from'])) {
            $query->where('updated_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('updated_at', '<=', $filters['date_to']);
        }

        return $query->get()->map(function (SolicitudTransporte $r) {
            return [
                'id' => $r->id,
                'tipo' => 'transporte',
                'codigo' => $r->codigo,
                'fecha_ingreso' => optional($r->updated_at)?->format('Y-m-d H:i:s'),
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
            ->where('estado', EstadoSolicitudEnum::EN_REVISION);

        if (!empty($filters['date_from'])) {
            $query->where('updated_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('updated_at', '<=', $filters['date_to']);
        }

        return $query->get()->map(function (SolicitudCombustible $r) {
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
            ->where('estado', EstadoSolicitudEnum::EN_REVISION);

        if (!empty($filters['date_from'])) {
            $query->where('updated_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
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
                    ? $r->tipoMantenimiento->nombre . ' - ' . $r->detalle
                    : $r->detalle,
                'prioridad' => $this->enumValue($r->prioridad),
                'estado' => $this->enumValue($r->estado),
                'fecha_solicitud' => optional($r->fecha_solicitud)?->format('Y-m-d'),
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

    private function enumValue($value): string
    {
        return $value instanceof \UnitEnum ? $value->value : (string) $value;
    }
}