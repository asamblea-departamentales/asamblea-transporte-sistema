<?php

namespace App\Domain\Solicitudes\Contracts;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;

interface Workflowable
{
    public function getEstado(): EstadoSolicitudEnum;

    public function setEstado(EstadoSolicitudEnum $estado): static;

    public function getEntidadTipo(): string;

    public function getSolicitanteId(): int;

    public function getKey();
}
