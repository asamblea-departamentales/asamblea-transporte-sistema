<?php

namespace App\Http\Controllers;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Services\AuditoriaService;
use App\Models\SolicitudMantenimiento;
use Barryvdh\DomPDF\Facade\Pdf;

class LiquidacionMantenimientoController extends Controller
{
    public function pdf($id)
    {
        $solicitud = SolicitudMantenimiento::with([
            'vehiculo.vehMarca',
            'vehiculo.vehModelo',
            'solicitante',
            'liquidacion.usuario',
        ])->findOrFail($id);

        app(AuditoriaService::class)->registrar(
            AccionBitacoraEnum::EXPORTAR_PDF,
            'solicitudes_mantenimiento',
            ['solicitud_id' => $solicitud->id, 'ticket' => $solicitud->ticket]
        );

        $pdf = Pdf::loadView('reports.liquidacion_mantenimiento_pdf', [
            'solicitud' => $solicitud,
            'liquidacion' => $solicitud->liquidacion,
        ]);

        return $pdf->stream("liquidacion_{$solicitud->codigo}.pdf");
    }
}
