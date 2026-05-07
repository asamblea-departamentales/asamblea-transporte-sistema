<?php

namespace App\Domain\Solicitudes\Enums;

enum EstadoLoteEnum: string
{
    case BORRADOR = 'borrador';
    case FINALIZADO = 'finalizado';
}

