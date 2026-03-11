<?php

namespace App\Http\Controllers\Reportes;

use App\Domain\Solicitudes\Services\Reportes\ReporteFlotaVehicularService;
use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ReporteFlotaVehicularController extends Controller
{
    public function pdf(Request $request, ReporteFlotaVehicularService $service)
    {
        $filtros = $request->only([
            'placa',
            'tipo_vehiculo_id',
            'veh_marca_id',
            'veh_modelo_id',
            'veh_tipo_combustible_id',
            'veh_clasificacion_id',
            'veh_estado_catalogo_id',
            'activo',
        ]);

        $rows = $service->buildQuery($filtros)
            ->orderBy('placa')
            ->get();

        $pdf = Pdf::loadView('reports.flota-vehicular', [
            'rows' => $rows,
            'filtros' => $filtros,
            'service' => $service,
        ])->setPaper('a4', 'landscape');

        return $pdf->stream('distribucion-flota-vehicular.pdf');
    }
}