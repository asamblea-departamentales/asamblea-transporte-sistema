<?php

namespace App\Http\Controllers;

use App\Models\SolicitudMantenimiento;
use Barryvdh\DomPDF\Facade\Pdf;

class LiquidacionMantenimientoController extends Controller
{
    public function pdf($id)
    {
        $solicitud = SolicitudMantenimiento::with([
    'vehiculo.marca',
    'vehiculo.modelo',
    'solicitante',
    'liquidacion.usuario', // ← misma relación
])->findOrFail($id);

        $pdf = Pdf::loadView('pdf.liquidacion_mantenimiento', [
            'solicitud' => $solicitud,
            'liquidacion' => $solicitud->liquidacion,
        ]);

        return $pdf->stream("liquidacion_{$solicitud->codigo}.pdf");
    }
}