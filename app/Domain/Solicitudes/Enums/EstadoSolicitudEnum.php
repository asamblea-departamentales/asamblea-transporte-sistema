<?php

namespace App\Domain\Solicitudes\Enums;

enum EstadoSolicitudEnum: string
{
    case BORRADOR = 'borrador';
    case PENDIENTE = 'pendiente';
    case EN_REVISION = 'en_revision';

    case APROBADA = 'aprobada';
    case RECHAZADA = 'rechazada';

    case PROGRAMADA = 'programada';

    case EN_EJECUCION = 'en_ejecucion';

    case COMPLETADA = 'completada';
    case CANCELADA = 'cancelada';
    //Agregado
    case PRE_APROBADA = 'pre_aprobada';

    case ASIGNADA = 'asignada';
    case LIQUIDADA = 'liquidada';
}