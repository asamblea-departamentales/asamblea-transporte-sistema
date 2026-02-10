<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TokenAuthController;
use App\Http\Controllers\Api\SolicitudTransporteController;
use App\Models\SolicitudTransporte;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;

// AUTH POR TOKEN (PUBLICO)
Route::post('/auth/login', [TokenAuthController::class, 'login']);

// TODO lo protegido
Route::middleware('auth:sanctum')->group(function () {

    // Usuario autenticado
    Route::get('/auth/me', [TokenAuthController::class, 'me']);
    Route::post('/auth/logout', [TokenAuthController::class, 'logout']);
    Route::get('/user', [TokenAuthController::class, 'me']);

    // Dashboard Summary
    Route::get('/dashboard/summary', function () {
        $user = request()->user();
        $q = SolicitudTransporte::query();

        if (! $user->hasAnyRole(['jefe', 'admin', 'ti'])) {
            $q->where('solicitante_id', $user->id);
        }

        return response()->json([
            'pending'     => (clone $q)->whereIn('estado', [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION])->count(),
            'in_progress' => (clone $q)->whereIn('estado', [EstadoSolicitudEnum::PROGRAMADA, EstadoSolicitudEnum::EN_EJECUCION])->count(),
            'accepted'    => (clone $q)->where('estado', EstadoSolicitudEnum::APROBADA)->count(),
            'completed'   => (clone $q)->where('estado', EstadoSolicitudEnum::COMPLETADA)->count(),
        ]);
    });

    // Solicitudes Recientes
    Route::get('/solicitudes/recientes', function () {
        $user = request()->user();
        $q = SolicitudTransporte::query();

        if (! $user->hasAnyRole(['jefe', 'admin', 'ti'])) {
            $q->where('solicitante_id', $user->id);
        }

        $rows = $q->latest('created_at')
            ->take(5)
            ->get()
            ->map(fn ($s) => [
                'code'   => $s->codigo,
                'date'   => optional($s->fecha_salida ?? $s->created_at)->format('Y-m-d H:i'),
                'type'   => 'Transporte',
                'status' => $s->estado?->value ?? (string) $s->estado,
            ]);

        return response()->json(['data' => $rows]);
    });

    // CRUD de Solicitudes (transport-requests)
    Route::apiResource('transport-requests', SolicitudTransporteController::class);
    
    // Acciones del Solicitante
    Route::post('transport-requests/{solicitud}/enviar', [SolicitudTransporteController::class, 'enviar']);
    Route::post('transport-requests/{solicitud}/finalizar', [SolicitudTransporteController::class, 'finalizar']); // NUEVA RUTA

    // Acciones de Jefatura (Protegidas por rol)
    Route::middleware('role:jefe|admin|ti')->group(function () {
        Route::post('transport-requests/{solicitud}/observacion', [SolicitudTransporteController::class, 'observacion']);
        Route::post('transport-requests/{solicitud}/aprobar', [SolicitudTransporteController::class, 'aprobar']);
        Route::post('transport-requests/{solicitud}/rechazar', [SolicitudTransporteController::class, 'rechazar']);
    });

}); 