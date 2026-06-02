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

    case ACTUALIZACION = 'actualizacion';
    //Nuevos Estados para trazabilidad en los reportes
    case EXPORTAR_PDF = 'exportar_pdf';
    case EXPORTAR_EXCEL = 'exportar_excel';
    case EXPORTAR_CSV = 'exportar_csv';
    case IMPRIMIR = 'imprimir';

    case ASIGNAR_RECURSOS = 'asignar_recursos';
    case DESBLOQUEAR = 'desbloquear';
    case PROGRAMAR = 'programar';
}