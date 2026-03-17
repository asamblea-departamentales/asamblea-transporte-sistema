<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\TokenAuthController;
use App\Http\Controllers\Api\SolicitudTransporteController;
use App\Http\Controllers\Api\SolicitudMantenimientoController;
use App\Http\Controllers\Api\SolicitudCombustibleController;
use App\Models\SolicitudTransporte;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\SolicitudMantenimiento;

// AUTH POR TOKEN (PUBLICO)
Route::post('/auth/login', [TokenAuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    // Usuario autenticado
    Route::get('/auth/me',      [TokenAuthController::class, 'me']);
    Route::post('/auth/logout', [TokenAuthController::class, 'logout']);
    Route::get('/user',         [TokenAuthController::class, 'me']);

    // Dashboard Summary (Transporte + Mantenimiento + Combustible)
    Route::get('/dashboard/summary', function () {
        $user = request()->user();

        $qTransporte    = \App\Models\SolicitudTransporte::query();
        $qMantenimiento = \App\Models\SolicitudMantenimiento::query();
        $qCombustible   = \App\Models\SolicitudCombustible::query();

        if (!$user->hasAnyRole(['jefe', 'admin', 'ti'])) {
            $qTransporte->where('solicitante_id', $user->id);
            $qMantenimiento->where('solicitante_id', $user->id);
            $qCombustible->where('solicitante_id', $user->id);
        }

        $estadosPendientes   = [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION];
        $estadosEnProceso    = [EstadoSolicitudEnum::PROGRAMADA, EstadoSolicitudEnum::EN_EJECUCION];
        $estadosAprobados    = [EstadoSolicitudEnum::APROBADA, EstadoSolicitudEnum::PRE_APROBADA];
        $estadoCompletado    = EstadoSolicitudEnum::COMPLETADA;

        return response()->json([
            'pending' => (clone $qTransporte)->whereIn('estado', $estadosPendientes)->count()
                       + (clone $qMantenimiento)->whereIn('estado', $estadosPendientes)->count()
                       + (clone $qCombustible)->whereIn('estado', $estadosPendientes)->count(),

            'in_progress' => (clone $qTransporte)->whereIn('estado', $estadosEnProceso)->count()
                           + (clone $qMantenimiento)->whereIn('estado', $estadosEnProceso)->count()
                           + (clone $qCombustible)->whereIn('estado', $estadosEnProceso)->count(),

            'accepted' => (clone $qTransporte)->whereIn('estado', $estadosAprobados)->count()
                        + (clone $qMantenimiento)->whereIn('estado', $estadosAprobados)->count()
                        + (clone $qCombustible)->whereIn('estado', $estadosAprobados)->count(),

            'completed' => (clone $qTransporte)->where('estado', $estadoCompletado)->count()
                         + (clone $qMantenimiento)->where('estado', $estadoCompletado)->count()
                         + (clone $qCombustible)->where('estado', $estadoCompletado)->count(),

            // Desglose por módulo si el frontend lo necesita
            'by_module' => [
                'transporte' => [
                    'pending'     => (clone $qTransporte)->whereIn('estado', $estadosPendientes)->count(),
                    'in_progress' => (clone $qTransporte)->whereIn('estado', $estadosEnProceso)->count(),
                    'accepted'    => (clone $qTransporte)->whereIn('estado', $estadosAprobados)->count(),
                    'completed'   => (clone $qTransporte)->where('estado', $estadoCompletado)->count(),
                ],
                'mantenimiento' => [
                    'pending'     => (clone $qMantenimiento)->whereIn('estado', $estadosPendientes)->count(),
                    'in_progress' => (clone $qMantenimiento)->whereIn('estado', $estadosEnProceso)->count(),
                    'accepted'    => (clone $qMantenimiento)->whereIn('estado', $estadosAprobados)->count(),
                    'completed'   => (clone $qMantenimiento)->where('estado', $estadoCompletado)->count(),
                ],
                'combustible' => [
                    'pending'     => (clone $qCombustible)->whereIn('estado', $estadosPendientes)->count(),
                    'in_progress' => (clone $qCombustible)->whereIn('estado', $estadosEnProceso)->count(),
                    'accepted'    => (clone $qCombustible)->whereIn('estado', $estadosAprobados)->count(),
                    'completed'   => (clone $qCombustible)->where('estado', $estadoCompletado)->count(),
                ],
            ],
        ]);
    });

    // Solicitudes Recientes (Transporte + Mantenimiento + Combustible)
    Route::get('/solicitudes/recientes', function () {
        $user = request()->user();

        $qTransporte    = \App\Models\SolicitudTransporte::query();
        $qMantenimiento = \App\Models\SolicitudMantenimiento::query();
        $qCombustible   = \App\Models\SolicitudCombustible::query();

        if (!$user->hasAnyRole(['jefe', 'admin', 'ti'])) {
            $qTransporte->where('solicitante_id', $user->id);
            $qMantenimiento->where('solicitante_id', $user->id);
            $qCombustible->where('solicitante_id', $user->id);
        }

        $transporte = $qTransporte->latest('created_at')->take(5)->get()
            ->map(fn ($s) => [
                'code'   => $s->codigo,
                'date'   => optional($s->fecha_salida ?? $s->created_at)->format('Y-m-d H:i'),
                'type'   => 'Transporte',
                'status' => $s->estado?->value ?? (string) $s->estado,
            ]);

        $mantenimiento = $qMantenimiento->latest('created_at')->take(5)->get()
            ->map(fn ($s) => [
                'code'   => $s->codigo,
                'date'   => optional($s->fecha_sugerida ?? $s->created_at)->format('Y-m-d H:i'),
                'type'   => 'Mantenimiento',
                'status' => $s->estado?->value ?? (string) $s->estado,
            ]);

        $combustible = $qCombustible->latest('created_at')->take(5)->get()
            ->map(fn ($s) => [
                'code'   => $s->codigo,
                'date'   => optional($s->fecha_solicitud ?? $s->created_at)->format('Y-m-d H:i'),
                'type'   => 'Combustible',
                'status' => $s->estado?->value ?? (string) $s->estado,
            ]);

        // Combinar, ordenar por fecha y tomar los 10 más recientes
        $rows = $transporte
            ->concat($mantenimiento)
            ->concat($combustible)
            ->sortByDesc('date')
            ->take(10)
            ->values();

        return response()->json(['data' => $rows]);
    });

    // ── TRANSPORTE ──────────────────────────────────────────────────
    Route::apiResource('solicitudes-transporte', SolicitudTransporteController::class)
        ->only(['index', 'store', 'show'])
        ->parameters(['solicitudes-transporte' => 'solicitud']);

    Route::post('solicitudes-transporte/{solicitud}/enviar',    [SolicitudTransporteController::class, 'enviar']);
    Route::post('solicitudes-transporte/{solicitud}/finalizar', [SolicitudTransporteController::class, 'finalizar']);

    Route::middleware('role:jefe|admin|ti')->group(function () {
        Route::post('solicitudes-transporte/{solicitud}/observacion', [SolicitudTransporteController::class, 'observacion']);
        Route::post('solicitudes-transporte/{solicitud}/aprobar',     [SolicitudTransporteController::class, 'aprobar']);
        Route::post('solicitudes-transporte/{solicitud}/rechazar',    [SolicitudTransporteController::class, 'rechazar']);
    });

    // ── MANTENIMIENTO ───────────────────────────────────────────────
    Route::apiResource('solicitudes-mantenimiento', SolicitudMantenimientoController::class)
        ->only(['index', 'store', 'show'])
        ->parameters(['solicitudes-mantenimiento' => 'solicitud']);

    Route::post('solicitudes-mantenimiento/{solicitud}/enviar',    [SolicitudMantenimientoController::class, 'enviar']);
    Route::post('solicitudes-mantenimiento/{solicitud}/finalizar', [SolicitudMantenimientoController::class, 'finalizar']);

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

    Route::post('solicitudes-combustible/{solicitud}/enviar',    [SolicitudCombustibleController::class, 'enviar']);
    Route::post('solicitudes-combustible/{solicitud}/finalizar', [SolicitudCombustibleController::class, 'finalizar']);

    Route::middleware('role:jefe|admin|ti')->group(function () {
        Route::post('solicitudes-combustible/{solicitud}/observacion', [SolicitudCombustibleController::class, 'observacion']);
        Route::post('solicitudes-combustible/{solicitud}/pre-aprobar', [SolicitudCombustibleController::class, 'preAprobar']);
        Route::post('solicitudes-combustible/{solicitud}/aprobar',     [SolicitudCombustibleController::class, 'aprobar']);
        Route::post('solicitudes-combustible/{solicitud}/rechazar',    [SolicitudCombustibleController::class, 'rechazar']);
    });

    // ── CATÁLOGOS (para el frontend) ────────────────────────
    Route::prefix('catalogos')->group(function () {

        Route::get('/vehiculos', function () {
    return response()->json(
        \App\Models\Vehiculo::with([
            'marca', 
            'modelo', 
            'tipo', 
            'asignacionVigenteMotorista.motorista'
        ])
        ->where('activo', true)
        ->get()
        ->map(fn ($v) => [
            'id'     => $v->id,
            'placa'  => $v->placa,
            'marca'  => $v->getRelation('marca')?->nombre ?? $v->marca, 
            'modelo' => $v->getRelation('modelo')?->nombre ?? $v->modelo,
            'tipo'   => $v->tipo?->nombre,
            
            // 🔥 AGREGAR ESTA LÍNEA EXACTA AQUÍ:
            'motorista_id'     => $v->asignacionVigenteMotorista?->motorista_id,

            'motorista_nombre' => $v->asignacionVigenteMotorista?->motorista?->nombre ?? 'Sin motorista',
            'motorista_dui'    => $v->asignacionVigenteMotorista?->motorista?->dui,
            'label'  => "{$v->placa} — " . ($v->getRelation('marca')?->nombre ?? $v->marca),
        ])
    );
});

        Route::get('/motoristas', function () {
            return response()->json(
                \App\Models\Motorista::where('activo', true)
                    ->get()
                    ->map(fn ($m) => [
                        'id'     => $m->id,
                        'nombre' => $m->nombre,
                        'dui'    => $m->dui,
                    ])
            );
        });

        Route::get('/marcas', function () {
            return response()->json(
                \App\Models\VehMarca::where('activo', true)
                    ->orderBy('nombre')
                    ->get(['id', 'nombre'])
            );
        });

        Route::get('/modelos', function (Request $request) {
            $query = \App\Models\VehModelo::with('marca')->where('activo', true);

            if ($request->has('veh_marca_id')) {
                $query->where('veh_marca_id', $request->veh_marca_id);
            }

            return response()->json(
                $query->get()->map(fn($m) => [
                    'id' => $m->id,
                    'nombre' => $m->nombre,
                    'veh_marca_id' => $m->veh_marca_id,
                    'marca_nombre' => $m->marca?->nombre,
                ])
            );
        });

        Route::get('/tipos-mantenimiento', function () {
            return response()->json(
                \App\Models\VehTipoMantenimiento::where('activo', true)
                    ->get(['id', 'nombre'])
            );
        });

    }); // Cierra catalogos

}); // Cierra sanctum