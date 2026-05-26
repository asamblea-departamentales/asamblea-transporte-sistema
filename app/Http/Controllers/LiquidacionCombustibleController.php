<?php

// -----------------------------------------------------------------------------
// CONTROLADOR DE LIQUIDACIÓN DE COMBUSTIBLE
// -----------------------------------------------------------------------------
// Este controlador genera un documento PDF con los detalles de la liquidación
// de una solicitud de combustible. Sirve para que el usuario pueda ver,
// imprimir o descargar un comprobante oficial de cuánto combustible se usó,
// en qué vehículo, y quién lo solicitó.

namespace App\Http\Controllers;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Services\AuditoriaService;
use App\Models\SolicitudCombustible;
use Barryvdh\DomPDF\Facade\Pdf;

// Hereda del controlador base. Gestiona la generación de PDFs para liquidaciones de combustible.
class LiquidacionCombustibleController extends Controller
{
    /**
     * Genera y muestra el PDF de la liquidación de una solicitud de combustible.
     *
     * @param int $id  Identificador de la solicitud de combustible.
     * @return \Illuminate\Http\Response  PDF generado para el usuario.
     */
    public function pdf($id)
    {
        // Busca la solicitud de combustible junto con la información relacionada.
        $solicitud = SolicitudCombustible::with([
            'vehiculo.vehMarca',
            'vehiculo.vehModelo',
            'solicitante',
            'liquidacion.usuario',
        ])->findOrFail($id);

        // Registra en la auditoría que se exportó el PDF.
        app(AuditoriaService::class)->registrar(
            AccionBitacoraEnum::EXPORTAR_PDF,
            'solicitudes_combustible',
            ['solicitud_id' => $solicitud->id, 'ticket' => $solicitud->ticket]
        );

        // Genera el PDF usando la vista correspondiente y los datos de la solicitud.
        $pdf = Pdf::loadView('reports.liquidacion_pdf', [
            'solicitud' => $solicitud,
            'liquidacion' => $solicitud->liquidacion,
        ]);

        // Devuelve el PDF para que el usuario lo pueda ver o descargar.
        return $pdf->stream("liquidacion_{$solicitud->codigo}.pdf");
    }
}
