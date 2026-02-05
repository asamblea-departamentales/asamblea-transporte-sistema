<?php

namespace App\Domain\Solicitudes\Enums;

enum AccionBitacoraEnum: string
{
    case CREAR = 'crear';
    case ENVIAR = 'enviar';
    case APROBAR = 'aprobar';
    case RECHAZAR = 'rechazar';
    case CANCELAR = 'cancelar';
    case VER = 'ver';
    case OBSERVAR = 'observar';
}