<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Domain\Solicitudes\Services\SolicitudTransporteService;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\SolicitudTransporte;
use App\Models\HistorialEstado;
use App\Models\BitacoraEvento;
use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use App\Domain\Solicitudes\Services\Reportes\ReporteMisionOficialService;

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

        if (! $user->hasAnyRole(['jefe', 'admin', 'ti'])) {
            $query->where('solicitante_id', $user->id);
        }

        return response()->json(
            $query->orderByDesc('created_at')->paginate(10)
        );
    }

    /**
     * Crear solicitud (Queda como PENDIENTE tras el service)
     */public function store(Request $request)
{
    $data = $request->validate([
        'unidad_solicitante_id' => ['required', 'exists:unidad_solicitantes,id'],
        'motivo_actividad'      => ['required', 'string'],
        'origen'                => ['required', 'string'],
        'destino_principal'     => ['required', 'string'], 
        'destino_adicional'     => ['nullable', 'string'],
        'fecha_salida'          => ['required', 'date'],
        'fecha_retorno'         => ['nullable', 'date', 'after_or_equal:fecha_salida'],
        'hora_salida'           => ['required'], 
        'cantidad_personas'     => ['required', 'integer', 'min:1'],
        'prioridad'             => ['required', 'string'],
        'tipo_vehiculo'         => ['required', 'string'],
        'encargado'             => ['required', 'string'], 
        'subencargado'          => ['nullable', 'string'],
        
        // --- NUEVOS CAMPOS DE COORDENADAS ---
        'origen_lat'            => ['nullable', 'numeric'],
        'origen_lng'            => ['nullable', 'numeric'],
        'destino_lat'           => ['nullable', 'numeric'],
        'destino_lng'           => ['nullable', 'numeric'],
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

    $solicitud = SolicitudTransporte::create([
        ...$data, // Aquí ya se incluyen las latitudes y longitudes validadas
        'destino'               => $destinoReal,
        'destino_adicional'     => $destinoAdicional,
        'tipo_vehiculo_nombre'  => $tipoVehiculoNombre,
        'solicitante_id'        => Auth::id(),
        'estado'                => EstadoSolicitudEnum::BORRADOR,
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
        $solicitud->load(['unidad', 'solicitante', 'autorizador', 'vehiculo', 'motorista']) //Catalogos nuevos agregados
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
    public function finalizar(SolicitudTransporte $solicitud)
    {
        $this->authorizeOwner($solicitud);

        if ($solicitud->estado !== EstadoSolicitudEnum::PROGRAMADA && $solicitud->estado !== EstadoSolicitudEnum::APROBADA && $solicitud->estado !== EstadoSolicitudEnum::ASIGNADA) {
            return response()->json([
                'error' => 'Solo se pueden finalizar solicitudes que estén programadas, asignadas y/o aprobada.'
            ], 422);
        }

        $estadoAnterior = $solicitud->estado;
        $solicitud->estado = EstadoSolicitudEnum::COMPLETADA;
        $solicitud->save();

        // Registrar en Historial para Filament
        HistorialEstado::create([
            'entidad_tipo'    => 'solicitud_transporte',
            'entidad_id'      => $solicitud->id,
            'estado_anterior' => $estadoAnterior->value,
            'estado_nuevo'    => EstadoSolicitudEnum::COMPLETADA->value,
            'user_id'         => Auth::id(),
            'comentario'      => 'Finalizada por el usuario desde el frontend.',
        ]);

        return response()->json([
            'message' => 'Viaje finalizado con éxito.',
            'data' => $solicitud->fresh()->load(['unidad', 'solicitante'])
        ]);
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
    \App\Models\SolicitudTransporte $solicitud = null // <-- Importante: mismo nombre que en la ruta
) {
    if ($solicitud && $solicitud->exists) {
        // CASO A: Imprimir una sola misión oficial (Botón de Filament)
        $solicitud->load([
            'solicitante', 'autorizador', 'motorista', 'tipoVehiculo',
            'vehiculo.marca', 'vehiculo.modelo', 'vehiculo.color', 'vehiculo.clasificacion'
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
        'rangeLabel' => ($solicitud && $solicitud->exists) ? "Misión Individual" : $this->rangeLabel($filters),
    ])->setPaper('a4', 'portrait')->stream('mision_oficial.pdf');
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
        if (! Auth::user()->hasAnyRole(['jefe', 'admin', 'ti'])) {
            abort(Response::HTTP_FORBIDDEN, 'Solo personal autorizado puede realizar esta acción.');
        }
    }

    private function authorizeView(SolicitudTransporte $solicitud): void
    {
        $user = Auth::user();

        if ($user->hasAnyRole(['jefe', 'admin', 'ti'])) {
            return;
        }

        if ($solicitud->solicitante_id !== $user->id) {
            abort(Response::HTTP_FORBIDDEN, 'No tienes permiso para ver esta solicitud.');
        }
    }

    private function rangeLabel(array $filters): string
{
    $from = !empty($filters['date_from'])
        ? \Carbon\Carbon::parse($filters['date_from'])->format('d/m/Y')
        : 'Inicio';

    $to = !empty($filters['date_to'])
        ? \Carbon\Carbon::parse($filters['date_to'])->format('d/m/Y')
        : 'Fin';

    return "Periodo: {$from} al {$to}";
}
}