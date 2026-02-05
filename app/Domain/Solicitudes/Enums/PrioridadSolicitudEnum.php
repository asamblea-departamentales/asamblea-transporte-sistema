<?php

namespace App\Domain\Solicitudes\Enums;

enum PrioridadSolicitudEnum: string
{
    case BAJA = 'baja';
    case MEDIA = 'media';
    case ALTA = 'alta';
}