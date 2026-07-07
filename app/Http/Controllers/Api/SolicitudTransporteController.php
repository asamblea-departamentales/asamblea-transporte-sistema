<?php

// -----------------------------------------------------------------------------
// CONTROLADOR DE SOLICITUDES DE TRANSPORTE (VIAJES)
// -----------------------------------------------------------------------------
// Este controlador gestiona las solicitudes de transporte o viajes que hacen
// los empleados. Permite crear una solicitud de viaje, enviarla para
// aprobación, asignar vehículo y motorista, y generar reportes en PDF.
// También incluye funciones avanzadas como comparar la sugerencia del
// sistema contra la decisión del operador al asignar recursos.

namespace App\Http\Controllers\Api;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Services\MapImageService;
use App\Domain\Solicitudes\Services\Reportes\ReporteMisionOficialService;
use App\Domain\Solicitudes\Services\SolicitudEmailDispatchService;
use App\Domain\Solicitudes\Services\SolicitudTransporteService;
use App\Http\Controllers\Controller;
use App\Models\BitacoraEvento;
use App\Models\SolicitudDestinoAdicional;
use App\Models\SolicitudTransporte;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class SolicitudTransporteController extends Controller
{
    public function __construct(
        protected SolicitudTransporteService $service
    ) {}

    /**
     * Listado de solicitudes
     * - Jefe/Admin/TI: ve todas
     * - Usuario: solo las suyas
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = SolicitudTransporte::query()
            ->with(['unidad', 'solicitante', 'autorizador', 'vehiculo', 'motorista']); // Carga relaciones para optimizar consultas

        if (! $user->hasAnyRole(['jefe', 'admin', 'ti', 'super_admin'])) {
            $query->where('solicitante_id', $user->id);
        }

        return response()->json(
            $query->orderByDesc('created_at')->paginate(10)
        );
    }

    /**
     * Crear solicitud (Queda como PENDIENTE tras el service)
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'unidad_solicitante_id' => ['required', 'exists:unidad_solicitantes,id'],
            'motivo_actividad' => ['required', 'string'],
            'origen' => ['required', 'string'],
            'destino_principal' => ['required', 'string'],
            'destino_adicional' => ['nullable', 'string'],
            'fecha_salida' => ['required', 'date'],
            'fecha_retorno' => ['nullable', 'date', 'after_or_equal:fecha_salida'],
            'hora_salida' => ['nullable'],
            'cantidad_personas' => ['required', 'integer', 'min:1'],
            'prioridad' => ['required', 'string'],
            'tipo_vehiculo' => ['required', 'string'],
            'encargado' => ['required', 'string'],
            'subencargado' => ['nullable', 'string'],

            // NUEVOS CAMPOS PARA HORAS MANEJADAS DE MOTORISTAS
            'hora_retorno' => ['nullable'],

            // --- NUEVOS CAMPOS DE COORDENADAS ---
            'origen_lat' => ['nullable', 'numeric'],
            'origen_lng' => ['nullable', 'numeric'],
            'destino_lat' => ['nullable', 'numeric'],
            'destino_lng' => ['nullable', 'numeric'],
            'destino_adicional_lat' => ['nullable', 'numeric'],
            'destino_adicional_lng' => ['nullable', 'numeric'],

            // --- DESTINOS ADICIONALES MULTIPLES (array) ---
            'destinos_adicionales' => ['nullable', 'array'],
            'destinos_adicionales.*.nombre' => ['required_with:destinos_adicionales', 'string', 'max:255'],
            'destinos_adicionales.*.lat' => ['nullable', 'numeric'],
            'destinos_adicionales.*.lng' => ['nullable', 'numeric'],
        ]);

        // --- MAPEO DE DATOS ---
        $tipoVehiculoNombre = $data['tipo_vehiculo'];
        $destinoReal = $data['destino_principal'];
        $destinoAdicional = $data['destino_adicional'] ?? null;
        $destinosAdicionales = $data['destinos_adicionales'] ?? [];

        // Extraemos las coordenadas para que no estorben en el resto de la lógica si fuera necesario
        // aunque al usar el spread operator (...) podemos dejarlas en $data si los nombres coinciden con la BD.

        // Limpiamos los campos que no van directo a columnas con el mismo nombre
        unset($data['tipo_vehiculo'], $data['destino_principal'], $data['destino_adicional'], $data['destinos_adicionales']);

        // Mergear hora_salida en fecha_salida y hora_retorno en fecha_retorno
        if (! empty($data['hora_salida']) && ! empty($data['fecha_salida'])) {
            $fecha = $data['fecha_salida'] instanceof Carbon ? $data['fecha_salida'] : Carbon::parse($data['fecha_salida']);
            $data['fecha_salida'] = Carbon::parse($fecha->format('Y-m-d').' '.$data['hora_salida']);
        }
        unset($data['hora_salida']);

        if (! empty($data['hora_retorno']) && ! empty($data['fecha_retorno'])) {
            $fecha = $data['fecha_retorno'] instanceof Carbon ? $data['fecha_retorno'] : Carbon::parse($data['fecha_retorno']);
            $data['fecha_retorno'] = Carbon::parse($fecha->format('Y-m-d').' '.$data['hora_retorno']);
        }
        unset($data['hora_retorno']);

        $user = Auth::user();

        if (! empty($data['fecha_salida']) && ! empty($data['fecha_retorno'])) {
            $data['horas_estimadas'] = round(
                Carbon::parse($data['fecha_salida'])->diffInMinutes(Carbon::parse($data['fecha_retorno']), true) / 60,
                2
            );
        }

        $solicitud = SolicitudTransporte::create([
            ...$data, // Aquí ya se incluyen las latitudes y longitudes validadas
            'destino' => $destinoReal,
            'destino_adicional' => $destinoAdicional,
            'tipo_vehiculo_nombre' => $tipoVehiculoNombre,
            'solicitante_id' => $user->id,
            'prioridad_grupo' => $user->grupo?->nivel_prioridad ?? 'baja',
            'estado' => EstadoSolicitudEnum::BORRADOR,
        ]);

        // Sincronizar destinos adicionales a la nueva tabla
        $orden = 0;

        // Prioridad 1: Array de destinos con coordenadas (mapa frontend)
        if (! empty($destinosAdicionales) && is_array($destinosAdicionales)) {
            foreach ($destinosAdicionales as $d) {
                SolicitudDestinoAdicional::create([
                    'solicitud_transporte_id' => $solicitud->id,
                    'nombre' => $d['nombre'] ?? 'Destino adicional',
                    'lat' => $d['lat'] ?? null,
                    'lng' => $d['lng'] ?? null,
                    'agregado_por' => null,
                    'agregado_durante_viaje' => false,
                    'orden' => $orden++,
                ]);
            }
        } elseif ($destinoAdicional) {
            // Prioridad 2: Legacy string separado por |
            $nombres = array_map('trim', preg_split('/\s*(?:\|| - )\s*/', $destinoAdicional));
            $nombres = array_filter($nombres, fn ($n) => $n !== '');
            foreach ($nombres as $nombre) {
                SolicitudDestinoAdicional::create([
                    'solicitud_transporte_id' => $solicitud->id,
                    'nombre' => $nombre,
                    'agregado_por' => null,
                    'agregado_durante_viaje' => false,
                    'orden' => $orden++,
                ]);
            }
        }

        // El service cambia el estado de BORRADOR a PENDIENTE y notifica (aquí se enviará el correo)
        $solicitud = $this->service->enviarSolicitud($solicitud, Auth::id());

        return response()->json(
            $solicitud->fresh()->load(['unidad', 'solicitante']),
            201
        );
    }

    /**
     * Agregar destino durante un viaje activo (solo Jefe)
     */
    public function agregarDestinoViaje(Request $request, SolicitudTransporte $solicitud)
    {
        $user = $request->user();

        if (! $user->hasAnyRole(['jefe', 'super_admin', 'ti'])) {
            return response()->json(['message' => 'Solo el Jefe de Transporte puede agregar destinos durante el viaje.'], 403);
        }

        if ($solicitud->estado !== EstadoSolicitudEnum::EN_EJECUCION) {
            return response()->json(['message' => 'Solo se pueden agregar destinos a un viaje en curso (EN_EJECUCION).'], 422);
        }

        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
        ]);

        $nombre = trim($data['nombre']);

        // Geocodificar usando el mismo servicio de mapas
        [$lat, $lng] = app(MapImageService::class)->geocodeOrFake($nombre);

        // Calcular el siguiente orden
        $ultimoOrden = SolicitudDestinoAdicional::where('solicitud_transporte_id', $solicitud->id)->max('orden') ?? -1;

        $destino = SolicitudDestinoAdicional::create([
            'solicitud_transporte_id' => $solicitud->id,
            'nombre' => $nombre,
            'lat' => $lat,
            'lng' => $lng,
            'agregado_por' => $user->id,
            'agregado_durante_viaje' => true,
            'orden' => $ultimoOrden + 1,
        ]);

        BitacoraEvento::create([
            'entidad_tipo' => 'solicitud_transporte',
            'entidad_id' => $solicitud->id,
            'accion' => AccionBitacoraEnum::AGREGAR_DESTINO_VIAJE->value,
            'user_id' => $user->id,
            'datos_extras' => [
                'nombre' => $nombre,
                'lat' => $lat,
                'lng' => $lng,
                'solicitud_codigo' => $solicitud->codigo,
                'orden' => $ultimoOrden + 1,
            ],
        ]);

        // ── Notificar modificación de ruta ──
        dispatch(function () use ($solicitud) {
            try {
                $dispatch = app(SolicitudEmailDispatchService::class);

                if ($solicitud->solicitante?->email) {
                    $dispatch->toSolicitante($solicitud, 'transporte', 'ruta_modificada');
                }

                $motorista = $solicitud->motorista;
                if ($motorista) {
                    $email = $motorista->user?->email ?? $motorista->correo;
                    if ($email) {
                        $dispatch->toEmail($solicitud, 'transporte', 'ruta_modificada', $email);
                    }
                }
            } catch (\Exception $e) {
                Log::error("Error notificando modificacion de ruta [{$solicitud->codigo}]: ".$e->getMessage());
            }
        });

        return response()->json($destino->load('agregadoPor'), 201);
    }

    public function agregarDestinoAdicional(Request $request, SolicitudTransporte $solicitud)
    {
        $this->authorizeJefe();

        if (! in_array($solicitud->estado, [EstadoSolicitudEnum::EN_EJECUCION, EstadoSolicitudEnum::PROGRAMADA], true)) {
            return response()->json(['message' => 'Solo se pueden agregar destinos a viajes programados o en curso.'], 422);
        }

        $data = $request->validate([
            'destino_adicional' => ['required', 'string', 'max:5000'],
        ]);

        $solicitud->update(['destino_adicional' => trim($data['destino_adicional'])]);

        BitacoraEvento::create([
            'entidad_tipo' => 'solicitud_transporte',
            'entidad_id' => $solicitud->id,
            'accion' => AccionBitacoraEnum::AGREGAR_DESTINO_ADICIONAL->value,
            'user_id' => Auth::id(),
            'datos_extras' => [
                'nuevo_destino' => $data['destino_adicional'],
                'solicitud_codigo' => $solicitud->codigo,
            ],
        ]);

        dispatch(function () use ($solicitud) {
            try {
                $dispatch = app(SolicitudEmailDispatchService::class);
                if ($solicitud->solicitante?->email) {
                    $dispatch->toSolicitante($solicitud, 'transporte', 'ruta_modificada');
                }
                $motorista = $solicitud->motorista;
                if ($motorista) {
                    $email = $motorista->user?->email ?? $motorista->correo;
                    if ($email) {
                        $dispatch->toEmail($solicitud, 'transporte', 'ruta_modificada', $email);
                    }
                }
            } catch (\Exception $e) {
                Log::error("Error notificando modificacion de ruta [{$solicitud->codigo}]: ".$e->getMessage());
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Destino adicional guardado correctamente.',
            'destino_adicional' => $solicitud->fresh()->destino_adicional,
        ]);
    }

    /**
     * Ver detalle
     */
    public function show(SolicitudTransporte $solicitud)
    {
        $this->authorizeView($solicitud);

        return response()->json(
            $solicitud->load([
                'unidad', 'solicitante', 'autorizador', 'vehiculo.ultimaRecepcionEntrega',
                'motorista', 'destinosAdicionales.agregadoPor',
            ])
        );
    }

    /**
     * Enviar solicitud (Manualmente si quedó en BORRADOR)
     */
    public function enviar(SolicitudTransporte $solicitud)
    {
        $this->authorizeOwner($solicitud);

        try {
            $solicitud = $this->service->enviarSolicitud($solicitud, Auth::id());

            return response()->json([
                'message' => 'Solicitud enviada correctamente',
                'data' => $solicitud->fresh()->load(['unidad', 'solicitante']),
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    /**
     * Finalizar (Acción desde el Frontend para el Solicitante)
     */
    /**
     * Finalizar (Acción desde el Frontend para el Solicitante)
     */
    public function finalizar(SolicitudTransporte $solicitud)
    {
        // Usamos el helper de autorización para asegurar que sea el dueño
        $this->authorizeOwner($solicitud);

        try {
            // Delegamos TODA la carga al service
            $solicitud = $this->service->finalizar($solicitud, Auth::id());

            return response()->json([
                'message' => 'Viaje finalizado con éxito.',
                'data' => $solicitud->fresh()->load(['unidad', 'solicitante', 'confirmador']),
            ]);

        } catch (\DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            // Log por si algo falla a nivel de base de datos
            \Illuminate\Support\Facades\Log::error('Error al finalizar: '.$e->getMessage());

            return response()->json(['message' => 'Error interno del servidor'], 500);
        }
    }

    /**
     * Observación del jefe
     */
    public function observacion(Request $request, SolicitudTransporte $solicitud)
    {
        $this->authorizeJefe();

        $data = $request->validate([
            'comentario' => ['required', 'string', 'max:2000'],
        ]);

        try {
            $solicitud = $this->service->observar($solicitud, Auth::id(), $data['comentario']);

            return response()->json([
                'message' => 'Observación registrada',
                'data' => $solicitud->fresh()->load(['unidad', 'solicitante']),
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    /**
     * Aprobar solicitud
     */
    public function aprobar(SolicitudTransporte $solicitud)
    {
        $this->authorizeJefe();

        try {
            $solicitud = $this->service->aprobar($solicitud, Auth::id());

            return response()->json([
                'message' => 'Solicitud aprobada',
                'data' => $solicitud->fresh()->load(['unidad', 'solicitante']),
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    /**
     * Rechazar solicitud
     */
    public function rechazar(Request $request, SolicitudTransporte $solicitud)
    {
        $this->authorizeJefe();

        $data = $request->validate([
            'comentario' => ['required', 'string', 'max:2000'],
        ]);

        try {
            $solicitud = $this->service->rechazar($solicitud, Auth::id(), $data['comentario']);

            return response()->json([
                'message' => 'Solicitud rechazada',
                'data' => $solicitud->fresh()->load(['unidad', 'solicitante']),
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    /**
     * Para generar PDF de mision oficial individual
     */
    public function pdf(
        Request $request,
        ReporteMisionOficialService $service,
        ?\App\Models\SolicitudTransporte $solicitud = null // <-- Importante: mismo nombre que en la ruta
    ) {
        if ($solicitud && $solicitud->exists) {
            // CASO A: Imprimir una sola misión oficial (Botón de Filament)
            $solicitud->load([
                'solicitante', 'autorizador', 'motorista', 'tipoVehiculo',
                'vehiculo.vehMarca', 'vehiculo.vehModelo', 'vehiculo.color', 'vehiculo.clasificacion',
            ]);

            // Lo metemos en una colección para que el @foreach del Blade no falle
            $rows = collect([$solicitud]);
            $filters = [];
        } else {
            // CASO B: Reporte masivo desde la pantalla de reportes
            $filters = $request->only(['date_from', 'date_to', 'vehiculo_id', 'motorista_id', 'tipo_vehiculo_id']);
            $rows = $service->buildQuery($filters)->orderBy('fecha_salida', 'asc')->get();
        }

        if ($rows->isEmpty()) {
            return redirect()->back()->with('error', 'No hay datos para generar el PDF.');
        }

        $kpis = $service->getKpis($filters);

        return \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.reporte_mision_oficial_pdf', [
            'rows' => $rows,
            'filters' => $filters,
            'kpis' => $kpis,
            'service' => $service,
            'rangeLabel' => ($solicitud && $solicitud->exists) ? 'Misión Individual' : $this->rangeLabel($filters),
        ])->setPaper('a4', 'portrait')->stream('mision_oficial.pdf');
    }

    // ═════════════════════════════════════════════════════
    // NUEVOS ENDPOINTS — Módulo de Aprobación
    // ═════════════════════════════════════════════════════

    public function comparativa(SolicitudTransporte $solicitud)
    {
        $this->authorizeJefe();

        $solicitud->load([
            'solicitante.grupo', 'unidad', 'vehiculo', 'motorista',
            'sugerencia.vehiculoSugerido.ultimaRecepcionEntrega', 'sugerencia.motoristaSugerido',
            'decisionOperativa.vehiculoFinal.ultimaRecepcionEntrega', 'decisionOperativa.motoristaFinal',
            'decisionOperativa.usuarioOperativo',
        ]);

        $vOp = $solicitud->decisionOperativa?->vehiculoFinal?->ultimaRecepcionEntrega;
        $vSis = $solicitud->sugerencia?->vehiculoSugerido?->ultimaRecepcionEntrega;

        return response()->json([
            'solicitud' => [
                'id' => $solicitud->codigo,
                'solicitante' => ($solicitud->solicitante?->name ?? '').' ('.($solicitud->unidad?->nombre ?? '').')',
                'destino' => $solicitud->destino,
                'prioridad' => $solicitud->prioridad?->value,
                'prioridad_grupo' => $solicitud->prioridad_grupo?->value,
                'fechas' => [
                    'salida' => $solicitud->fecha_salida?->toIso8601String(),
                    'retorno' => $solicitud->fecha_retorno?->toIso8601String(),
                ],
                'horas_estimadas' => $solicitud->horas_estimadas,
                'motivo' => $solicitud->motivo_actividad,
                'tipo_vehiculo' => $solicitud->tipo_vehiculo_nombre,
                'cantidad_personas' => $solicitud->cantidad_personas,
                'origen' => $solicitud->origen,
                'origen_lat' => $solicitud->origen_lat,
                'origen_lng' => $solicitud->origen_lng,
                'destino_lat' => $solicitud->destino_lat,
                'destino_lng' => $solicitud->destino_lng,
                'destino_adicional_lat' => $solicitud->destino_adicional_lat,
                'destino_adicional_lng' => $solicitud->destino_adicional_lng,
            ],
            'operativo' => $solicitud->decisionOperativa ? [
                'autor' => $solicitud->decisionOperativa->usuarioOperativo?->name,
                'vehiculo' => [
                    'id' => $solicitud->decisionOperativa->vehiculoFinal?->id,
                    'placa' => $solicitud->decisionOperativa->vehiculoFinal?->placa,
                    'nivel_combustible' => $vOp ? [
                        'valor' => $vOp->nivel_combustible,
                        'label' => $vOp->nivel_combustible_label,
                    ] : null,
                ],
                'motorista' => [
                    'id' => $solicitud->decisionOperativa->motoristaFinal?->id,
                    'nombre' => $solicitud->decisionOperativa->motoristaFinal?->nombre,
                    'horas_periodo_7d' => $solicitud->decisionOperativa->motoristaFinal?->horasEnPeriodo(),
                ],
                'justificacion' => $solicitud->decisionOperativa->justificacion,
                'cambio_detectado' => $solicitud->decisionOperativa->cambio_detectado,
            ] : null,
            'sistema' => $solicitud->sugerencia ? [
                'score_confianza' => $solicitud->sugerencia->score_confianza,
                'vehiculo_sugerido' => [
                    'id' => $solicitud->sugerencia->vehiculoSugerido?->id,
                    'placa' => $solicitud->sugerencia->vehiculoSugerido?->placa,
                    'nivel_combustible' => $vSis ? [
                        'valor' => $vSis->nivel_combustible,
                        'label' => $vSis->nivel_combustible_label,
                    ] : null,
                ],
                'motorista_sugerido' => [
                    'id' => $solicitud->sugerencia->motoristaSugerido?->id,
                    'nombre' => $solicitud->sugerencia->motoristaSugerido?->nombre,
                    'horas_periodo_7d' => $solicitud->sugerencia->horas_motorista_periodo,
                ],
                'combustible_porcentaje' => $solicitud->sugerencia->combustible_porcentaje,
                'bullets_tecnicos' => $solicitud->sugerencia->bullets_tecnicos,
            ] : null,
        ]);
    }

    public function historialJefatura(Request $request)
    {
        $this->authorizeJefe();
        $perPage = $request->query('per_page', 15);
        $user = $request->user();

        $historial = SolicitudTransporte::query()
            ->with(['unidad', 'solicitante', 'vehiculo', 'motorista', 'autorizador'])
            // MINIMAL CHANGE: Filtrar por jefe_id (o aprobado por él) para que el front no reciba un historial vacío
            ->where(function ($query) use ($user) {
                $query->where('jefe_id', $user->id)
                    ->orWhere('decidido_por', $user->id);
            })
            ->whereIn('estado', [
                EstadoSolicitudEnum::APROBADA,
                EstadoSolicitudEnum::PROGRAMADA,
                EstadoSolicitudEnum::COMPLETADA,
                EstadoSolicitudEnum::RECHAZADA,
                EstadoSolicitudEnum::EN_EJECUCION,
            ])
            ->orderByDesc('updated_at')
            ->paginate($perPage);

        return response()->json($historial);
    }

    /**
     * historialJefatura
     *
     * Devuelve un listado paginado de solicitudes que fueron DECIDIDAS por el jefe
     * actualmente autenticado. Esto sirve para que el jefe vea su propio historial
     * de aprobaciones, rechazos y programaciones. Filtra por estados relevantes
     * (aprobada, programada, completada, rechazada) y ordena por fecha de decisión.
     *
     * Nota sencillo: esto no crea ni modifica nada; sólo muestra información histórica.
     */
    public function recursosDisponibles(Request $request)
    {
        $this->authorizeJefe();

        $data = $request->validate([
            'fecha_salida' => ['required', 'date'],
            'fecha_retorno' => ['required', 'date', 'after_or_equal:fecha_salida'],
        ]);

        $fechaSalida = Carbon::parse($data['fecha_salida']);
        $fechaRetorno = Carbon::parse($data['fecha_retorno']);

        $vehiculosOcupados = SolicitudTransporte::query()
            ->whereNotNull('vehiculo_id')
            ->whereIn('estado', [
                EstadoSolicitudEnum::EN_EJECUCION,
                EstadoSolicitudEnum::PROGRAMADA,
                EstadoSolicitudEnum::APROBADA,
                EstadoSolicitudEnum::ASIGNADA,
            ])
            ->where(function ($query) use ($fechaSalida, $fechaRetorno) {
                $query->where('fecha_salida', '<=', $fechaRetorno)
                    ->where('fecha_retorno', '>=', $fechaSalida);
            })
            ->pluck('vehiculo_id')
            ->filter()
            ->unique();

        $motoristasOcupados = SolicitudTransporte::query()
            ->whereNotNull('motorista_id')
            ->whereIn('estado', [
                EstadoSolicitudEnum::EN_EJECUCION,
                EstadoSolicitudEnum::PROGRAMADA,
                EstadoSolicitudEnum::APROBADA,
                EstadoSolicitudEnum::ASIGNADA,
            ])
            ->where(function ($query) use ($fechaSalida, $fechaRetorno) {
                $query->where('fecha_salida', '<=', $fechaRetorno)
                    ->where('fecha_retorno', '>=', $fechaSalida);
            })
            ->pluck('motorista_id')
            ->filter()
            ->unique();

        $vehiculos = \App\Models\Vehiculo::query()
            ->where('activo', true)
            ->whereNotIn('id', $vehiculosOcupados)
            ->with('vehMarca', 'ultimaRecepcionEntrega')
            ->get()
            ->map(fn ($vehiculo) => [
                'id' => $vehiculo->id,
                'placa' => $vehiculo->placa,
                'marca' => $vehiculo->vehMarca?->nombre,
                'capacidad' => $vehiculo->capacidad_personas,
                'nivel_combustible' => $vehiculo->ultimaRecepcionEntrega ? [
                    'valor' => $vehiculo->ultimaRecepcionEntrega->nivel_combustible,
                    'label' => $vehiculo->ultimaRecepcionEntrega->nivel_combustible_label,
                ] : null,
            ]);

        $motoristas = \App\Models\Motorista::query()
            ->disponibles()
            ->where('activo', true)
            ->whereNotIn('id', $motoristasOcupados)
            ->with('tipoLicencia')
            ->get()
            ->map(fn ($motorista) => [
                'id' => $motorista->id,
                'nombre' => $motorista->nombre,
                'licencia' => $motorista->tipoLicencia?->nombre,
            ]);

        return response()->json([
            'vehiculos' => $vehiculos,
            'motoristas' => $motoristas,
        ]);
    }

    /**
     * recursosDisponibles
     *
     * Calcula qué vehículos y motoristas están libres para un rango de fechas
     * solicitado. Pasos principales:
     * 1) Valida fechas de salida y retorno.
     * 2) Busca solicitudes ya asignadas/ocupadas que se solapen con ese rango.
     * 3) Excluye esos recursos y devuelve los activos restantes.
     *
     * Uso: el frontend lo invoca para mostrar opciones válidas al reasignar o
     *      al planear una solicitud sin causar solapamientos.
     */
    public function reasignar(Request $request, SolicitudTransporte $solicitud)
    {
        $this->authorizeJefe();

        $data = $request->validate([
            'vehiculo_id' => ['required', 'exists:vehiculos,id'],
            'motorista_id' => ['required', 'exists:motoristas,id'],
            'motivo_reasignacion' => ['required', 'string', 'min:10'],
        ]);

        try {
            $solicitud = $this->service->reasignar(
                $solicitud,
                Auth::id(),
                $data['vehiculo_id'],
                $data['motorista_id'],
                $data['motivo_reasignacion'],
            );

            return response()->json([
                'success' => true,
                'message' => 'Recursos reasignados correctamente.',
                'data' => $solicitud->fresh()->load(['unidad', 'solicitante', 'vehiculo', 'motorista']),
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    /**
     * reasignar
     *
     * Solicita al servicio la reasignación de vehículo y motorista para una
     * solicitud que ya fue aprobada o programada. Reglas clave:
     * - Sólo un `jefe` puede ejecutar esta acción (se valida arriba).
     * - Valida que el nuevo vehículo y motorista existan.
     * - El Servicio realizará las comprobaciones de disponibilidad y liberará
     *   los recursos anteriores si procede. Este método sólo orquesta la petición
     *   y devuelve el resultado al cliente.
     */
    public function asignarRecursos(Request $request, SolicitudTransporte $solicitud)
    {
        $data = $request->validate([
            'vehiculo_id' => ['required', 'exists:vehiculos,id'],
            'motorista_id' => ['required', 'exists:motoristas,id'],
            'justificacion' => ['nullable', 'string', 'min:10'],
        ]);

        try {
            $result = $this->service->asignarRecursos(
                $solicitud,
                Auth::id(),
                $data['vehiculo_id'],
                $data['motorista_id'],
                $data['justificacion'] ?? null,
            );

            return response()->json([
                'message' => 'Recursos asignados. Solicitud enviada a aprobación del Jefe.',
                'cambio_detectado' => $result['cambio_detectado'],
                'estado_nuevo' => $result['estado_nuevo'],
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function aprobarConDecision(Request $request, SolicitudTransporte $solicitud)
    {
        $data = $request->validate([
            'decision_final' => ['required', 'in:operativo,sistema,manual'],
            'comentario' => ['required', 'string'],
            'firma' => ['nullable', 'string'],
            'vehiculo_id' => ['required_if:decision_final,manual', 'exists:vehiculos,id'],
            'motorista_id' => ['required_if:decision_final,manual', 'exists:motoristas,id'],
        ]);

        try {
            $result = $this->service->aprobarConDecision(
                $solicitud,
                Auth::id(),
                $data['decision_final'],
                $data['comentario'],
                $data['firma'] ?? null,
                $data['vehiculo_id'] ?? null,
                $data['motorista_id'] ?? null,
            );

            return response()->json([
                'success' => true,
                'message' => "Solicitud {$solicitud->codigo} autorizada institucionalmente con éxito.",
                'estado_final' => $result['estado_final'],
                'recursos_consolidados' => $result['recursos_consolidados'],
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    /**
     * aprobarConDecision
     *
     * Punto final que permite al jefe marcar la decisión final sobre la
     * asignación de recursos: puede elegir la decisión propuesta por el
     * operativo (`operativo`), la sugerida por el sistema (`sistema`) o
     * indicar manualmente los IDs de vehículo y motorista (`manual`).
     *
     * Comportamiento:
     * - Valida entrada (comentario, tipo de decisión, y recursos si es manual).
     * - Llama al servicio para aplicar la decisión y consolidar (reservar)
     *   los recursos seleccionados.
     * - Devuelve el estado final y los recursos consolidados al cliente.
     */
    public function desbloquear(SolicitudTransporte $solicitud)
    {
        try {
            $result = $this->service->desbloquear($solicitud, Auth::id());

            return response()->json($result);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function programar(SolicitudTransporte $solicitud)
    {
        try {
            $result = $this->service->programar($solicitud, Auth::id());

            return response()->json($result);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function cancelar(Request $request, SolicitudTransporte $solicitud)
    {
        $data = $request->validate([
            'motivo_cancelacion' => ['required', 'string', 'min:10', 'max:2000'],
        ]);

        try {
            $solicitud = $this->service->cancelar($solicitud, Auth::id(), $data['motivo_cancelacion']);

            return response()->json([
                'data' => $solicitud->fresh()->load(['unidad', 'solicitante']),
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    // =====================================================
    // Helpers de autorización
    // =====================================================

    private function authorizeOwner(SolicitudTransporte $solicitud): void
    {
        if ($solicitud->solicitante_id !== Auth::id()) {
            abort(Response::HTTP_FORBIDDEN, 'No autorizado para gestionar esta solicitud.');
        }
    }

    private function authorizeJefe(): void
    {
        if (! Auth::user()->hasAnyRole(['jefe', 'admin', 'ti', 'super_admin'])) {
            abort(Response::HTTP_FORBIDDEN, 'Solo personal autorizado puede realizar esta acción.');
        }
    }

    private function authorizeView(SolicitudTransporte $solicitud): void
    {
        $user = Auth::user();

        if ($user->hasAnyRole(['jefe', 'admin', 'ti', 'super_admin'])) {
            return;
        }

        if ($solicitud->solicitante_id !== $user->id) {
            abort(Response::HTTP_FORBIDDEN, 'No tienes permiso para ver esta solicitud.');
        }
    }

    private function rangeLabel(array $filters): string
    {
        $from = ! empty($filters['date_from'])
            ? \Carbon\Carbon::parse($filters['date_from'])->format('d/m/Y')
            : 'Inicio';

        $to = ! empty($filters['date_to'])
            ? \Carbon\Carbon::parse($filters['date_to'])->format('d/m/Y')
            : 'Fin';

        return "Periodo: {$from} al {$to}";
    }
}
