<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TokenAuthController;
use App\Http\Controllers\Api\SolicitudTransporteController;
use App\Http\Controllers\Api\SolicitudMantenimientoController;
use App\Http\Controllers\Api\SolicitudCombustibleController;
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

    // ── TRANSPORTE ──────────────────────────────────────────────────
    Route::apiResource('solicitudes-transporte', SolicitudTransporteController::class)
        ->only(['index', 'store', 'show'])
        ->parameters(['solicitudes-transporte' => 'solicitud']);

    // Acciones del Solicitante
    Route::post('solicitudes-transporte/{solicitud}/enviar',    [SolicitudTransporteController::class, 'enviar']);
    Route::post('solicitudes-transporte/{solicitud}/finalizar', [SolicitudTransporteController::class, 'finalizar']);

    // Acciones de Jefatura (Roles protegidos)
    Route::middleware('role:jefe|admin|ti')->group(function () {
        Route::post('solicitudes-transporte/{solicitud}/observacion', [SolicitudTransporteController::class, 'observacion']);
        Route::post('solicitudes-transporte/{solicitud}/aprobar',     [SolicitudTransporteController::class, 'aprobar']);
        Route::post('solicitudes-transporte/{solicitud}/rechazar',    [SolicitudTransporteController::class, 'rechazar']);
    });

    // ── MANTENIMIENTO ───────────────────────────────────────────────
    Route::apiResource('solicitudes-mantenimiento', SolicitudMantenimientoController::class)
        ->only(['index', 'store', 'show'])
        ->parameters(['solicitudes-mantenimiento' => 'solicitud']);

    // Acciones del Solicitante
    Route::post('solicitudes-mantenimiento/{solicitud}/enviar',    [SolicitudMantenimientoController::class, 'enviar']);
    Route::post('solicitudes-mantenimiento/{solicitud}/finalizar', [SolicitudMantenimientoController::class, 'finalizar']);
    //Route::post('solicitudes-mantenimiento/{solicitud}/cancelar',  [SolicitudMantenimientoController::class, 'cancelar']);

    // Acciones de Jefatura (Roles protegidos)
    Route::middleware('role:jefe|admin|ti')->group(function () {
        Route::post('solicitudes-mantenimiento/{solicitud}/observacion',  [SolicitudMantenimientoController::class, 'observacion']);
        Route::post('solicitudes-mantenimiento/{solicitud}/pre-aprobar',  [SolicitudMantenimientoController::class, 'preAprobar']);
        Route::post('solicitudes-mantenimiento/{solicitud}/aprobar',      [SolicitudMantenimientoController::class, 'aprobar']);
        Route::post('solicitudes-mantenimiento/{solicitud}/rechazar',     [SolicitudMantenimientoController::class, 'rechazar']);
        Route::post('solicitudes-mantenimiento/{solicitud}/en-ejecucion', [SolicitudMantenimientoController::class, 'iniciarEjecucion']);
    });

    // ── COMBUSTIBLE ─────────────────────────────────────────────────
    Route::apiResource('solicitudes-combustible', SolicitudCombustibleController::class)
        ->only(['index', 'store', 'show'])
        ->parameters(['solicitudes-combustible' => 'solicitud']);

    // Acciones del Solicitante
    Route::post('solicitudes-combustible/{solicitud}/enviar',    [SolicitudCombustibleController::class, 'enviar']);
    Route::post('solicitudes-combustible/{solicitud}/finalizar', [SolicitudCombustibleController::class, 'finalizar']);
    //Route::post('solicitudes-combustible/{solicitud}/cancelar',  [SolicitudCombustibleController::class, 'cancelar']);

    // Acciones de Jefatura (Roles protegidos)
    Route::middleware('role:jefe|admin|ti')->group(function () {
        Route::post('solicitudes-combustible/{solicitud}/observacion', [SolicitudCombustibleController::class, 'observacion']);
        Route::post('solicitudes-combustible/{solicitud}/pre-aprobar', [SolicitudCombustibleController::class, 'preAprobar']);
        Route::post('solicitudes-combustible/{solicitud}/aprobar',     [SolicitudCombustibleController::class, 'aprobar']);
        Route::post('solicitudes-combustible/{solicitud}/rechazar',    [SolicitudCombustibleController::class, 'rechazar']);
    });

});