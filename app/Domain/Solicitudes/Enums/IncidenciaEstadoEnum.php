<?php

namespace App\Domain\Solicitudes\Enums;

enum IncidenciaEstadoEnum: string
{
    case ABIERTA = 'abierta';
    case EN_PROCESO = 'en_proceso';
    case RESUELTA = 'resuelta';
    case CERRADA = 'cerrada';
}