<?php

use App\Exports\SolicitudesCombustibleExport;
use App\Exports\SolicitudesMantenimientoExport;
use App\Http\Controllers\LiquidacionCombustibleController;
use App\Http\Controllers\LiquidacionMantenimientoController;
use App\Http\Controllers\Reportes\ReporteControlMensualCombustibleController;
use App\Http\Controllers\Reportes\ReporteDistribucionCargasCombustibleController;
use App\Http\Controllers\Reportes\ReporteFlotaVehicularController;
use App\Http\Controllers\Reportes\ReporteGeneralServiciosController;
use App\Http\Controllers\Reportes\ReporteMisionOficialController;
use App\Http\Controllers\Reportes\ReporteOrdenTrabajoController;
use App\Http\Controllers\Reportes\ReportePlanDiarioController;
use App\Http\Controllers\Reportes\ReporteRecepcionEntregaVehiculoController;
use App\Http\Controllers\Reportes\ReporteLoteCombustibleController;
use App\Models\SolicitudCombustible;
use App\Models\SolicitudMantenimiento;
use App\Models\SolicitudTransporte;
use Barryvdh\DomPDF\Facade\Pdf;
use FontLib\Table\Type\name;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Maatwebsite\Excel\Facades\Excel;

Route::get('/', function () {
    return redirect('/admin');
});

// ✅ TEMPORAL: Registrar POST login manualmente para Filament
// Route::post('admin/login', function () {
//   return app(\Filament\Http\Controllers\Auth\LoginController::class)->store();
// })->name('filament.admin.auth.login.post');

// Para los reportes PDF de Transporte
Route::get('/reportes/solicitudes-transporte/pdf', function (Request $request) {
    // (opcional) protege la ruta
    abort_unless(auth()->check() && auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'operativo', 'liquidador']), 403);

    $q = SolicitudTransporte::query();

    $dateField = $request->string('date_field', 'fecha_salida')->toString();

    if ($request->filled('date_from')) {
        $q->where($dateField, '>=', $request->input('date_from'));
    }
    if ($request->filled('date_to')) {
        $q->where($dateField, '<=', $request->input('date_to'));
    }

    if ($request->filled('unidad_solicitante_id')) {
        $q->where('unidad_solicitante_id', $request->input('unidad_solicitante_id'));
    }
    if ($request->filled('estado')) {
        $q->where('estado', $request->input('estado'));
    }
    if ($request->filled('prioridad')) {
        $q->where('prioridad', $request->input('prioridad'));
    }

    $rows = $q->with(['unidad', 'solicitante'])
        ->orderBy('fecha_salida')
        ->get()
        ->map(function ($row) {
            foreach (['origen', 'destino', 'motivo_actividad', 'comentario_jefe'] as $field) {
                if (! empty($row->{$field}) && is_string($row->{$field})) {
                    // limpieza REAL de bytes inválidos
                    $row->{$field} = iconv('UTF-8', 'UTF-8//IGNORE', $row->{$field});
                }
            }

            return $row;
        });

    $from = $request->filled('date_from') ? \Carbon\Carbon::parse($request->input('date_from'))->format('d/m/Y') : 'Inicio';
    $to = $request->filled('date_to') ? \Carbon\Carbon::parse($request->input('date_to'))->format('d/m/Y') : 'Fin';
    $rangeLabel = "Periodo: {$from} al {$to}";

    $pdf = Pdf::loadView('reports.solicitudes_transporte_pdf', [
        'rows' => $rows,
        'rangeLabel' => $rangeLabel,
    ])
        ->setPaper('a4', 'landscape')
        ->setWarnings(false);

    $filename = 'reporte_solicitudes_'.now()->format('Ymd_His').'.pdf';

    return response()->streamDownload(fn () => print ($pdf->output()), $filename, [
        'Content-Type' => 'application/pdf',
    ]);
})->name('reportes.solicitudes-transporte.pdf');

