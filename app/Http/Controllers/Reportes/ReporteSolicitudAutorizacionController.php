<?php

// -----------------------------------------------------------------------------
// CONTROLADOR PARA REPORTE DE SOLICITUD DE AUTORIZACIÓN
// -----------------------------------------------------------------------------
// Genera el documento oficial de autorización para usar un vehículo
// y asignar combustible. Muestra los datos del solicitante, vehículo,
// motorista y los detalles del viaje. Sirve como comprobante oficial
// para que el motorista pueda salir a realizar el viaje.

namespace App\Http\Controllers\Reportes;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Services\AuditoriaService;
use App\Domain\Solicitudes\Services\Reportes\ReporteSolicitudAutorizacionService;
use App\Http\Controllers\Controller;
use App\Models\SolicitudTransporte;
use Barryvdh\DomPDF\Facade\Pdf;

class ReporteSolicitudAutorizacionController extends Controller
{
    public function pdf(int $solicitudId, ?int $combustibleId = null)
    {
        $solicitud = SolicitudTransporte::findOrFail($solicitudId);

        $service = app(ReporteSolicitudAutorizacionService::class);
        $datos = $service->getDatosOficiales($solicitudId, $combustibleId);

        app(AuditoriaService::class)->registrar(
            AccionBitacoraEnum::EXPORTAR_PDF,
            'solicitudes_transporte',
            ['solicitud_id' => $solicitud->id, 'ticket' => $solicitud->ticket, 'tipo' => 'documento_autorizacion']
        );

        $pdf = Pdf::loadView('reports.solicitud_autorizacion_vehiculo_combustible', compact('datos'))
            ->setPaper('letter', 'portrait');

        return $pdf->stream("solicitud_autorizacion_{$solicitud->codigo}.pdf");
    }
}
