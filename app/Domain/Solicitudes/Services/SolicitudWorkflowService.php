<?php

namespace App\Domain\Solicitudes\Services;

use App\Domain\Solicitudes\Contracts\Workflowable;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Events\SolicitudEstadoCambiado;
use App\Domain\Solicitudes\Exceptions\InvalidWorkflowTransitionException;
use App\Models\HistorialEstado;
use App\Models\User;

class SolicitudWorkflowService
{
    private array $transitionMap;

    public function __construct()
    {
        $S = EstadoSolicitudEnum::class;

        $this->transitionMap = [
            'solicitud_combustible' => [
                $S::BORRADOR->value => [$S::PENDIENTE, $S::CANCELADA],
                $S::PENDIENTE->value => [$S::EN_REVISION, $S::PRE_APROBADA, $S::RECHAZADA, $S::CANCELADA],
                $S::EN_REVISION->value => [$S::EN_REVISION, $S::PRE_APROBADA, $S::RECHAZADA],
                $S::PRE_APROBADA->value => [$S::APROBADA, $S::RECHAZADA, $S::PENDIENTE],
                $S::APROBADA->value => [$S::ASIGNADA, $S::COMPLETADA, $S::PENDIENTE],
                $S::ASIGNADA->value => [$S::COMPLETADA],
                $S::COMPLETADA->value => [$S::LIQUIDADA],
                $S::RECHAZADA->value => [$S::PENDIENTE],
                $S::CANCELADA->value => [],
                $S::LIQUIDADA->value => [],
            ],
            'solicitud_transporte' => [
                $S::BORRADOR->value => [$S::PENDIENTE, $S::CANCELADA],
                $S::PENDIENTE->value => [$S::EN_REVISION, $S::APROBADA, $S::RECHAZADA, $S::CANCELADA],
                $S::EN_REVISION->value => [$S::EN_REVISION, $S::APROBADA, $S::RECHAZADA, $S::PRE_APROBADA],
                $S::PRE_APROBADA->value => [$S::APROBADA, $S::RECHAZADA, $S::PROGRAMADA, $S::PENDIENTE],
                $S::APROBADA->value => [$S::EN_EJECUCION, $S::COMPLETADA, $S::PENDIENTE, $S::PROGRAMADA],
                $S::PROGRAMADA->value => [$S::EN_EJECUCION, $S::COMPLETADA],
                $S::EN_EJECUCION->value => [$S::COMPLETADA],
                $S::COMPLETADA->value => [$S::LIQUIDADA],
                $S::RECHAZADA->value => [$S::PENDIENTE],
                $S::CANCELADA->value => [],
                $S::LIQUIDADA->value => [],
                $S::ASIGNADA->value => [$S::EN_EJECUCION, $S::COMPLETADA],
            ],
            'solicitud_mantenimiento' => [
                $S::BORRADOR->value => [$S::PENDIENTE, $S::CANCELADA],
                $S::PENDIENTE->value => [$S::EN_REVISION, $S::PRE_APROBADA, $S::RECHAZADA, $S::CANCELADA],
                $S::EN_REVISION->value => [$S::EN_REVISION, $S::PRE_APROBADA, $S::RECHAZADA],
                $S::PRE_APROBADA->value => [$S::APROBADA, $S::RECHAZADA, $S::PENDIENTE],
                $S::APROBADA->value => [$S::EN_EJECUCION, $S::COMPLETADA],
                $S::EN_EJECUCION->value => [$S::COMPLETADA],
                $S::COMPLETADA->value => [$S::LIQUIDADA],
                $S::RECHAZADA->value => [$S::PENDIENTE],
                $S::CANCELADA->value => [],
                $S::LIQUIDADA->value => [],
            ],
        ];
    }

    public function transicionar(
        Workflowable $solicitud,
        EstadoSolicitudEnum $nuevoEstado,
        User $actor,
        ?string $comentario = null,
        array $metadata = [],
    ): void {
        $entidadTipo = $solicitud->getEntidadTipo();
        $anterior = $solicitud->getEstado();

        $this->validarTransicion($entidadTipo, $anterior, $nuevoEstado);

        $solicitud->setEstado($nuevoEstado);
        $solicitud->save();

        HistorialEstado::create([
            'entidad_tipo' => $entidadTipo,
            'entidad_id' => $solicitud->getKey(),
            'estado_anterior' => $anterior ? ($anterior->value ?? (string) $anterior) : 'ninguno',
            'estado_nuevo' => $nuevoEstado->value,
            'user_id' => $actor->id,
            'comentario' => $comentario,
        ]);

        event(new SolicitudEstadoCambiado($solicitud, $anterior, $nuevoEstado, $actor, $metadata));
    }

    public function enviar(Workflowable $solicitud, User $actor): void
    {
        $this->transicionar($solicitud, EstadoSolicitudEnum::PENDIENTE, $actor, null, ['accion' => 'enviar']);
    }

    public function cancelar(Workflowable $solicitud, User $actor, ?string $motivo = null): void
    {
        $this->transicionar($solicitud, EstadoSolicitudEnum::CANCELADA, $actor, $motivo, ['accion' => 'cancelar']);
    }

    public function rechazar(Workflowable $solicitud, User $actor, string $motivo): void
    {
        $this->transicionar($solicitud, EstadoSolicitudEnum::RECHAZADA, $actor, $motivo, ['accion' => 'rechazar']);
    }

    public function observar(Workflowable $solicitud, User $actor, ?string $comentario = null): void
    {
        $this->transicionar($solicitud, EstadoSolicitudEnum::EN_REVISION, $actor, $comentario, ['accion' => 'observar']);
    }

    private function validarTransicion(string $modulo, ?EstadoSolicitudEnum $from, EstadoSolicitudEnum $to): void
    {
        if (! isset($this->transitionMap[$modulo])) {
            throw new InvalidWorkflowTransitionException("Módulo desconocido: {$modulo}");
        }

        $permitidos = $this->transitionMap[$modulo][$from?->value] ?? [];

        if (! in_array($to, $permitidos, true)) {
            $fromLabel = $from?->value ?? 'ninguno';
            $toLabel = $to->value;
            throw new InvalidWorkflowTransitionException(
                "Transición inválida: {$fromLabel} → {$toLabel} en {$modulo}"
            );
        }
    }
}
