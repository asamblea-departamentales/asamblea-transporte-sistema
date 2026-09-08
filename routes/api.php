<?php

use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\MotoristaAuthController;
use App\Http\Controllers\Api\MotoristaEstadoController;
use App\Http\Controllers\Api\MotoristaNotificacionController;
use App\Http\Controllers\Api\MotoristaViajeController;
use App\Http\Controllers\Api\NotificacionController;
use App\Http\Controllers\Api\PushSubscriptionController;
use App\Http\Controllers\Api\SolicitudCombustibleController;
use App\Http\Controllers\Api\SolicitudMantenimientoController;
use App\Http\Controllers\Api\SolicitudTransporteController;
use App\Http\Controllers\Api\TokenAuthController;
use App\Models\Motorista;
use App\Models\Vehiculo;
use App\Models\VehMarca;
use App\Models\VehModelo;
use App\Models\VehTipoMantenimiento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// AUTH POR TOKEN (PUBLICO) — rate limited: 5 intentos/min por email+IP
Route::post('/auth/login', [TokenAuthController::class, 'login'])->middleware('throttle:login');

// AUTH MOTORISTA (PUBLICO) — activación de cuenta + cambio de PIN
Route::post('/auth/motorista/activar-cuenta', [MotoristaAuthController::class, 'activarCuenta'])
    ->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {

    // Usuario autenticado
    Route::get('/auth/me', [TokenAuthController::class, 'me']);
    Route::post('/auth/logout', [TokenAuthController::class, 'logout']);

    // Web Push VAPID — expuestas auth:sanctum (usuarios)
    Route::get('/me/push-public-key', [PushSubscriptionController::class, 'publicKey'])->name('me.push-public-key');
    Route::post('/me/push-subscribe', [PushSubscriptionController::class, 'store'])->name('me.push-subscribe');
    Route::delete('/me/push-unsubscribe', [PushSubscriptionController::class, 'destroy'])->name('me.push-unsubscribe');

    // Notificaciones in-app del usuario autenticado (jefatura/operativo)
    Route::get('/me/notificaciones', [NotificacionController::class, 'index']);
    Route::put('/me/notificaciones/{notification}/leer', [NotificacionController::class, 'marcarLeer']);
    Route::put('/me/notificaciones/marcar-todas', [NotificacionController::class, 'marcarTodasLeer']);

    // Cambio de PIN inicial (motoristas)
    Route::post('/auth/motorista/cambiar-pin-inicial', [MotoristaAuthController::class, 'cambiarPinInicial']);

    // Dashboard Summary (Transporte + Mantenimiento + Combustible)
    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

    // Solicitudes Recientes (Transporte + Mantenimiento + Combustible)
    Route::get('/solicitudes/recientes', [DashboardController::class, 'recientes']);

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
        Route::patch('solicitudes-transporte/{solicitud:codigo}/destino-adicional', [SolicitudTransporteController::class, 'agregarDestinoAdicional']);
        Route::get('recursos/disponibles', [SolicitudTransporteController::class, 'recursosDisponibles']);

        // Historial unificado para Jefatura: Transporte + Mantenimiento + Combustible
        Route::get('dashboard/historial-jefatura', [DashboardController::class, 'historialJefatura']);

        // Documentos PDF de jefatura para el frontend externo
        Route::get('solicitudes-transporte/{solicitud:codigo}/documento-oficial', [SolicitudTransporteController::class, 'documentoOficial']);
        Route::get('solicitudes-transporte/{solicitud:codigo}/mision-oficial', [SolicitudTransporteController::class, 'misionOficial']);

        // Pendientes de jefatura (PRE_APROBADAS): Transporte + Mantenimiento + Combustible
        Route::get('solicitudes/pendientes-jefatura', [DashboardController::class, 'pendientesJefatura']);
    });

    Route::post('solicitudes-transporte/{solicitud:codigo}/observacion', [SolicitudTransporteController::class, 'observacion'])
        ->middleware('role:operativo|jefe|admin|ti|super_admin');

    Route::post('solicitudes-transporte/{solicitud:codigo}/asignar-recursos', [SolicitudTransporteController::class, 'asignarRecursos'])
        ->middleware('role:operativo|jefe|admin|ti|super_admin');

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
        Route::post('solicitudes-mantenimiento/{solicitud}/evaluar', [SolicitudMantenimientoController::class, 'evaluar']);

        // Orden de trabajo PDF de jefatura para el frontend externo
        Route::get('solicitudes-mantenimiento/{solicitud}/orden-trabajo', [SolicitudMantenimientoController::class, 'ordenTrabajo']);
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

        // Documento oficial PDF de jefatura para el frontend externo
        Route::get('solicitudes-combustible/{solicitud:codigo}/documento-oficial', [SolicitudCombustibleController::class, 'documentoOficial']);
    });

    Route::post('solicitudes-combustible/{solicitud:codigo}/asignar-carga', [SolicitudCombustibleController::class, 'asignarCarga'])
        ->middleware('role:operativo|admin|ti|super_admin');

    Route::post('solicitudes-combustible/{solicitud:codigo}/asignar-vales', [SolicitudCombustibleController::class, 'asignarVales'])
        ->middleware('role:operativo|admin|ti|super_admin');

    // ── RUTAS SELF-SERVICE (solo motorista autenticado) ──────────
    Route::middleware(['auth:sanctum', 'role:motorista'])
        ->prefix('motoristas')
        ->group(function () {
            Route::get('me/estado', [MotoristaEstadoController::class, 'miEstado']);
            Route::post('me/estado', [MotoristaEstadoController::class, 'cambiarMiEstado']);
            Route::get('me/historial', [MotoristaEstadoController::class, 'miHistorial']);
            Route::get('me/viajes', [MotoristaEstadoController::class, 'misViajes']);
            Route::get('me/viajes/{solicitud}', [MotoristaViajeController::class, 'show']);
            Route::post('me/viajes/{solicitud}/iniciar', [MotoristaViajeController::class, 'iniciar']);
            Route::post('me/viajes/{solicitud}/llegada', [MotoristaViajeController::class, 'llegadaDestino']);
            Route::post('me/viajes/{solicitud}/retorno', [MotoristaViajeController::class, 'iniciarRetorno']);
            Route::post('me/viajes/{solicitud}/finalizar', [MotoristaViajeController::class, 'finalizar']);
            Route::get('me/notificaciones', [MotoristaNotificacionController::class, 'index']);
            Route::put('me/notificaciones/{notification}/leer', [MotoristaNotificacionController::class, 'marcarLeer']);
            Route::put('me/notificaciones/marcar-todas', [MotoristaNotificacionController::class, 'marcarTodasLeer']);
            Route::get('me/push-public-key', [PushSubscriptionController::class, 'publicKey'])->name('motoristas.me.push-public-key');
            Route::post('me/push-subscribe', [PushSubscriptionController::class, 'store'])->name('motoristas.me.push-subscribe');
            Route::delete('me/push-unsubscribe', [PushSubscriptionController::class, 'destroy'])->name('motoristas.me.push-unsubscribe');
        });

    // ── RUTAS ADMINISTRATIVAS (jefe/operativo pueden gestionar motoristas) ─
    Route::middleware(['auth:sanctum', 'role:jefe|admin|ti|super_admin|operativo'])
        ->prefix('motoristas')
        ->group(function () {
            Route::get('/', [MotoristaEstadoController::class, 'index']);
            Route::get('{motorista}/estado', [MotoristaEstadoController::class, 'estadoActual']);
            Route::post('{motorista}/estado', [MotoristaEstadoController::class, 'cambiarEstado']);
            Route::get('{motorista}/historial', [MotoristaEstadoController::class, 'historial']);
        });

    // ── CATÁLOGOS (para el frontend) ────────────────────────
    Route::prefix('catalogos')->group(function () {

        Route::get('/vehiculos', function () {
            return response()->json(
                Vehiculo::with([
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
                Vehiculo::with([
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

        Route::get('/vehiculos/{vehiculo}/detalle', function (Vehiculo $vehiculo) {
            if (! $vehiculo->activo) {
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
                Motorista::with('estadoActual')
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
                Motorista::with('estadoActual')
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
                VehMarca::where('activo', true)
                    ->orderBy('nombre')
                    ->get(['id', 'nombre'])
            );
        });

        Route::get('/modelos', function (Request $request) {
            $query = VehModelo::with('marca')->where('activo', true);

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
                VehTipoMantenimiento::where('activo', true)
                    ->get(['id', 'nombre'])
            );
        });
    });

});

Route::get('health', HealthController::class);
