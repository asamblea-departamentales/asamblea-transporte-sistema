<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Domain\Solicitudes\Services\SolicitudMantenimientoService;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\SolicitudMantenimiento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;
use App\Models\HistorialEstado;
use App\Models\BitacoraEvento;
use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
class SolicitudMantenimientoController extends Controller
{
    public function __construct(
        protected SolicitudMantenimientoService $service
    ) {}

    public function index(Request $request)
    {
        $user  = $request->user();
        $query = SolicitudMantenimiento::query()
            ->with(['vehiculo.marca', 'vehiculo.modelo', 'tipoMantenimiento', 'solicitante', 'aprobador']);

        if (!$user->hasAnyRole(['jefe', 'admin', 'ti'])) {
            $query->where('solicitante_id', $user->id);
        }

        return response()->json(
            $query->orderByDesc('created_at')->paginate(10)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'vehiculo_id'               => ['required', 'exists:vehiculos,id'],
            'veh_tipo_mantenimiento_id' => ['required', 'exists:veh_tipo_mantenimientos,id'],
            'tipo_solicitud'            => ['required', 'in:taller,llantas'],
            'detalle'                   => ['required', 'string'],
            'fecha_sugerida'            => ['required', 'date'],
            // 'prioridad' ELIMINADO del request
            'costo_estimado'            => ['nullable', 'numeric', 'min:0'],
            'observaciones'             => ['nullable', 'string', 'max:2000'],
        ]);

        // ASIGNACIÓN AUTOMÁTICA EN BACKEND
        // Al igual que en combustible, asignamos MEDIA por defecto
        $data['prioridad'] = PrioridadSolicitudEnum::MEDIA;

