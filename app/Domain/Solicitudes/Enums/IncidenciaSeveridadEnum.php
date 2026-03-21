<?php

namespace App\Domain\Solicitudes\Enums;

enum IncidenciaSeveridadEnum: string
{
    case BAJA = 'baja';
    case MEDIA = 'media';
    case ALTA = 'alta';
    case CRITICA = 'critica';
}