<?php

namespace App\Http\Controllers\Reportes;

use App\Domain\Solicitudes\Services\Reportes\ReportePlanDiarioService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Carbon;

class ReportePlanDiarioController
{
    public function index()
    {
        return view('filament.pages.reporte-plan-diario');
    }

    public function pdf(ReportePlanDiarioService $service, $fecha = null)
    {
        $fecha = $fecha ? Carbon::parse($fecha) : now();
        $rows = $service->obtenerPorFecha($fecha);
        $kpis = $service->getKpis($fecha);

        if ($rows->isEmpty()) {
            return redirect()->back()->with('warning', 'No hay datos para la fecha seleccionada.');
        }

        return Pdf::loadView('reports.plan_diario_transporte_pdf', compact('rows', 'kpis', 'fecha'))
            ->setPaper('a4', 'portrait')
            ->stream('reporte_plan_diario_'.$fecha->format('Y_m_d').'.pdf');
    }
}
