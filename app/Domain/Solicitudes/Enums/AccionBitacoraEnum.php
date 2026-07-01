<?php

namespace App\Domain\Solicitudes\Enums;
/**
 * AccionBitacoraEnum
 *
 * Este `enum` contiene las acciones que se registran en la "bitácora" (log de actividad)
 * cada vez que ocurre un evento relevante sobre una solicitud (crear, enviar, aprobar, etc.).
 *
 * Propósito:
 * - Mantener un registro legible de "qué se hizo" y por quién.
 * - Facilitar auditoría y trazabilidad al mostrar eventos en reportes o en la interfaz.
 *
 * Nota para un lector no técnico (por ejemplo, un ingeniero con mucha experiencia pero
 * que no esté familiarizado con PHP moderno):
 * - Un `enum` aquí es sólo una lista fija de etiquetas (cada etiqueta tiene un valor string).
 * - Cuando el código registra un evento, usa uno de estos valores para describir la acción.
 */
enum AccionBitacoraEnum: string
{
    // Creación y envío
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
    case REASIGNAR = 'reasignar';
    case DESBLOQUEAR = 'desbloquear';
    case PROGRAMAR = 'programar';
    case AGREGAR_DESTINO_VIAJE = 'agregar_destino_viaje';
}