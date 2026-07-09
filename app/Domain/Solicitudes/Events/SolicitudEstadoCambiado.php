<?php

namespace App\Domain\Solicitudes\Events;

use App\Domain\Solicitudes\Contracts\Workflowable;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;

class SolicitudEstadoCambiado
{
    use Dispatchable;

    public function __construct(
        public Workflowable $solicitud,
        public ?EstadoSolicitudEnum $estadoAnterior,
        public EstadoSolicitudEnum $estadoNuevo,
        public User $actor,
        public array $metadata = [],
    ) {}
}
