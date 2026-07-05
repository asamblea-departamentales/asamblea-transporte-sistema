<?php

namespace App\Domain\Solicitudes\Enums;

enum IncidenciaTipoEnum: string
{
    case DANIO = 'danio';
    case ACCIDENTE = 'accidente';
    case FALTANTE = 'faltante';
    case FALLA_MECANICA = 'falla_mecanica';
    case OTRO = 'otro';
}
