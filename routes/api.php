<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TokenAuthController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SolicitudTransporteController;

// ✅ AUTH POR TOKEN (PUBLICO)
Route::post('/auth/login', [TokenAuthController::class, 'login']);

// ✅ TODO lo protegido
Route::middleware('auth:sanctum')->group(function () {

    // ✅ Usuario autenticado (puedes usar tu AuthController o TokenAuthController)
    Route::get('/auth/me', [TokenAuthController::class, 'me']);
    Route::post('/auth/logout', [TokenAuthController::class, 'logout']);

    // si quieres mantener /api/user por compatibilidad:
    Route::get('/user', [AuthController::class, 'user']);

    Route::get('/dashboard/summary', function () {
    return response()->json([
        'pending'     => 0,
        'in_progress' => 0,
        'accepted'    => 0,
        'completed'   => 0,
    ]);
    });

    Route::get('/solicitudes/recientes', function () {
        return response()->json(['data' => []]);
    });

Route::apiResource('transport-requests', SolicitudTransporteController::class);
    Route::post('transport-requests/{solicitud}/enviar', [SolicitudTransporteController::class, 'enviar']);

    Route::middleware('role:jefe')->group(function () {
        Route::post('transport-requests/{solicitud}/observacion', [SolicitudTransporteController::class, 'observacion']);
        Route::post('transport-requests/{solicitud}/aprobar', [SolicitudTransporteController::class, 'aprobar']);
        Route::post('transport-requests/{solicitud}/rechazar', [SolicitudTransporteController::class, 'rechazar']);
    });
});
