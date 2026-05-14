<?php

namespace App\Http\Controllers;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Services\AuditoriaService;
use App\Models\SolicitudCombustible;
use Barryvdh\DomPDF\Facade\Pdf;

class LiquidacionCombustibleController extends Controller
{
    public function pdf($id)
    {
        $solicitud = SolicitudCombustible::with([
            'vehiculo.vehMarca',
            'vehiculo.vehModelo',
            'solicitante',
            'liquidacion.usuario',
        ])->findOrFail($id);

        app(AuditoriaService::class)->registrar(
            AccionBitacoraEnum::EXPORTAR_PDF,
            'solicitudes_combustible',
            ['solicitud_id' => $solicitud->id, 'ticket' => $solicitud->ticket]
        );

        $pdf = Pdf::loadView('reports.liquidacion_pdf', [
            'solicitud' => $solicitud,
            'liquidacion' => $solicitud->liquidacion,
        ]);

        return $pdf->stream("liquidacion_{$solicitud->codigo}.pdf");
    }
}
