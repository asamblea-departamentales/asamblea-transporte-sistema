<?php

namespace App\Http\Controllers\Reportes;

use App\Domain\Solicitudes\Services\Reportes\ReporteSolicitudAutorizacionService;
use App\Http\Controllers\Controller;
use App\Models\SolicitudTransporte;
use Barryvdh\DomPDF\Facade\Pdf;

class ReporteSolicitudAutorizacionController extends Controller
{
    public function pdf(int $solicitudId)
    {
        $solicitud = SolicitudTransporte::findOrFail($solicitudId);

        if (! $solicitud->vehiculo_id || ! $solicitud->motorista_id) {
            return redirect()->back()->with('error', 'La solicitud debe tener vehículo y motorista asignados para generar el documento oficial.');
        }

        $service = app(ReporteSolicitudAutorizacionService::class);
        $datos = $service->getDatosOficiales($solicitudId);

        $pdf = Pdf::loadView('reports.solicitud_autorizacion_vehiculo_combustible', compact('datos'))
            ->setPaper('letter', 'portrait');

        return $pdf->stream("solicitud_autorizacion_{$solicitud->codigo}.pdf");
    }
}