// PDF Mantenimiento
Route::get('/reportes/solicitudes-mantenimiento/pdf', function (Request $request) {
    abort_unless(auth()->check() && auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'operativo', 'liquidador']), 403);

    $q = SolicitudMantenimiento::query();
    $dateField = $request->string('date_field', 'fecha_sugerida')->toString();

    if ($request->filled('date_from')) {
        $q->where($dateField, '>=', $request->input('date_from'));
    }
    if ($request->filled('date_to')) {
        $q->where($dateField, '<=', $request->input('date_to'));
    }

    if ($request->filled('veh_tipo_mantenimiento_id')) {
        $q->where('veh_tipo_mantenimiento_id', $request->input('veh_tipo_mantenimiento_id'));
    }
    if ($request->filled('estado')) {
        $q->where('estado', $request->input('estado'));
    }
    if ($request->filled('prioridad')) {
        $q->where('prioridad', $request->input('prioridad'));
    }
    if ($request->filled('tipo_solicitud')) {
        $q->where('tipo_solicitud', $request->input('tipo_solicitud'));
    }

    $rows = $q->with(['vehiculo.vehMarca', 'vehiculo.vehModelo', 'tipoMantenimiento', 'solicitante', 'aprobador'])
        ->orderBy('fecha_sugerida')
        ->get()
        ->map(function ($row) {
            foreach (['detalle', 'observaciones', 'motivo_rechazo'] as $field) {
                if (! empty($row->{$field}) && is_string($row->{$field})) {
                    $row->{$field} = iconv('UTF-8', 'UTF-8//IGNORE', $row->{$field});
                }
            }

            return $row;
        });

    $from = $request->filled('date_from') ? \Carbon\Carbon::parse($request->input('date_from'))->format('d/m/Y') : 'Inicio';
    $to = $request->filled('date_to') ? \Carbon\Carbon::parse($request->input('date_to'))->format('d/m/Y') : 'Fin';
    $rangeLabel = "Periodo: {$from} al {$to}";

    $pdf = Pdf::loadView('reports.solicitudes_mantenimiento_pdf', [
        'rows' => $rows,
        'rangeLabel' => $rangeLabel,
    ])
        ->setPaper('a4', 'landscape')
        ->setWarnings(false);

    return response()->streamDownload(
        fn () => print ($pdf->output()),
        'reporte_mantenimiento_'.now()->format('Ymd_His').'.pdf',
        ['Content-Type' => 'application/pdf']
    );
})->name('reportes.solicitudes-mantenimiento.pdf');

// PDF Combustible
Route::get('/reportes/solicitudes-combustible/pdf', function (Request $request) {
    abort_unless(auth()->check() && auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'operativo', 'liquidador']), 403);

    $q = SolicitudCombustible::query();
    $dateField = $request->string('date_field', 'fecha_solicitud')->toString();

    if ($request->filled('date_from')) {
        $q->where($dateField, '>=', $request->input('date_from'));
    }
    if ($request->filled('date_to')) {
        $q->where($dateField, '<=', $request->input('date_to'));
    }

    if ($request->filled('vehiculo_id')) {
        $q->where('vehiculo_id', $request->input('vehiculo_id'));
    }
    if ($request->filled('estado')) {
        $q->where('estado', $request->input('estado'));
    }
    if ($request->filled('prioridad')) {
        $q->where('prioridad', $request->input('prioridad'));
    }
    if ($request->filled('forma_pago')) {
        $q->where('forma_pago', $request->input('forma_pago'));
    }

    $rows = $q->with(['vehiculo.vehMarca', 'vehiculo.vehModelo', 'motorista', 'solicitante', 'aprobador'])
        ->orderBy('fecha_solicitud')
        ->get()
        ->map(function ($row) {
            foreach (['destino_actividad', 'observaciones', 'motivo_rechazo'] as $field) {
                if (! empty($row->{$field}) && is_string($row->{$field})) {
                    $row->{$field} = iconv('UTF-8', 'UTF-8//IGNORE', $row->{$field});
                }
            }

            return $row;
        });

    $from = $request->filled('date_from') ? \Carbon\Carbon::parse($request->input('date_from'))->format('d/m/Y') : 'Inicio';
    $to = $request->filled('date_to') ? \Carbon\Carbon::parse($request->input('date_to'))->format('d/m/Y') : 'Fin';
    $rangeLabel = "Periodo: {$from} al {$to}";

    $pdf = Pdf::loadView('reports.solicitudes_combustible_pdf', [
        'rows' => $rows,
        'rangeLabel' => $rangeLabel,
    ])
        ->setPaper('a4', 'landscape')
        ->setWarnings(false);

    return response()->streamDownload(
        fn () => print ($pdf->output()),
        'reporte_combustible_'.now()->format('Ymd_His').'.pdf',
        ['Content-Type' => 'application/pdf']
    );
})->name('reportes.solicitudes-combustible.pdf');

