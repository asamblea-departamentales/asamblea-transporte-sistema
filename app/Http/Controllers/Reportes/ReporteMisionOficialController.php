<?php

namespace App\Http\Controllers\Reportes;

use App\Http\Controllers\Controller;
use App\Domain\Solicitudes\Services\Reportes\ReporteMisionOficialService;
use App\Models\SolicitudTransporte;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReporteMisionOficialController extends Controller
{
    public function pdf(
        Request $request,
        ReporteMisionOficialService $service,
        SolicitudTransporte $solicitud = null  // ← Model Binding del {solicitud?} de la ruta
    ) {
        if ($solicitud && $solicitud->exists) {
            // Caso A: botón Filament — misión individual
            $solicitud->load([
                'solicitante',
                'autorizador',
                'motorista',
                'tipoVehiculo',
                'vehiculo' => fn ($q) => $q->with([
                    'marca:id,nombre',
                    'modelo:id,nombre',
                    'color:id,nombre',
                    'clasificacion:id,nombre',
                ]),
            ]);

            $rows    = collect([$solicitud]);
            $filters = [];

        } else {
            // Caso B: reporte masivo desde pantalla de reportes
            $filters = $request->only([
                'date_from', 'date_to',
                'vehiculo_id', 'motorista_id', 'tipo_vehiculo_id',
            ]);

            $rows = $service->buildQuery($filters)
                ->orderBy('fecha_salida', 'asc')
                ->get();
        }

        if ($rows->isEmpty()) {
            abort(404, 'No hay datos para generar el PDF.');
        }

        $kpis = $service->getKpis($filters);

        return Pdf::loadView('reports.reporte_mision_oficial_pdf', [
            'rows'       => $rows,
            'filters'    => $filters,
            'kpis'       => $kpis,
            'service'    => $service,
            'rangeLabel' => ($solicitud && $solicitud->exists)
                                ? 'Misión Individual'
                                : $this->rangeLabel($filters),
        ])
        ->setPaper('a4', 'portrait')
        ->setWarnings(false)
        ->stream('mision_oficial.pdf');
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