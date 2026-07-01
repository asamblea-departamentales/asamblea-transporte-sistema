<?php

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Http\Controllers\Api\MotoristaEstadoController;
use App\Http\Controllers\Api\MotoristaViajeController;
use App\Http\Controllers\Api\SolicitudCombustibleController;
use App\Http\Controllers\Api\SolicitudMantenimientoController;
use App\Http\Controllers\Api\SolicitudTransporteController;
use App\Http\Controllers\Api\TokenAuthController;
use App\Models\Motorista;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// AUTH POR TOKEN (PUBLICO)
Route::post('/auth/login', [TokenAuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    // Usuario autenticado
    Route::get('/auth/me', [TokenAuthController::class, 'me']);
    Route::post('/auth/logout', [TokenAuthController::class, 'logout']);
    Route::get('/user', [TokenAuthController::class, 'me']);

    // Dashboard Summary (Transporte + Mantenimiento + Combustible)
    Route::get('/dashboard/summary', function () {
        $user = request()->user();

        $qTransporte = \App\Models\SolicitudTransporte::query();
        $qMantenimiento = \App\Models\SolicitudMantenimiento::query();
        $qCombustible = \App\Models\SolicitudCombustible::query();

        if (! $user->hasAnyRole(['jefe', 'admin', 'ti', 'super_admin'])) {
            $qTransporte->where('solicitante_id', $user->id);
            $qMantenimiento->where('solicitante_id', $user->id);
            $qCombustible->where('solicitante_id', $user->id);
        }

        $estadosPendientes = [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION];
        $estadosAprobados = [EstadoSolicitudEnum::APROBADA, EstadoSolicitudEnum::PRE_APROBADA];

        if ($user->hasRole('jefe')) {
            $estadosPendientes = [EstadoSolicitudEnum::PRE_APROBADA];
            // MINIMAL CHANGE: Excluir PRE_APROBADA de aprobados para evitar doble conteo en Jefes
            $estadosAprobados = [EstadoSolicitudEnum::APROBADA];
        }

        $estadosEnProceso = [EstadoSolicitudEnum::PROGRAMADA, EstadoSolicitudEnum::EN_EJECUCION];
        $estadoCompletado = EstadoSolicitudEnum::COMPLETADA;

        return response()->json([
            'pending' => (clone $qTransporte)->whereIn('estado', $estadosPendientes)->count()
                       + (clone $qMantenimiento)->whereIn('estado', $estadosPendientes)->count()
                       + (clone $qCombustible)->whereIn('estado', $estadosPendientes)->count(),

            'in_progress' => (clone $qTransporte)->whereIn('estado', $estadosEnProceso)->count()
                           + (clone $qMantenimiento)->whereIn('estado', $estadosEnProceso)->count()
                           + (clone $qCombustible)->whereIn('estado', $estadosEnProceso)->count(),

            'accepted' => (clone $qTransporte)->where('estado', EstadoSolicitudEnum::APROBADA)->count()
                        + (clone $qMantenimiento)->whereIn('estado', $estadosAprobados)->count()
                        + (clone $qCombustible)->whereIn('estado', $estadosAprobados)->count(),

            'completed' => (clone $qTransporte)->where('estado', $estadoCompletado)->count()
                         + (clone $qMantenimiento)->where('estado', $estadoCompletado)->count()
                         + (clone $qCombustible)->where('estado', $estadoCompletado)->count(),

            // Desglose por módulo si el frontend lo necesita
            'by_module' => [
                'transporte' => [
                    'pending' => (clone $qTransporte)->whereIn('estado', $estadosPendientes)->count(),
                    'in_progress' => (clone $qTransporte)->whereIn('estado', $estadosEnProceso)->count(),
                    'accepted' => (clone $qTransporte)->where('estado', EstadoSolicitudEnum::APROBADA)->count(),
                    'completed' => (clone $qTransporte)->where('estado', $estadoCompletado)->count(),
                ],
                'mantenimiento' => [
                    'pending' => (clone $qMantenimiento)->whereIn('estado', $estadosPendientes)->count(),
                    'in_progress' => (clone $qMantenimiento)->whereIn('estado', $estadosEnProceso)->count(),
                    'accepted' => (clone $qMantenimiento)->whereIn('estado', $estadosAprobados)->count(),
                    'completed' => (clone $qMantenimiento)->where('estado', $estadoCompletado)->count(),
                ],
                'combustible' => [
                    'pending' => (clone $qCombustible)->whereIn('estado', $estadosPendientes)->count(),
                    'in_progress' => (clone $qCombustible)->whereIn('estado', $estadosEnProceso)->count(),
                    'accepted' => (clone $qCombustible)->whereIn('estado', $estadosAprobados)->count(),
                    'completed' => (clone $qCombustible)->where('estado', $estadoCompletado)->count(),
                ],
            ],
        ]);
    });

    // Solicitudes Recientes (Transporte + Mantenimiento + Combustible)
    Route::get('/solicitudes/recientes', function () {
        $user = request()->user();

        $qTransporte = \App\Models\SolicitudTransporte::query();
        $qMantenimiento = \App\Models\SolicitudMantenimiento::query();
        $qCombustible = \App\Models\SolicitudCombustible::query();

        if (! $user->hasAnyRole(['jefe', 'admin', 'ti', 'super_admin'])) {
            $qTransporte->where('solicitante_id', $user->id);
            $qMantenimiento->where('solicitante_id', $user->id);
            $qCombustible->where('solicitante_id', $user->id);
        }

        $transporte = $qTransporte->latest('created_at')->take(5)->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'code' => $s->codigo,
                'ticket' => $s->ticket,
                'date' => optional($s->fecha_salida ?? $s->created_at)->format('Y-m-d H:i'),
                'type' => 'Transporte',
                'status' => $s->estado?->value ?? (string) $s->estado,
            ]);

        $mantenimiento = $qMantenimiento->latest('created_at')->take(5)->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'code' => $s->codigo,
                'ticket' => $s->ticket,
                'date' => optional($s->fecha_sugerida ?? $s->created_at)->format('Y-m-d H:i'),
                'type' => 'Mantenimiento',
                'status' => $s->estado?->value ?? (string) $s->estado,
            ]);

        $combustible = $qCombustible->latest('created_at')->take(5)->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'code' => $s->codigo,
                'ticket' => $s->ticket,
                'date' => optional($s->fecha_solicitud ?? $s->created_at)->format('Y-m-d H:i'),
                'type' => 'Combustible',
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
        ->only(['index', 'store'])
        ->parameters(['solicitudes-transporte' => 'solicitud']);

    Route::get('solicitudes-transporte/{solicitud:codigo}', [SolicitudTransporteController::class, 'show']);
    Route::post('solicitudes-transporte/{solicitud:codigo}/enviar', [SolicitudTransporteController::class, 'enviar']);
    Route::post('solicitudes-transporte/{solicitud:codigo}/finalizar', [SolicitudTransporteController::class, 'finalizar']);
    Route::post('solicitudes-transporte/{solicitud:codigo}/cancelar', [SolicitudTransporteController::class, 'cancelar']);

    Route::middleware('role:jefe|admin|ti|super_admin')->group(function () {
        Route::post('solicitudes-transporte/{solicitud:codigo}/aprobar', [SolicitudTransporteController::class, 'aprobar']);
        Route::post('solicitudes-transporte/{solicitud:codigo}/rechazar', [SolicitudTransporteController::class, 'rechazar']);

        // Módulo de Aprobación
        Route::get('solicitudes-transporte/{solicitud:codigo}/comparativa', [SolicitudTransporteController::class, 'comparativa']);
        Route::post('solicitudes-transporte/{solicitud:codigo}/aprobar-con-decision', [SolicitudTransporteController::class, 'aprobarConDecision']);
        Route::put('solicitudes-transporte/{solicitud:codigo}/reasignar', [SolicitudTransporteController::class, 'reasignar']);
        Route::post('solicitudes-transporte/{solicitud:codigo}/desbloquear', [SolicitudTransporteController::class, 'desbloquear']);
        Route::post('solicitudes-transporte/{solicitud:codigo}/programar', [SolicitudTransporteController::class, 'programar']);
        Route::post('solicitudes-transporte/{solicitud:codigo}/destinos', [SolicitudTransporteController::class, 'agregarDestinoViaje']);
        Route::get('recursos/disponibles', [SolicitudTransporteController::class, 'recursosDisponibles']);

        // Historial unificado para Jefatura: Transporte + Mantenimiento + Combustible
        Route::get('solicitudes/historial-jefatura', function (Request $request) {
            $user = $request->user();
            $perPage = $request->query('per_page', 15);

            $qTransporte = \App\Models\SolicitudTransporte::query()
                ->where(fn ($q) => $q->where('jefe_id', $user->id)->orWhere('decidido_por', $user->id))
                ->whereIn('estado', [EstadoSolicitudEnum::APROBADA, EstadoSolicitudEnum::PROGRAMADA, EstadoSolicitudEnum::COMPLETADA, EstadoSolicitudEnum::RECHAZADA]);

            $qMantenimiento = \App\Models\SolicitudMantenimiento::query()
                ->where(fn ($q) => $q->where('aprobador_id', $user->id))
                ->whereIn('estado', [EstadoSolicitudEnum::APROBADA, EstadoSolicitudEnum::COMPLETADA, EstadoSolicitudEnum::RECHAZADA]);

            $qCombustible = \App\Models\SolicitudCombustible::query()
                ->where('aprobador_id', $user->id)
                ->whereIn('estado', [EstadoSolicitudEnum::APROBADA, EstadoSolicitudEnum::COMPLETADA, EstadoSolicitudEnum::RECHAZADA]);

            $rows = $qTransporte->get()->map(fn ($s) => [
                'id' => $s->id, 'code' => $s->codigo, 'ticket' => $s->ticket,
                'date' => optional($s->updated_at)->format('Y-m-d H:i'),
                'type' => 'Transporte', 'status' => $s->estado?->value,
            ])->concat(
                $qMantenimiento->get()->map(fn ($s) => [
                    'id' => $s->id, 'code' => $s->codigo, 'ticket' => $s->ticket,
                    'date' => optional($s->updated_at)->format('Y-m-d H:i'),
                    'type' => 'Mantenimiento', 'status' => $s->estado?->value,
                ])
            )->concat(
                $qCombustible->get()->map(fn ($s) => [
                    'id' => $s->id, 'code' => $s->codigo, 'ticket' => $s->ticket,
                    'date' => optional($s->updated_at)->format('Y-m-d H:i'),
                    'type' => 'Combustible', 'status' => $s->estado?->value,
                ])
            )->sortByDesc('date')->values();

            $page = \Illuminate\Pagination\Paginator::resolveCurrentPage();
            $total = $rows->count();
            $slice = $rows->slice(($page - 1) * $perPage, $perPage)->values();

            return response()->json(
                new \Illuminate\Pagination\LengthAwarePaginator(
                    $slice, $total, $perPage, $page,
                    ['path' => \Illuminate\Pagination\Paginator::resolveCurrentPath()]
                )
            );
        });
    });

    Route::post('solicitudes-transporte/{solicitud:codigo}/observacion', [SolicitudTransporteController::class, 'observacion'])
        ->middleware('role:operativo|admin|ti|super_admin');

    Route::post('solicitudes-transporte/{solicitud:codigo}/asignar-recursos', [SolicitudTransporteController::class, 'asignarRecursos'])
        ->middleware('role:operativo|admin|ti|super_admin');

    // ── MANTENIMIENTO ───────────────────────────────────────────────
    Route::apiResource('solicitudes-mantenimiento', SolicitudMantenimientoController::class)
        ->only(['index', 'store', 'show'])
        ->parameters(['solicitudes-mantenimiento' => 'solicitud']);

    Route::post('solicitudes-mantenimiento/{solicitud}/enviar', [SolicitudMantenimientoController::class, 'enviar']);
    Route::post('solicitudes-mantenimiento/{solicitud}/finalizar', [SolicitudMantenimientoController::class, 'finalizar']);
    Route::post('solicitudes-mantenimiento/{solicitud}/cancelar', [SolicitudMantenimientoController::class, 'cancelar']);

    Route::middleware('role:jefe|admin|ti|super_admin')->group(function () {
        Route::post('solicitudes-mantenimiento/{solicitud}/observacion', [SolicitudMantenimientoController::class, 'observacion']);
        Route::post('solicitudes-mantenimiento/{solicitud}/pre-aprobar', [SolicitudMantenimientoController::class, 'preAprobar']);
        Route::post('solicitudes-mantenimiento/{solicitud}/aprobar', [SolicitudMantenimientoController::class, 'aprobar']);
        Route::post('solicitudes-mantenimiento/{solicitud}/rechazar', [SolicitudMantenimientoController::class, 'rechazar']);
        Route::post('solicitudes-mantenimiento/{solicitud}/en-ejecucion', [SolicitudMantenimientoController::class, 'iniciarEjecucion']);
    });

    // ── COMBUSTIBLE ─────────────────────────────────────────────────
    Route::apiResource('solicitudes-combustible', SolicitudCombustibleController::class)
        ->only(['index', 'store', 'show'])
        ->parameters(['solicitudes-combustible' => 'solicitud']);

    Route::post('solicitudes-combustible/{solicitud:codigo}/enviar', [SolicitudCombustibleController::class, 'enviar']);
    Route::post('solicitudes-combustible/{solicitud:codigo}/finalizar', [SolicitudCombustibleController::class, 'finalizar']);
    Route::post('solicitudes-combustible/{solicitud:codigo}/cancelar', [SolicitudCombustibleController::class, 'cancelar']);

    Route::middleware('role:jefe|admin|ti|super_admin')->group(function () {
        Route::post('solicitudes-combustible/{solicitud:codigo}/observacion', [SolicitudCombustibleController::class, 'observacion']);
        Route::post('solicitudes-combustible/{solicitud:codigo}/pre-aprobar', [SolicitudCombustibleController::class, 'preAprobar']);
        Route::post('solicitudes-combustible/{solicitud:codigo}/aprobar', [SolicitudCombustibleController::class, 'aprobar']);
        Route::post('solicitudes-combustible/{solicitud:codigo}/rechazar', [SolicitudCombustibleController::class, 'rechazar']);

        Route::post('solicitudes-combustible/{solicitud:codigo}/desbloquear', [SolicitudCombustibleController::class, 'desbloquear']);

        // Módulo de Aprobación
        Route::get('solicitudes-combustible/{solicitud:codigo}/comparativa', [SolicitudCombustibleController::class, 'comparativa']);
        Route::post('solicitudes-combustible/{solicitud:codigo}/aprobar-con-decision', [SolicitudCombustibleController::class, 'aprobarConDecision']);
    });

    Route::post('solicitudes-combustible/{solicitud:codigo}/asignar-carga', [SolicitudCombustibleController::class, 'asignarCarga'])
        ->middleware('role:operativo|admin|ti|super_admin');

    Route::post('solicitudes-combustible/{solicitud:codigo}/asignar-vales', [SolicitudCombustibleController::class, 'asignarVales'])
        ->middleware('role:operativo|admin|ti|super_admin');

    // Rutas para motoristas
    Route::middleware(['auth:sanctum', 'role:motorista'])
        ->prefix('motoristas')
        ->group(function () {

            //NUEVAS (self-service motorista)
            Route::get('me/estado', [MotoristaEstadoController::class, 'miEstado']);
            Route::post('me/estado', [MotoristaEstadoController::class, 'cambiarMiEstado']);
            Route::get('me/historial', [MotoristaEstadoController::class, 'miHistorial']);

            // Operativas (admin/jefe)
            Route::get('/', [MotoristaEstadoController::class, 'index']);
            Route::get('{motorista}/estado', [MotoristaEstadoController::class, 'estadoActual']);
            Route::post('{motorista}/estado', [MotoristaEstadoController::class, 'cambiarEstado']);
            Route::get('{motorista}/historial', [MotoristaEstadoController::class, 'historial']);

            // Viajes — flujo de 4 pasos
            Route::post('me/viajes/{solicitud}/iniciar', [MotoristaViajeController::class, 'iniciar']);
            Route::post('me/viajes/{solicitud}/llegada', [MotoristaViajeController::class, 'llegadaDestino']);
            Route::post('me/viajes/{solicitud}/retorno', [MotoristaViajeController::class, 'iniciarRetorno']);
            Route::post('me/viajes/{solicitud}/finalizar', [MotoristaViajeController::class, 'finalizar']);
        });

    // ── CATÁLOGOS (para el frontend) ────────────────────────
    Route::prefix('catalogos')->group(function () {

        Route::get('/vehiculos', function () {
            return response()->json(
                \App\Models\Vehiculo::with([
                    'vehMarca',
                    'vehModelo',
                    'tipo',
                    'estadoCatalogo',
                    'asignacionVigenteMotorista.motorista',
                ])
                    ->where('activo', true)
                    ->get()
                    ->map(fn ($v) => [
                        'id' => $v->id,
                        'placa' => $v->placa,
                        'marca' => $v->getRelation('vehMarca')?->nombre ?? $v->marca,
                        'modelo' => $v->getRelation('vehModelo')?->nombre ?? $v->modelo,
                        'tipo' => $v->tipo?->nombre,
                        'estado_catalogo' => $v->estadoCatalogo?->nombre,
                        'disponible' => $v->esta_disponible,
                        'estado_operativo' => $v->estado_operativo,
                        'motorista_id' => $v->asignacionVigenteMotorista?->motorista_id,
                        'motorista_nombre' => $v->asignacionVigenteMotorista?->motorista?->nombre ?? 'Sin motorista',
                        'motorista_dui' => $v->asignacionVigenteMotorista?->motorista?->dui,
                        'label' => "{$v->placa} — ".($v->getRelation('vehMarca')?->nombre ?? $v->marca),
                    ])
            );
        });

        // Ruta para obtener solo los vehículos disponibles (estado operativo disponible y estado catálogo disponible)
        Route::get('/vehiculos/disponibles', function () {
            return response()->json(
                \App\Models\Vehiculo::with([
                    'vehMarca',
                    'vehModelo',
                    'tipo',
                    'estadoCatalogo',
                    'asignacionVigenteMotorista.motorista',
                ])
                    ->where('activo', true)
                    ->disponibles()
                    ->get()
                    ->map(fn ($v) => [
                        'id' => $v->id,
                        'placa' => $v->placa,
                        'marca' => $v->getRelation('vehMarca')?->nombre ?? $v->marca,
                        'modelo' => $v->getRelation('vehModelo')?->nombre ?? $v->modelo,
                        'tipo' => $v->tipo?->nombre,
                        'estado_catalogo' => $v->estadoCatalogo?->nombre,
                        'estado_operativo' => $v->estado_operativo,
                        'motorista_id' => $v->asignacionVigenteMotorista?->motorista_id,
                        'motorista_nombre' => $v->asignacionVigenteMotorista?->motorista?->nombre ?? 'Sin motorista',
                        'motorista_dui' => $v->asignacionVigenteMotorista?->motorista?->dui,
                        'label' => "{$v->placa} — ".($v->getRelation('vehMarca')?->nombre ?? $v->marca),
                    ])
            );
        });

        Route::get('/vehiculos/{vehiculo}/detalle', function (\App\Models\Vehiculo $vehiculo) {
            if (!$vehiculo->activo) {
                return response()->json(['message' => 'Vehículo no encontrado.'], 404);
            }

            $vehiculo->load([
                'vehMarca', 'vehModelo', 'tipo', 'color', 'tipoMotor',
                'transmision', 'traccion', 'tipoLlanta', 'tipoCombustible',
                'clasificacion', 'estadoCatalogo', 'departamental',
                'asignacionVigenteMotorista.motorista',
                'ultimaRecepcionEntrega',
            ]);

            $u = $vehiculo->ultimaRecepcionEntrega;

            return response()->json([
                'id' => $vehiculo->id,
                'placa' => $vehiculo->placa,
                'marca' => $vehiculo->vehMarca?->nombre ?? $vehiculo->marca,
                'modelo' => $vehiculo->vehModelo?->nombre ?? $vehiculo->modelo,
                'tipo' => $vehiculo->tipo?->nombre,
                'anio' => $vehiculo->anio,
                'color' => $vehiculo->color?->nombre,
                'capacidad_personas' => $vehiculo->capacidad_personas,
                'num_llantas' => $vehiculo->num_llantas,
                'chasis' => $vehiculo->chasis,
                'vin' => $vehiculo->vin,
                'motor_numero' => $vehiculo->motor_numero,
                'vencimiento_tarjeta' => $vehiculo->vencimiento_tarjeta?->format('Y-m-d'),
                'activo_fijo' => $vehiculo->activo_fijo,
                'fotografia_url' => $vehiculo->fotografia_url,
                'motor' => $vehiculo->tipoMotor?->nombre,
                'transmision' => $vehiculo->transmision?->nombre,
                'traccion' => $vehiculo->traccion?->nombre,
                'tipo_llanta' => $vehiculo->tipoLlanta?->nombre,
                'tipo_combustible' => $vehiculo->tipoCombustible?->nombre,
                'clasificacion' => $vehiculo->clasificacion?->nombre,
                'departamental' => $vehiculo->departamental?->nombre,
                'estado_catalogo' => $vehiculo->estadoCatalogo?->nombre,
                'estado_operativo' => $vehiculo->estado_operativo,
                'disponible' => $vehiculo->esta_disponible,
                'accesorios' => $vehiculo->accesorios ?? [],
                'motorista_asignado' => $vehiculo->asignacionVigenteMotorista ? [
                    'id' => $vehiculo->asignacionVigenteMotorista->motorista_id,
                    'nombre' => $vehiculo->asignacionVigenteMotorista->motorista?->nombre,
                    'dui' => $vehiculo->asignacionVigenteMotorista->motorista?->dui,
                ] : null,
                'ultima_recepcion_entrega' => $u ? [
                    'id' => $u->id,
                    'tipo_movimiento' => $u->tipo_movimiento,
                    'fecha_hora' => $u->fecha_hora,
                    'kilometraje' => $u->kilometraje,
                    'nivel_combustible' => [
                        'valor' => $u->nivel_combustible,
                        'label' => $u->nivel_combustible_label,
                    ],
                    'herramientas_faltantes' => $u->herramientas_faltantes,
                    'observaciones' => $u->observaciones,
                ] : null,
            ]);
        });

        Route::get('/motoristas', function () {
            return response()->json(
                \App\Models\Motorista::with('estadoActual')
                    ->where('activo', true)
                    ->get()
                    ->map(fn ($m) => [
                        'id' => $m->id,
                        'nombre' => $m->nombre,
                        'dui' => $m->dui,
                        'telefono' => $m->telefono,
                        'disponible' => $m->esta_disponible,
                        'motivo_inactividad' => $m->estadoActual?->motivo,
                    ])
            );
        });

        Route::get('/motoristas/disponibles', function () {
            return response()->json(
                \App\Models\Motorista::with('estadoActual')
                    ->where('activo', true)
                    ->disponibles()
                    ->get()
                    ->map(fn ($m) => [
                        'id' => $m->id,
                        'nombre' => $m->nombre,
                        'dui' => $m->dui,
                        'telefono' => $m->telefono,
                        'disponible' => $m->esta_disponible,
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
                $query->get()->map(fn ($m) => [
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

        Route::get('me/viajes', [MotoristaEstadoController::class, 'misViajes']);
    });

});