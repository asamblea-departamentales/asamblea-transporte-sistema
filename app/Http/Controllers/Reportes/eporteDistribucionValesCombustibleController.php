<?php

namespace App\Http\Controllers\Reportes;

use App\Http\Controllers\Controller;
use App\Domain\Solicitudes\Services\Reportes\ReporteDistribucionValesCombustibleService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReporteDistribucionValesCombustibleController extends Controller
{
    public function pdf(Request $request, ReporteDistribucionValesCombustibleService $service)
    {
        $filters = $request->only([
            'date_field',
            'date_from',
            'date_to',
            'vehiculo_id',
            'motorista_id',
            'proveedor_id',
            'serie_vale_id',
            'estado',
        ]);

        $rows = $service->buildQuery($filters)
            ->orderBy('fecha_asignacion', 'asc')
            ->orderBy('codigo', 'asc')
            ->get();

        $kpis = $service->kpis($filters);

        $pdf = Pdf::loadView('reports.reporte_distribucion_vales_pdf', [
            'rows' => $rows,
            'filters' => $filters,
            'kpis' => $kpis,
            'service' => $service,
            'rangeLabel' => $this->rangeLabel($filters),
        ])->setPaper('a4', 'landscape');

        return $pdf->stream('reporte_distribucion_vales.pdf');
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