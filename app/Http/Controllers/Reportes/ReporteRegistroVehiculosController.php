<?php

// -----------------------------------------------------------------------------
// CONTROLADOR PARA REPORTE HOJA DE REGISTRO DE VEHÍCULOS
// -----------------------------------------------------------------------------
// Genera un PDF con el detalle de movimientos de un vehículo en un rango de
// fechas: kilómetros inicial/final/recorridos, lugares visitados, motorista
// asignado y condición del tanque a la salida y regreso.

namespace App\Http\Controllers\Reportes;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Services\AuditoriaService as Auditoria;
use App\Domain\Solicitudes\Services\Reportes\ReporteRegistroVehiculosService;
use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ReporteRegistroVehiculosController extends Controller
{
    public function pdf(Request $request, ReporteRegistroVehiculosService $service)
    {
        $request->validate([
            'vehiculo_id' => 'required|integer|exists:vehiculos,id',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
        ]);

        $vehiculoId = (int) $request->vehiculo_id;
        $fechaInicio = $request->fecha_inicio;
        $fechaFin = $request->fecha_fin;

        $datosVehiculo = $service->getDatosVehiculo($vehiculoId);
        $registros = $service->getRegistros($vehiculoId, $fechaInicio, $fechaFin);

        $pdf = Pdf::loadView('reports.registro_vehiculos_pdf', [
            'datosVehiculo' => $datosVehiculo,
            'registros' => $registros,
            'fechaInicio' => $fechaInicio,
            'fechaFin' => $fechaFin,
        ])->setPaper('a4', 'landscape');

        app(Auditoria::class)->registrar(
            AccionBitacoraEnum::EXPORTAR_PDF,
            'reporte_registro_vehiculos',
            [
                'vehiculo_id' => $vehiculoId,
                'fecha_inicio' => $fechaInicio,
                'fecha_fin' => $fechaFin,
                'cantidad' => $registros->count(),
            ]
        );

        return $pdf->stream('hoja-registro-vehiculo-'.$datosVehiculo['placa'].'.pdf');
    }
}
