<?php

namespace App\Http\Controllers\Reportes;

use App\Http\Controllers\Controller;
use App\Models\RecepcionEntregaVehiculo;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ReporteRecepcionEntregaVehiculoController extends Controller
{
    public function pdf(Request $request)
    {
        $movimientoId = $request->integer('movimiento_id');

        $movimiento = RecepcionEntregaVehiculo::query()
            ->with([
                'vehiculo.marca',
                'vehiculo.modelo',
                'vehiculo.color',
                'motorista' => fn ($q) => $q->withTrashed(),
                'usuario',
                'solicitud.despachador', // ← nuevo
            ])
            ->findOrFail($movimientoId);

        $pdf = Pdf::loadView('reports.reporte_recepcion_entrega_vehiculo_pdf', [
            'movimiento' => $movimiento,
        ])
        ->setPaper('a4', 'portrait')
        ->setWarnings(false);

        return $pdf->stream('reporte_recepcion_entrega_vehiculo.pdf');
    }
}