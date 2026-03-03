<?php

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\SolicitudTransporte;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/admin');
});

// ✅ TEMPORAL: Registrar POST login manualmente para Filament
//Route::post('admin/login', function () {
 //   return app(\Filament\Http\Controllers\Auth\LoginController::class)->store();
//})->name('filament.admin.auth.login.post');

//Para los reportes PDF
Route::get('/reportes/solicitudes-transporte/pdf', function (Request $request) {
    // (opcional) protege la ruta
    abort_unless(auth()->check() && auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']), 403);

    $q = SolicitudTransporte::query();

    $dateField = $request->string('date_field', 'fecha_salida')->toString();

    if ($request->filled('date_from')) $q->where($dateField, '>=', $request->input('date_from'));
    if ($request->filled('date_to'))   $q->where($dateField, '<=', $request->input('date_to'));

    if ($request->filled('unidad_solicitante_id')) $q->where('unidad_solicitante_id', $request->input('unidad_solicitante_id'));
    if ($request->filled('estado')) $q->where('estado', $request->input('estado'));
    if ($request->filled('prioridad')) $q->where('prioridad', $request->input('prioridad'));

    $rows = $q->with(['unidad', 'solicitante'])
        ->orderBy('fecha_salida')
        ->get()
        ->map(function ($row) {
            foreach (['origen', 'destino', 'motivo_actividad', 'comentario_jefe'] as $field) {
                if (!empty($row->{$field}) && is_string($row->{$field})) {
                    // limpieza REAL de bytes inválidos
                    $row->{$field} = iconv('UTF-8', 'UTF-8//IGNORE', $row->{$field});
                }
            }
            return $row;
        });

    $from = $request->filled('date_from') ? \Carbon\Carbon::parse($request->input('date_from'))->format('d/m/Y') : 'Inicio';
    $to   = $request->filled('date_to') ? \Carbon\Carbon::parse($request->input('date_to'))->format('d/m/Y') : 'Fin';
    $rangeLabel = "Periodo: {$from} al {$to}";

    $pdf = Pdf::loadView('reports.solicitudes_transporte_pdf', [
            'rows' => $rows,
            'rangeLabel' => $rangeLabel,
        ])
        ->setPaper('a4', 'landscape')
        ->setWarnings(false);

    $filename = 'reporte_solicitudes_' . now()->format('Ymd_His') . '.pdf';

    return response()->streamDownload(fn () => print($pdf->output()), $filename, [
        'Content-Type' => 'application/pdf',
    ]);
})->name('reportes.solicitudes-transporte.pdf');