// Excel Combustible
Route::get('/reportes/solicitudes-combustible/excel', function (Request $request) {
    abort_unless(auth()->check() && auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'operativo', 'liquidador']), 403);

    $q = SolicitudCombustible::query();
    $dateField = $request->string('date_field', 'fecha_solicitud')->toString();

    if ($request->filled('date_from')) {
        $q->where($dateField, '>=', $request->input('date_from'));
    }
    if ($request->filled('date_to')) {
        $q->where($dateField, '<=', $request->input('date_to'));
    }
    if ($request->filled('vehiculo_id')) {
        $q->where('vehiculo_id', $request->input('vehiculo_id'));
    }
    if ($request->filled('estado')) {
        $q->where('estado', $request->input('estado'));
    }
    if ($request->filled('prioridad')) {
        $q->where('prioridad', $request->input('prioridad'));
    }
    if ($request->filled('forma_pago')) {
        $q->where('forma_pago', $request->input('forma_pago'));
    }

    $filename = 'reporte_combustible_'.now()->format('Ymd_His').'.xlsx';

    return Excel::download(new SolicitudesCombustibleExport($q), $filename);
})->name('reportes.solicitudes-combustible.excel');

// Excel Mantenimiento
Route::get('/reportes/solicitudes-mantenimiento/excel', function (Request $request) {
    abort_unless(auth()->check() && auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'operativo', 'liquidador']), 403);

    $q = SolicitudMantenimiento::query();

    $dateField = $request->string('date_field', 'fecha_sugerida')->toString();

    if ($request->filled('date_from')) {
        $q->where($dateField, '>=', $request->input('date_from'));
    }
    if ($request->filled('date_to')) {
        $q->where($dateField, '<=', $request->input('date_to'));
    }

    if ($request->filled('vehiculo_id')) {
        $q->where('vehiculo_id', $request->input('vehiculo_id'));
    }
    if ($request->filled('estado')) {
        $q->where('estado', $request->input('estado'));
    }
    if ($request->filled('prioridad')) {
        $q->where('prioridad', $request->input('prioridad'));
    }
    if ($request->filled('tipo_solicitud')) {
        $q->where('tipo_solicitud', $request->input('tipo_solicitud'));
    }

    $filename = 'reporte_mantenimiento_'.now()->format('Ymd_His').'.xlsx';

    return Excel::download(new SolicitudesMantenimientoExport($q), $filename);
})->name('reportes.solicitudes-mantenimiento.excel');

// ---------------------- REPORTES -------------------------------------------------------------------------------------------------------//
Route::get('/reportes/flota-vehicular/pdf', [ReporteFlotaVehicularController::class, 'pdf'])
    ->name('reportes.flota-vehicular.pdf');

Route::get('/reportes/control-mensual-combustible/pdf', [ReporteControlMensualCombustibleController::class, 'pdf'])
    ->name('reportes.control-mensual-combustible.pdf');

Route::get('/reportes/distribucion-cargas/pdf', [ReporteDistribucionCargasCombustibleController::class, 'pdf'])
    ->name('reportes.distribucion-cargas.pdf');

Route::get('/reportes/lote-combustible/{lote}/pdf', [ReporteLoteCombustibleController::class, 'pdf'])
    ->name('reportes.lote-combustible.pdf');

Route::get('/reportes/general-servicios/pdf', [ReporteGeneralServiciosController::class, 'pdf'])
    ->name('reportes.general-servicios.pdf');

// En routes/web.php
Route::get('/reporte-mision-oficial/{solicitud?}', [ReporteMisionOficialController::class, 'pdf'])
    ->name('reportes.mision-oficial.pdf');

Route::get('/reportes/orden-trabajo/pdf', action: [ReporteOrdenTrabajoController::class, 'pdf'])
    ->name('reportes.orden-trabajo.pdf');

Route::get('/reportes/recepcion-entrega-vehiculo/pdf', [ReporteRecepcionEntregaVehiculoController::class, 'pdf'])
    ->name('reportes.recepcion-entrega.pdf');

// Ruta para las liquidaciones unificadas
Route::get('/liquidacion/combustible/{id}', [LiquidacionCombustibleController::class, 'pdf'])
    ->name('liquidacion.combustible.pdf');

Route::get('/liquidacion/mantenimiento/{id}', [LiquidacionMantenimientoController::class, 'pdf'])
    ->name('liquidacion.mantenimiento.pdf');

// ----------------------- NUEVOS REPORTES FILAMENT -----------------------//
Route::get('/reportes/plan-diario', [ReportePlanDiarioController::class, 'index'])
    ->name('reportes.plan-diario.index');

Route::get('/reportes/plan-diario/{fecha}/pdf', [ReportePlanDiarioController::class, 'pdf'])
    ->name('reportes.plan-diario.pdf');

Route::get('/reportes/lote-combustible/{lote}/pdf', [ReporteLoteCombustibleController::class, 'pdf'])
    ->name('reportes.lote-combustible.pdf');
