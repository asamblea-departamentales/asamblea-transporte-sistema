<?php

namespace App\Http\Controllers\Reportes;

use App\Http\Controllers\Controller;
use App\Domain\Solicitudes\Services\Reportes\ReporteMisionOficialService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReporteMisionOficialController extends Controller
{
    public function pdf(Request $request, ReporteMisionOficialService $service)
    {
        $filters = $request->only([
            'date_from',
            'date_to',
            'vehiculo_id',
            'motorista_id',
            'tipo_vehiculo_id',
            'solicitante_id',
        ]);

        $rows = $service->buildQuery($filters)
            ->orderBy('fecha_salida', 'asc')
            ->get();

        if ($rows->isEmpty()) {
            abort(404, 'No se encontró una solicitud válida para generar la misión oficial.');
}    

        $kpis = $service->getKpis($filters);

        $pdf = Pdf::loadView('reports.reporte_mision_oficial_pdf', [
            'rows' => $rows,
            'filters' => $filters,
            'kpis' => $kpis,
            'service' => $service,
            'rangeLabel' => $this->rangeLabel($filters),
        ])->setPaper('a4', 'portrait');

        return $pdf->stream('reporte_mision_oficial.pdf');
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