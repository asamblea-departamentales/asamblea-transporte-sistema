<?php

namespace App\Domain\Solicitudes\Enums;

enum AccionBitacoraEnum: string
{
    case CREAR = 'crear';
    case ENVIAR = 'enviar';
    case APROBAR = 'aprobar';
    case PRE_APROBAR = 'pre_aprobar';
    case RECHAZAR = 'rechazar';
    case CANCELAR = 'cancelar';
    case VER = 'ver';
    case OBSERVAR = 'observar';

    case COMPLETAR = 'completar';

    case ASIGNAR = 'asignar';
}