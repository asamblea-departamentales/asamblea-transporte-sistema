<?php

use App\Http\Controllers\LiquidacionCombustibleController;
use App\Http\Controllers\LiquidacionMantenimientoController;
use App\Http\Controllers\Reportes\ReporteControlMensualCombustibleController;
use App\Http\Controllers\Reportes\ReporteDistribucionCargasCombustibleController;
use App\Http\Controllers\Reportes\ReporteFlotaVehicularController;
use App\Http\Controllers\Reportes\ReporteGeneralServiciosController;
use App\Http\Controllers\Reportes\ReporteLoteCombustibleController;
use App\Http\Controllers\Reportes\ReporteMisionOficialController;
use App\Http\Controllers\Reportes\ReporteOrdenTrabajoController;
use App\Http\Controllers\Reportes\ReportePlanDiarioController;
use App\Http\Controllers\Reportes\ReporteRecepcionEntregaVehiculoController;
use App\Http\Controllers\Reportes\ReporteSolicitudAutorizacionController;
use App\Http\Controllers\Reportes\ReporteWebController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/admin');
});

// ✅ TEMPORAL: Registrar POST login manualmente para Filament
// Route::post('admin/login', function () {
//   return app(\Filament\Http\Controllers\Auth\LoginController::class)->store();
// })->name('filament.admin.auth.login.post');

// Para los reportes PDF de Transporte
Route::get('/reportes/solicitudes-transporte/pdf', [ReporteWebController::class, 'solicitudesTransportePdf'])
    ->name('reportes.solicitudes-transporte.pdf');

// PDF Mantenimiento
Route::get('/reportes/solicitudes-mantenimiento/pdf', [ReporteWebController::class, 'solicitudesMantenimientoPdf'])
    ->name('reportes.solicitudes-mantenimiento.pdf');

// PDF Combustible
Route::get('/reportes/solicitudes-combustible/pdf', [ReporteWebController::class, 'solicitudesCombustiblePdf'])
    ->name('reportes.solicitudes-combustible.pdf');

// Excel Combustible
Route::get('/reportes/solicitudes-combustible/excel', [ReporteWebController::class, 'solicitudesCombustibleExcel'])
    ->name('reportes.solicitudes-combustible.excel');

// Excel Mantenimiento
Route::get('/reportes/solicitudes-mantenimiento/excel', [ReporteWebController::class, 'solicitudesMantenimientoExcel'])
    ->name('reportes.solicitudes-mantenimiento.excel');

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

Route::get('/reportes/solicitud-autorizacion/{solicitud}/pdf/{combustible?}', [ReporteSolicitudAutorizacionController::class, 'pdf'])
    ->name('reportes.solicitud-autorizacion.pdf');

Route::get('/reportes/orden-trabajo/pdf', action: [ReporteOrdenTrabajoController::class, 'pdf'])
    ->name('reportes.orden-trabajo.pdf');

Route::get('/reportes/recepcion-entrega-vehiculo/pdf', [ReporteRecepcionEntregaVehiculoController::class, 'pdf'])
    ->name('reportes.recepcion-entrega.pdf');

Route::get('/reportes/registro-vehiculos/pdf', [\App\Http\Controllers\Reportes\ReporteRegistroVehiculosController::class, 'pdf'])
    ->name('reportes.registro-vehiculos.pdf');

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

// --------------------------------- NUEVOS REPORTES CVS --------------------------------- //
// CSV Transporte
Route::get('/reportes/solicitudes-transporte/csv', [ReporteWebController::class, 'solicitudesTransporteCsv'])
    ->name('reportes.solicitudes-transporte.csv');

// CSV Mantenimiento
Route::get('/reportes/solicitudes-mantenimiento/csv', [ReporteWebController::class, 'solicitudesMantenimientoCsv'])
    ->name('reportes.solicitudes-mantenimiento.csv');

// CSV Combustible
Route::get('/reportes/solicitudes-combustible/csv', [ReporteWebController::class, 'solicitudesCombustibleCsv'])
    ->name('reportes.solicitudes-combustible.csv');

// --- AGREGAR ESTAS DOS ---
Route::get('/reportes/lote-combustible/{lote}/excel', [ReporteLoteCombustibleController::class, 'excel'])
    ->name('reportes.lote-combustible.excel');

Route::get('/reportes/lote-combustible/{lote}/csv', [ReporteLoteCombustibleController::class, 'csv'])
    ->name('reportes.lote-combustible.csv');
