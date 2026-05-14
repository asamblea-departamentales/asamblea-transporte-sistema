<?php

namespace App\Http\Controllers\Reportes;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Services\AuditoriaService;
use App\Http\Controllers\Controller;
use App\Domain\Solicitudes\Services\Reportes\ReporteOrdenTrabajoService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReporteOrdenTrabajoController extends Controller
{
    public function pdf(Request $request, ReporteOrdenTrabajoService $service)
    {
        $filters = $request->only([
            'solicitud_id',
            'date_from',
            'date_to',
            'vehiculo_id',
            'tipo_mantenimiento_id',
            'solicitante_id',
        ]);

        $rows = $service->buildQuery($filters)
            ->orderBy('fecha_sugerida', 'asc')
            ->get();

        if ($rows->isEmpty()) {
            abort(404, 'No se encontró una solicitud válida para generar la orden de trabajo.');
        }

        $kpis = $service->getKpis($filters);

        app(AuditoriaService::class)->registrar(
            AccionBitacoraEnum::EXPORTAR_PDF,
            'solicitudes_mantenimiento',
            ['cantidad_registros' => $rows->count(), 'tipo' => 'orden_trabajo']
        );

        $pdf = Pdf::loadView('reports.reporte_orden_trabajo_pdf', [
            'rows'       => $rows,
            'filters'    => $filters,
            'kpis'       => $kpis,
            'service'    => $service,
            'rangeLabel' => $this->rangeLabel($filters),
        ])->setPaper('a4', 'portrait');

        return $pdf->stream('orden_trabajo_mantenimiento.pdf');
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