<?php

// -----------------------------------------------------------------------------
// CONTROLADOR PARA REPORTE DE RECEPCIÓN Y ENTREGA DE VEHÍCULO
// -----------------------------------------------------------------------------
// Genera un documento que registra la recepción o entrega de un vehículo.
// Muestra los datos del movimiento (vehículo, motorista, usuario que
// entrega/recibe). Sirve como constancia de que se realizó el traspaso
// del vehículo entre personas.

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
                'vehiculo.vehMarca',
                'vehiculo.vehModelo',
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
