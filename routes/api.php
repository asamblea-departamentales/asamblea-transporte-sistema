<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SolicitudTransporteController;

// Login (público)
 Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas con Sanctum
Route::middleware('auth:sanctum')->group(function () {

    // Usuario autenticado
    Route::get('/user', [AuthController::class, 'user']);

    // Logout
    Route::post('/logout', function (Request $request) {
        // Si estás usando tokens de Sanctum
        if ($request->user()) {
            $request->user()->tokens()->delete();
        }

        // Por si hay sesión (no estorba)
        auth()->logout();

        return response()->json([
            'message' => 'Logout exitoso',
        ]);
    });

    // ✅ RUTAS “COMPATIBILIDAD FRONTEND” (para que no de 404)
    Route::get('/dashboard/summary', function () {
        return response()->json([
            'total_solicitudes' => 0,
            'pendientes' => 0,
            'aprobadas' => 0,
            'rechazadas' => 0,
        ]);
    });

    Route::get('/solicitudes/recientes', function () {
        return response()->json([
            'data' => [],
        ]);
    });

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
