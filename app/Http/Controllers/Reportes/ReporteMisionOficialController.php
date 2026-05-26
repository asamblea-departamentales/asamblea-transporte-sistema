<?php

// -----------------------------------------------------------------------------
// CONTROLADOR PARA REPORTE DE MISIÓN OFICIAL
// -----------------------------------------------------------------------------
// Genera un documento con los datos de una misión oficial (viaje de trabajo).
// Puede mostrar una sola misión o un listado de varias en un rango de fechas.
// Incluye datos del solicitante, vehículo, motorista, fechas de salida y
// regreso. Sirve como respaldo oficial de los viajes realizados.

namespace App\Http\Controllers\Reportes;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Services\AuditoriaService;
use App\Domain\Solicitudes\Services\Reportes\ReporteMisionOficialService;
use App\Http\Controllers\Controller;
use App\Models\SolicitudTransporte;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReporteMisionOficialController extends Controller
{
    public function pdf(
        Request $request,
        ReporteMisionOficialService $service,
        ?SolicitudTransporte $solicitud = null  // ← Model Binding del {solicitud?} de la ruta
    ) {
        if ($solicitud && $solicitud->exists) {
            // Caso A: botón Filament — misión individual
            $solicitud->load([
                'solicitante',
                'autorizador',
                'motorista',
                'tipoVehiculo',
                'vehiculo' => fn ($q) => $q->with([
                    'vehMarca:id,nombre',
                    'vehModelo:id,nombre',
                    'color:id,nombre',
                    'clasificacion:id,nombre',
                ]),
            ]);

            $rows = collect([$solicitud]);
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

        app(AuditoriaService::class)->registrar(
            AccionBitacoraEnum::EXPORTAR_PDF,
            'solicitudes_transporte',
            ['cantidad_registros' => $rows->count(), 'tipo' => 'mision_oficial']
        );

        return Pdf::loadView('reports.reporte_mision_oficial_pdf', [
            'rows' => $rows,
            'filters' => $filters,
            'kpis' => $kpis,
            'service' => $service,
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
        $from = ! empty($filters['date_from'])
            ? Carbon::parse($filters['date_from'])->format('d/m/Y')
            : 'Inicio';

        $to = ! empty($filters['date_to'])
            ? Carbon::parse($filters['date_to'])->format('d/m/Y')
            : 'Fin';

        return "Periodo: {$from} al {$to}";
    }
}
