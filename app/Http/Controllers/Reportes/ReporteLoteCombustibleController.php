<?php

namespace App\Http\Controllers\Reportes;

use App\Exports\AsignacionCombustibleLoteExport;
use App\Http\Controllers\Controller;
use App\Models\AsignacionCombustibleLote;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReporteLoteCombustibleController extends Controller
{
    // ─── PDF ─────────────────────────────────────────────────────────────────

    public function pdf(int $lote): \Illuminate\Http\Response
    {
        $lote = AsignacionCombustibleLote::with([
            'detalles.vehiculo',
            'detalles.solicitudCombustible',
            'detalles.tipoCombustible',
            'detalles.asignadoPor',
            'creador',
        ])->findOrFail($lote);

        $pdf = Pdf::loadView('reports.lote_combustible_pdf', [
            'lote' => $lote,
        ])->setPaper('a4', 'landscape'); // landscape por las columnas operativas

        return $pdf->stream("lote_combustible_{$lote->id}_{$lote->fecha->format('Y-m-d')}.pdf");
    }

    // ─── Excel ───────────────────────────────────────────────────────────────

    public function excel(int $lote): BinaryFileResponse
    {
        $lote = AsignacionCombustibleLote::with([
            'detalles.vehiculo',
            'detalles.solicitudCombustible',
            'detalles.tipoCombustible',
            'detalles.asignadoPor',
            'creador',
        ])->findOrFail($lote);

        $filename = "lote_combustible_{$lote->id}_{$lote->fecha->format('Y-m-d')}.xlsx";

        return Excel::download(new AsignacionCombustibleLoteExport($lote), $filename);
    }

    // ─── CSV auditoría ───────────────────────────────────────────────────────

    public function csv(int $lote): StreamedResponse
    {
        $lote = AsignacionCombustibleLote::with([
            'detalles.vehiculo',
            'detalles.solicitudCombustible',
            'detalles.tipoCombustible',
            'detalles.asignadoPor',
        ])->findOrFail($lote);

        $filename = "auditoria_lote_{$lote->id}_{$lote->fecha->format('Y-m-d')}.csv";

        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($lote) {
            $handle = fopen('php://output', 'w');

            // BOM para que Excel abra UTF-8 correctamente
            fwrite($handle, "\xEF\xBB\xBF");

            // Encabezados CSV
            fputcsv($handle, [
                'lote_id',
                'fecha_lote',
                'estado_lote',
                'placa',
                'numero_ticket',
                'solicitud_codigo',
                'monto_asignado',
                'numero_serie',
                'numero_contrato',
                'tipo_combustible',
                'cantidad_galones',
                'estado_asignacion',
                'asignado_por',
                'fecha_asignacion',
                'observaciones_operativas',
            ]);

            foreach ($lote->detalles as $d) {
                fputcsv($handle, [
                    $lote->id,
                    $lote->fecha->format('d/m/Y'),
                    $lote->estado->label(),
                    $d->placa_cache ?? $d->vehiculo?->placa ?? '',
                    $d->numero_ticket,
                    $d->solicitudCombustible?->codigo ?? '',
                    number_format((float) $d->monto_asignado, 2, '.', ''),
                    $d->numero_serie ?? '',
                    $d->numero_contrato ?? '',
                    $d->tipoCombustible?->nombre ?? '',
                    $d->cantidad_galones ? number_format((float) $d->cantidad_galones, 2, '.', '') : '',
                    $d->estado_asignacion ?? 'pendiente',
                    $d->asignadoPor?->name ?? '',
                    $d->fecha_asignacion?->format('d/m/Y H:i') ?? '',
                    $d->observaciones_operativas ?? '',
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}