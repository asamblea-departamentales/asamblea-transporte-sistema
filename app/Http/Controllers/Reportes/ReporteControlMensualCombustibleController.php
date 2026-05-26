<?php

// -----------------------------------------------------------------------------
// CONTROLADOR PARA REPORTE DE CONTROL MENSUAL DE COMBUSTIBLE
// -----------------------------------------------------------------------------
// Genera un listado mensual de todas las solicitudes de combustible.
// Muestra los detalles de cada vale (vehículo, motorista, galones, monto, etc.)
// Sirve para llevar un control mensual del consumo de combustible de la flota.

namespace App\Http\Controllers\Reportes;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Services\AuditoriaService;
use App\Domain\Solicitudes\Services\Reportes\ReporteControlMensualCombustibleService;
use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ReporteControlMensualCombustibleController extends Controller
{
    public function pdf(Request $request, ReporteControlMensualCombustibleService $service)
    {
        $filtros = $request->only([
            'date_field',
            'date_from',
            'date_to',
            'vehiculo_id',
            'motorista_id',
            'contrato_id',
            'serie_vale_id',
            'estado',
        ]);

        $rows = $service->buildQuery($filtros)
            ->orderBy('fecha_solicitud')
            ->get();

        app(AuditoriaService::class)->registrar(
            AccionBitacoraEnum::EXPORTAR_PDF,
            'solicitudes_combustible',
            ['cantidad_registros' => $rows->count(), 'tipo' => 'control_mensual']
        );

        $pdf = Pdf::loadView('reports.control-mensual-combustible_pdf', [
            'rows' => $rows,
            'filtros' => $filtros,
            'service' => $service,
            'rangeLabel' => $this->rangeLabel($filtros),
        ])->setPaper('a4', 'landscape');

        return $pdf->stream('control-mensual-combustible.pdf');
    }

    private function rangeLabel(array $filtros): string
    {
        $from = ! empty($filtros['date_from']) ? \Carbon\Carbon::parse($filtros['date_from'])->format('d/m/Y') : 'Inicio';
        $to = ! empty($filtros['date_to']) ? \Carbon\Carbon::parse($filtros['date_to'])->format('d/m/Y') : 'Fin';

        return "Periodo: {$from} al {$to}";
    }
}
