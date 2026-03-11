<?php

namespace App\Http\Controllers\Reportes;

use App\Http\Controllers\Controller;
use App\Domain\Solicitudes\Services\Reportes\ReporteGeneralServiciosService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReporteGeneralServiciosController extends Controller
{
    public function pdf(Request $request, ReporteGeneralServiciosService $service)
    {
        $filters = $request->only([
            'date_from',
            'date_to',
            'tipo_servicio',
            'estado',
            'prioridad',
            'vehiculo_id',
        ]);

        $rows = $service->obtenerDatos($filters);
        $kpis = $service->getKpis($filters);

        $pdf = Pdf::loadView('reports.reporte_general_servicios_pdf', [
            'rows' => $rows,
            'filters' => $filters,
            'kpis' => $kpis,
            'rangeLabel' => $this->rangeLabel($filters),
        ])->setPaper('a4', 'landscape');

        return $pdf->stream('reporte_general_servicios.pdf');
    }

    private function rangeLabel(array $filters): string
    {
        $from = !empty($filters['date_from'])
            ? Carbon::parse($filters['date_from'])->format('d/m/Y')
            : 'Inicio';

        $to = !empty($filters['date_to'])
            ? Carbon::parse($filters['date_to'])->format('d/m/Y')
            : 'Fin';

        return "Periodo: {$from} al {$to}";
    }
}