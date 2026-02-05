<?php
//Creado para fusion API y FRONTEND
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SolicitudTransporteController;

Route::post('/login', [AuthController::class, 'login'])->middleware('web');Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {

    // Solicitantes (usuarios) - sus solicitudes
    Route::apiResource('solicitudes-transporte', SolicitudTransporteController::class);

    // Acciones del solicitante
    Route::post('solicitudes-transporte/{solicitud}/enviar', [SolicitudTransporteController::class, 'enviar']);

    // Acciones del jefe (PO)
    Route::middleware('role:jefe')->group(function () {
        Route::post('solicitudes-transporte/{solicitud}/observacion', [SolicitudTransporteController::class, 'observacion']);
        Route::post('solicitudes-transporte/{solicitud}/aprobar', [SolicitudTransporteController::class, 'aprobar']);
        Route::post('solicitudes-transporte/{solicitud}/rechazar', [SolicitudTransporteController::class, 'rechazar']);
    });
});
