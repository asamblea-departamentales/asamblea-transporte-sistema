<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TokenAuthController;
//use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SolicitudTransporteController;
use App\Models\SolicitudTransporte;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;


// ✅ AUTH POR TOKEN (PUBLICO)
Route::post('/auth/login', [TokenAuthController::class, 'login']);

// ✅ TODO lo protegido
Route::middleware('auth:sanctum')->group(function () {

    // ✅ Usuario autenticado (puedes usar tu AuthController o TokenAuthController)
    Route::get('/auth/me', [TokenAuthController::class, 'me']);
    Route::post('/auth/logout', [TokenAuthController::class, 'logout']);

    // si quieres mantener /api/user por compatibilidad:
    Route::get('/user', [TokenAuthController::class, 'me']);

    Route::get('/dashboard/summary', function () {
    $user = request()->user();

    $q = SolicitudTransporte::query();

    if (! $user->hasRole('jefe')) {
        $q->where('solicitante_id', $user->id);
    }

    return response()->json([
        'pending'     => (clone $q)->whereIn('estado', [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION])->count(),
        'in_progress' => (clone $q)->whereIn('estado', [EstadoSolicitudEnum::PROGRAMADA, EstadoSolicitudEnum::EN_EJECUCION])->count(),
        'accepted'    => (clone $q)->where('estado', EstadoSolicitudEnum::APROBADA)->count(),
        'completed'   => (clone $q)->where('estado', EstadoSolicitudEnum::COMPLETADA)->count(),
    ]);
});


    Route::get('/solicitudes/recientes', function () {
    $user = request()->user();

    $q = SolicitudTransporte::query();

    // ✅ si NO es jefe, solo ve las suyas
    if (! $user->hasRole('jefe')) {
        $q->where('solicitante_id', $user->id);
    }

    $rows = $q->latest('created_at')
        ->take(5)
        ->get()
        ->map(fn ($s) => [
            'code'   => $s->codigo,
            // yo pondría fecha_salida porque tiene más sentido en transporte,
            // si no existe (null), cae a created_at
            'date'   => optional($s->fecha_salida ?? $s->created_at)->format('Y-m-d H:i'),
            'type'   => 'Transporte',
            'status' => $s->estado?->value ?? (string) $s->estado,
        ]);

    return response()->json(['data' => $rows]);
});


Route::apiResource('transport-requests', SolicitudTransporteController::class);
    Route::post('transport-requests/{solicitud}/enviar', [SolicitudTransporteController::class, 'enviar']);

    Route::middleware('role:jefe')->group(function () {
        Route::post('transport-requests/{solicitud}/observacion', [SolicitudTransporteController::class, 'observacion']);
        Route::post('transport-requests/{solicitud}/aprobar', [SolicitudTransporteController::class, 'aprobar']);
        Route::post('transport-requests/{solicitud}/rechazar', [SolicitudTransporteController::class, 'rechazar']);
    });
});
