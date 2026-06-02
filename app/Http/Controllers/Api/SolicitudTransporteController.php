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

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Services\Reportes\ReporteMisionOficialService;
use App\Domain\Solicitudes\Services\SolicitudTransporteService;
use App\Http\Controllers\Controller;
use App\Models\SolicitudTransporte;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Carbon\Carbon;

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

            //NUEVOS CAMPOS PARA HORAS MANEJADAS DE MOTORISTAS
            'hora_retorno' => ['nullable'],

            // --- NUEVOS CAMPOS DE COORDENADAS ---
            'origen_lat' => ['nullable', 'numeric'],
            'origen_lng' => ['nullable', 'numeric'],
            'destino_lat' => ['nullable', 'numeric'],
            'destino_lng' => ['nullable', 'numeric'],
            'destino_adicional_lat' => ['nullable', 'numeric'],
            'destino_adicional_lng' => ['nullable', 'numeric'],
        ]);

        // --- MAPEO DE DATOS ---
        $tipoVehiculoNombre = $data['tipo_vehiculo'];
        $destinoReal = $data['destino_principal'];
        $destinoAdicional = $data['destino_adicional'] ?? null;

        // Extraemos las coordenadas para que no estorben en el resto de la lógica si fuera necesario
        // aunque al usar el spread operator (...) podemos dejarlas en $data si los nombres coinciden con la BD.

        // Limpiamos los campos que no van directo a columnas con el mismo nombre
        unset($data['tipo_vehiculo'], $data['destino_principal'], $data['destino_adicional']);

        // Mergear hora_salida en fecha_salida y hora_retorno en fecha_retorno
        if (!empty($data['hora_salida']) && !empty($data['fecha_salida'])) {
            $fecha = $data['fecha_salida'] instanceof Carbon ? $data['fecha_salida'] : Carbon::parse($data['fecha_salida']);
            $data['fecha_salida'] = Carbon::parse($fecha->format('Y-m-d') . ' ' . $data['hora_salida']);
        }
        unset($data['hora_salida']);

        if (!empty($data['hora_retorno']) && !empty($data['fecha_retorno'])) {
            $fecha = $data['fecha_retorno'] instanceof Carbon ? $data['fecha_retorno'] : Carbon::parse($data['fecha_retorno']);
            $data['fecha_retorno'] = Carbon::parse($fecha->format('Y-m-d') . ' ' . $data['hora_retorno']);
        }
        unset($data['hora_retorno']);

        $user = Auth::user();

        $solicitud = SolicitudTransporte::create([
            ...$data, // Aquí ya se incluyen las latitudes y longitudes validadas
            'destino' => $destinoReal,
            'destino_adicional' => $destinoAdicional,
            'tipo_vehiculo_nombre' => $tipoVehiculoNombre,
            'solicitante_id' => $user->id,
            'prioridad_grupo' => $user->grupo?->nivel_prioridad ?? 'baja',
            'estado' => EstadoSolicitudEnum::BORRADOR,
        ]);

        // El service cambia el estado de BORRADOR a PENDIENTE y notifica (aquí se enviará el correo)
        $solicitud = $this->service->enviarSolicitud($solicitud, Auth::id());

        return response()->json(
            $solicitud->fresh()->load(['unidad', 'solicitante']),
            201
        );
    }

    /**
     * Ver detalle
     */
    public function show(SolicitudTransporte $solicitud)
    {
        $this->authorizeView($solicitud);

        return response()->json(
            $solicitud->load(['unidad', 'solicitante', 'autorizador', 'vehiculo', 'motorista']) // Catalogos nuevos agregados
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
            'sugerencia.vehiculoSugerido', 'sugerencia.motoristaSugerido',
            'decisionOperativa.vehiculoFinal', 'decisionOperativa.motoristaFinal',
            'decisionOperativa.usuarioOperativo',
        ]);

        return response()->json([
            'solicitud' => [
                'id' => $solicitud->codigo,
                'solicitante' => ($solicitud->solicitante?->name ?? '') . ' (' . ($solicitud->unidad?->nombre ?? '') . ')',
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
            ],
            'operativo' => $solicitud->decisionOperativa ? [
                'autor' => $solicitud->decisionOperativa->usuarioOperativo?->name,
                'vehiculo' => [
                    'id' => $solicitud->decisionOperativa->vehiculoFinal?->id,
                    'placa' => $solicitud->decisionOperativa->vehiculoFinal?->placa,
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
            'decision_final' => ['required', 'in:operativo,sistema'],
            'comentario' => ['required', 'string'],
            'firma' => ['nullable', 'string'],
        ]);

        try {
            $result = $this->service->aprobarConDecision(
                $solicitud,
                Auth::id(),
                $data['decision_final'],
                $data['comentario'],
                $data['firma'] ?? null,
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