        try {
            // Creamos la solicitud como BORRADOR inicialmente
            $solicitud = SolicitudMantenimiento::create([
                ...$data,
                'solicitante_id' => Auth::id(),
                'estado'         => EstadoSolicitudEnum::BORRADOR,
            ]);

            // Se envía automáticamente a PENDIENTE usando el service
            $solicitud = $this->service->enviarSolicitud($solicitud, Auth::id());

            return response()->json(
                $solicitud->fresh()->load(['vehiculo.marca', 'vehiculo.modelo', 'tipoMantenimiento', 'solicitante']),
                201
            );
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show(SolicitudMantenimiento $solicitud)
    {
        $this->authorizeView($solicitud);

        return response()->json(
            $solicitud->load(['vehiculo.marca', 'vehiculo.modelo', 'tipoMantenimiento', 'solicitante', 'aprobador', 'historialEstados'])
        );
    }

    public function enviar(SolicitudMantenimiento $solicitud)
    {
        $this->authorizeOwner($solicitud);

        try {
            $solicitud = $this->service->enviarSolicitud($solicitud, Auth::id());

            return response()->json([
                'message' => 'Solicitud enviada correctamente.',
                'data'    => $solicitud->fresh()->load(['vehiculo', 'tipoMantenimiento', 'solicitante']),
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function finalizar(Request $request, SolicitudMantenimiento $solicitud)
    {
        $this->authorizeOwner($solicitud);

        $data = $request->validate([
            'fecha_realizada' => ['required', 'date'],
            'costo_real'      => ['required', 'numeric', 'min:0'],
            'adjuntos'        => ['required', 'array', 'min:1'],
            'adjuntos.*'      => ['file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        $rutas = [];
        foreach ($request->file('adjuntos') as $archivo) {
            $rutas[] = $archivo->store('mantenimiento/comprobantes', 'public');
        }

        try {
            $solicitud = $this->service->completar($solicitud, Auth::id(), [
                'fecha_realizada' => $data['fecha_realizada'],
                'costo_real'      => $data['costo_real'],
                'adjuntos'        => $rutas,
            ]);

            return response()->json([
                'message' => 'Mantenimiento finalizado con éxito.',
                'data'    => $solicitud->fresh()->load(['vehiculo', 'tipoMantenimiento']),
            ]);
        } catch (\DomainException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }
    // ── POST /api/mantenimiento/{solicitud}/cancelar ─────────
    public function cancelar(SolicitudMantenimiento $solicitud)
    {
        $this->authorizeOwner($solicitud);

        try {
            $solicitud = $this->service->cancelar($solicitud, Auth::id());

            return response()->json([
                'message' => 'Solicitud cancelada.',
                'data'    => $solicitud->fresh(),
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    // ── POST /api/maintenance-requests/{solicitud}/observacion
public function observacion(Request $request, SolicitudMantenimiento $solicitud)
{
    $this->authorizeJefe();

    $data = $request->validate([
        'comentario' => ['required', 'string', 'max:2000'],
    ]);

    try {
        $solicitud = $this->service->observar($solicitud, Auth::id(), $data['comentario']);

        return response()->json([
            'message' => 'Observación registrada.',
            'data'    => $solicitud->fresh()->load(['vehiculo', 'tipoMantenimiento', 'solicitante']),
        ]);
    } catch (\DomainException $e) {
        return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
    }
}

// ── POST /api/maintenance-requests/{solicitud}/pre-aprobar
public function preAprobar(SolicitudMantenimiento $solicitud)
{
    $this->authorizeJefe();

    try {
        $solicitud = $this->service->preAprobar($solicitud, Auth::id());

        return response()->json([
            'message' => 'Solicitud pre-aprobada.',
            'data'    => $solicitud->fresh()->load(['vehiculo', 'tipoMantenimiento', 'solicitante']),
        ]);
    } catch (\DomainException $e) {
        return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
    }
}

// ── POST /api/maintenance-requests/{solicitud}/aprobar
public function aprobar(Request $request, SolicitudMantenimiento $solicitud)
{
    $this->authorizeJefe();

    $data = $request->validate([
        'observaciones' => ['required', 'string', 'max:2000'],
    ]);

    try {
        $solicitud = $this->service->aprobar($solicitud, Auth::id(), $data['observaciones']);

        return response()->json([
            'message' => 'Solicitud aprobada.',
            'data'    => $solicitud->fresh()->load(['vehiculo', 'tipoMantenimiento', 'solicitante']),
        ]);
    } catch (\DomainException $e) {
        return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
    }
}

// ── POST /api/maintenance-requests/{solicitud}/rechazar
public function rechazar(Request $request, SolicitudMantenimiento $solicitud)
{
    $this->authorizeJefe();

    $data = $request->validate([
        'motivo_rechazo' => ['required', 'string', 'max:2000'],
    ]);

    try {
        $solicitud = $this->service->rechazar($solicitud, Auth::id(), $data['motivo_rechazo']);
        return response()->json([
            'message' => 'Solicitud rechazada.',
            'data'    => $solicitud->fresh()->load(['vehiculo', 'tipoMantenimiento', 'solicitante']),
        ]);
    } catch (\DomainException $e) {
        return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
    }
}

// ── POST /api/maintenance-requests/{solicitud}/en-ejecucion
public function iniciarEjecucion(SolicitudMantenimiento $solicitud)
{
    $this->authorizeJefe();

    try {
        $solicitud = $this->service->iniciarEjecucion($solicitud, Auth::id());

        return response()->json([
            'message' => 'Mantenimiento en ejecución.',
            'data'    => $solicitud->fresh()->load(['vehiculo', 'tipoMantenimiento', 'solicitante']),
        ]);
    } catch (\DomainException $e) {
        return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
    }
}


    //Agregado para el proceso de evaluacion de mantenimiento
    public function evaluar(Request $request, SolicitudMantenimiento $solicitud)
{
    if (!auth()->user()->hasAnyRole(['jefe', 'operativo', 'liquidador'])) {
        abort(403);
    }

    $data = $request->validate([
        'estado' => ['required', 'in:conforme,observaciones,no_conforme'],
        'comentario' => ['nullable', 'string'],
    ]);

    try {
        $solicitud = $this->service->evaluar(
            $solicitud,
            auth()->id(),
            $data['estado'],
            $data['comentario']
        );

        return response()->json([
            'message' => 'Evaluación registrada.',
            'data' => $solicitud
        ]);

    } catch (\DomainException $e) {
        return response()->json(['error' => $e->getMessage()], 422);
    }
}
    // ── Helpers de autorización ──────────────────────────────

    private function authorizeOwner(SolicitudMantenimiento $solicitud): void
    {
        if ($solicitud->solicitante_id !== Auth::id()) {
            abort(Response::HTTP_FORBIDDEN, 'No autorizado para gestionar esta solicitud.');
        }
    }

    private function authorizeJefe(): void
    {
        if (!Auth::user()->hasAnyRole(['jefe', 'admin', 'ti'])) {
            abort(Response::HTTP_FORBIDDEN, 'Solo personal autorizado puede realizar esta acción.');
        }
    }

    private function authorizeView(SolicitudMantenimiento $solicitud): void
    {
        $user = Auth::user();

        if ($user->hasAnyRole(['jefe', 'admin', 'ti'])) {
            return;
        }

        if ($solicitud->solicitante_id !== $user->id) {
            abort(Response::HTTP_FORBIDDEN, 'No tienes permiso para ver esta solicitud.');
        }
    }
}