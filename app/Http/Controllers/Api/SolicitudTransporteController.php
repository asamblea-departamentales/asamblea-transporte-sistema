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
            ->with(['unidad', 'solicitante', 'autorizador']);

        if (! $user->hasAnyRole(['jefe', 'admin', 'ti'])) {
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
            'motivo_actividad'      => ['required', 'string'],
            'origen'                => ['required', 'string'],
            'destino'               => ['required', 'string'],
            'destino_adicional'     => ['nullable', 'string', 'max:255'],
            'fecha_salida'          => ['required', 'date'],
            'fecha_retorno'         => ['nullable', 'date', 'after_or_equal:fecha_salida'],
            'cantidad_personas'     => ['required', 'integer', 'min:1'],
            'prioridad'             => ['required', 'string'],
        ]);

        $solicitud = SolicitudTransporte::create([
            ...$data,
            'solicitante_id' => Auth::id(),
            'estado' => EstadoSolicitudEnum::BORRADOR,
        ]);

        // El service cambia el estado de BORRADOR a PENDIENTE y notifica
        $solicitud = $this->service->enviarSolicitud($solicitud, Auth::id());

        return response()->json($solicitud->fresh()->load(['unidad', 'solicitante']), 201);
    }

    /**
     * Ver detalle
     */
    public function show(SolicitudTransporte $solicitud)
    {
        $this->authorizeView($solicitud);

        return response()->json(
            $solicitud->load(['unidad', 'solicitante', 'autorizador'])
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

        if ($solicitud->estado !== EstadoSolicitudEnum::EN_EJECUCION) {
            return response()->json([
                'error' => 'Solo se pueden finalizar solicitudes que estén en ejecución.'
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
}