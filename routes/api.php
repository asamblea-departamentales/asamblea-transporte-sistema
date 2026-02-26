<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TokenAuthController;
use App\Http\Controllers\Api\SolicitudTransporteController;
use App\Http\Controllers\Api\SolicitudMantenimientoController;
use App\Models\SolicitudTransporte;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;

// AUTH POR TOKEN (PUBLICO)
Route::post('/auth/login', [TokenAuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    // Usuario autenticado
    Route::get('/auth/me',      [TokenAuthController::class, 'me']);
    Route::post('/auth/logout', [TokenAuthController::class, 'logout']);
    Route::get('/user',         [TokenAuthController::class, 'me']);

    // Dashboard Summary (por ahora solo Transporte)
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

    // Solicitudes Recientes (por ahora solo Transporte)
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

    // ── TRANSPORTE ───────────────────────────────────────────
    Route::apiResource('transport-requests', SolicitudTransporteController::class)
        ->only(['index', 'store', 'show']);

    // Acciones del Solicitante
    Route::post('transport-requests/{solicitud}/enviar',    [SolicitudTransporteController::class, 'enviar']);
    Route::post('transport-requests/{solicitud}/finalizar', [SolicitudTransporteController::class, 'finalizar']);

    // Acciones de Jefatura
    Route::middleware('role:jefe|admin|ti')->group(function () {
        Route::post('transport-requests/{solicitud}/observacion', [SolicitudTransporteController::class, 'observacion']);
        Route::post('transport-requests/{solicitud}/aprobar',     [SolicitudTransporteController::class, 'aprobar']);
        Route::post('transport-requests/{solicitud}/rechazar',    [SolicitudTransporteController::class, 'rechazar']);
    });

    // ── MANTENIMIENTO ────────────────────────────────────────
    Route::apiResource('maintenance-requests', SolicitudMantenimientoController::class)
        ->only(['index', 'store', 'show']);

    // Acciones del Solicitante
    Route::post('maintenance-requests/{solicitud}/enviar',    [SolicitudMantenimientoController::class, 'enviar']);
    Route::post('maintenance-requests/{solicitud}/completar', [SolicitudMantenimientoController::class, 'completar']);
    Route::post('maintenance-requests/{solicitud}/cancelar',  [SolicitudMantenimientoController::class, 'cancelar']);

    // Acciones de Jefatura
    Route::middleware('role:jefe|admin|ti')->group(function () {
        Route::post('maintenance-requests/{solicitud}/observacion',  [SolicitudMantenimientoController::class, 'observacion']);
        Route::post('maintenance-requests/{solicitud}/pre-aprobar',  [SolicitudMantenimientoController::class, 'preAprobar']);
        Route::post('maintenance-requests/{solicitud}/aprobar',      [SolicitudMantenimientoController::class, 'aprobar']);
        Route::post('maintenance-requests/{solicitud}/rechazar',     [SolicitudMantenimientoController::class, 'rechazar']);
        Route::post('maintenance-requests/{solicitud}/en-ejecucion', [SolicitudMantenimientoController::class, 'iniciarEjecucion']);
    });

});