<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Domain\Solicitudes\Services\SolicitudTransporteService;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\SolicitudTransporte;
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
     * - Jefe: ve todas
     * - Usuario: solo las suyas
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = SolicitudTransporte::query()
            ->with(['unidad', 'solicitante']);

        if (! $user->hasRole('jefe')) {
            $query->where('solicitante_id', $user->id);
        }

        return response()->json(
            $query->orderByDesc('created_at')->paginate(10)
        );
    }

    /**
     * Crear solicitud (queda como BORRADOR)
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'unidad_solicitante_id' => ['required', 'exists:unidad_solicitantes,id'],
            'motivo_actividad'      => ['required', 'string'],
            'origen'                => ['required', 'string'],
            'destino'               => ['required', 'string'],
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

        return response()->json($solicitud, Response::HTTP_CREATED);
    }

    /**
     * Ver detalle
     */
    public function show(SolicitudTransporte $solicitud)
    {
        $this->authorizeView($solicitud);

        return response()->json(
            $solicitud->load(['unidad', 'solicitante'])
        );
    }

    /**
     * Enviar solicitud (BORRADOR -> PENDIENTE)
     */
    public function enviar(SolicitudTransporte $solicitud)
    {
        $this->authorizeOwner($solicitud);

        try {
            $this->service->enviarSolicitud($solicitud, Auth::id());

            return response()->json([
                'message' => 'Solicitud enviada correctamente',
                'data' => $solicitud,
            ]);
        } catch (\DomainException $e) {
            return response()->json(
                ['message' => $e->getMessage()],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
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
            $this->service->observar(
                $solicitud,
                Auth::id(),
                $data['comentario']
            );

            return response()->json([
                'message' => 'Observación registrada',
                'data' => $solicitud,
            ]);
        } catch (\DomainException $e) {
            return response()->json(
                ['message' => $e->getMessage()],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }
    }

    /**
     * Aprobar solicitud
     */
    public function aprobar(SolicitudTransporte $solicitud)
    {
        $this->authorizeJefe();

        try {
            $this->service->aprobar($solicitud, Auth::id());

            return response()->json([
                'message' => 'Solicitud aprobada',
                'data' => $solicitud,
            ]);
        } catch (\DomainException $e) {
            return response()->json(
                ['message' => $e->getMessage()],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
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
            $this->service->rechazar(
                $solicitud,
                Auth::id(),
                $data['comentario']
            );

            return response()->json([
                'message' => 'Solicitud rechazada',
                'data' => $solicitud,
            ]);
        } catch (\DomainException $e) {
            return response()->json(
                ['message' => $e->getMessage()],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }
    }

    // =====================================================
    // Helpers de autorización
    // =====================================================

    private function authorizeOwner(SolicitudTransporte $solicitud): void
    {
        if ($solicitud->solicitante_id !== Auth::id()) {
            abort(Response::HTTP_FORBIDDEN, 'No autorizado');
        }
    }

    private function authorizeJefe(): void
    {
        if (! Auth::user()->hasRole('jefe')) {
            abort(Response::HTTP_FORBIDDEN, 'Solo jefatura puede realizar esta acción');
        }
    }

    private function authorizeView(SolicitudTransporte $solicitud): void
    {
        $user = Auth::user();

        if ($user->hasRole('jefe')) {
            return;
        }

        if ($solicitud->solicitante_id !== $user->id) {
            abort(Response::HTTP_FORBIDDEN, 'No autorizado');
        }
    }
}
