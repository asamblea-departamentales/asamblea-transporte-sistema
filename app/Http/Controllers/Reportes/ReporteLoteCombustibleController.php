<?php

namespace App\Http\Controllers\Reportes;

use App\Http\Controllers\Controller;
use App\Models\AsignacionCombustibleLote;
use Barryvdh\DomPDF\Facade\Pdf;

class ReporteLoteCombustibleController extends Controller
{
    public function pdf($loteId)
    {
        $lote = AsignacionCombustibleLote::with([
            'detalles.vehiculo.tipo',
            'detalles.solicitudCombustible',
            'creador',
        ])->findOrFail($loteId);

        $pdf = Pdf::loadView('reports.lote_combustible_pdf', [
            'lote' => $lote,
        ])->setPaper('a4', 'portrait');

        return $pdf->stream("lote_combustible_{$lote->id}.pdf");
    }
}
