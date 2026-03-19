<?php

namespace App\Http\Controllers;

use App\Models\SolicitudCombustible;
use Barryvdh\DomPDF\Facade\Pdf;

class LiquidacionCombustibleController extends Controller
{
    public function pdf($id)
    {
        $solicitud = SolicitudCombustible::with([
    'vehiculo.marca',
    'vehiculo.modelo',
    'solicitante',
    'liquidacion.usuario', // ← nueva relación polimórfica
])->findOrFail($id);

        $pdf = Pdf::loadView('pdf.liquidacion_combustible', [
            'solicitud' => $solicitud,
            'liquidacion' => $solicitud->liquidacion,
        ]);

        return $pdf->stream("liquidacion_{$solicitud->codigo}.pdf");
    }
}