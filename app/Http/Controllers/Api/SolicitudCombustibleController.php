<?php

namespace App\Http\Controllers\Api;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use App\Domain\Solicitudes\Services\SolicitudCombustibleService;
use App\Http\Controllers\Controller;
use App\Models\HistorialEstado;
use App\Models\SolicitudCombustible;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SolicitudCombustibleController extends Controller
{
    public function __construct(
        protected SolicitudCombustibleService $service
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $query = SolicitudCombustible::query()
            ->with(['vehiculo.vehMarca', 'vehiculo.vehModelo', 'motorista', 'solicitante', 'aprobador', 'solicitudTransporte']);

        if (! $user->hasAnyRole(['jefe', 'admin', 'ti'])) {
            $query->where('solicitante_id', $user->id);
        }

        return response()->json(
            $query->orderByDesc('created_at')->paginate(10)
        );
    }

    public function store(Request $request)
    {
        if ($request->has('cantidad') && ! $request->has('cantidad_combustible')) {
            $request->merge(['cantidad_combustible' => $request->cantidad]);
        }

        $data = $request->validate([
            'vehiculo_id' => ['required', 'exists:vehiculos,id'],
            'motorista_id' => ['nullable', 'exists:motoristas,id'],
            'solicitud_transporte_id' => ['nullable', 'exists:solicitud_transportes,id'],
            'destino_actividad' => ['required', 'string'],
            'fecha_solicitud' => ['required', 'date'],
            'fecha_inicio_periodo' => ['nullable', 'date'],
            'fecha_fin_periodo' => ['nullable', 'date', 'after_or_equal:fecha_inicio_periodo'],
            'cantidad_combustible' => ['required', 'numeric', 'min:0'],
            'observaciones' => ['nullable', 'string', 'max:2000'],
            // 'prioridad' eliminado — el backend la asigna
        ]);

        // El backend siempre asigna MEDIA por defecto
        $data['prioridad'] = PrioridadSolicitudEnum::MEDIA;

        try {
            $solicitud = $this->service->crear($data, Auth::id());
            $solicitud = $this->service->enviarSolicitud($solicitud, Auth::id());

            return response()->json(
                $solicitud->fresh()->load(['vehiculo.vehMarca', 'vehiculo.vehModelo', 'motorista', 'solicitante']),
                201
            );
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show(SolicitudCombustible $solicitud)
    {
        $this->authorizeView($solicitud);

        return response()->json(
            $solicitud->load(['vehiculo.vehMarca', 'vehiculo.vehModelo', 'motorista', 'solicitante', 'aprobador', 'solicitudTransporte'])
        );
    }

    public function enviar(SolicitudCombustible $solicitud)
    {
        $this->authorizeOwner($solicitud);

        try {
            $solicitud = $this->service->enviarSolicitud($solicitud, Auth::id());

            return response()->json([
                'message' => 'Solicitud enviada correctamente.',
                'data' => $solicitud->fresh()->load(['vehiculo', 'motorista', 'solicitante']),
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function finalizar(Request $request, SolicitudCombustible $solicitud)
    {
        $this->authorizeOwner($solicitud);

        if ($solicitud->estado !== EstadoSolicitudEnum::ASIGNADA) {
            return response()->json(['error' => 'Solo se pueden finalizar solicitudes que ya tengan cupones asignados.'], 422);
        }

        $request->validate([
            'forma_pago' => ['required', 'in:vale,ticket,tarjeta,efectivo,otro'],
            'numero_vale_ticket' => ['nullable', 'string'],
            'valor_total' => ['required', 'numeric', 'min:0'],
            'comprobantes' => ['required', 'array', 'min:1'],
            'comprobantes.*' => ['file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        $rutas = [];
        foreach ($request->file('comprobantes') as $archivo) {
            $rutas[] = $archivo->store('combustible/comprobantes', 'public');
        }

        $estadoAnterior = $solicitud->estado;
        $solicitud->estado = EstadoSolicitudEnum::COMPLETADA;
        $solicitud->forma_pago = $request->forma_pago;
        $solicitud->valor_total = $request->valor_total;
        $solicitud->numero_vale_ticket = $request->numero_vale_ticket;
        $solicitud->comprobantes = array_merge($solicitud->comprobantes ?? [], $rutas);
        $solicitud->save();

        HistorialEstado::create([
            'entidad_tipo' => 'solicitud_combustible',
            'entidad_id' => $solicitud->id,
            'estado_anterior' => $estadoAnterior->value,
            'estado_nuevo' => EstadoSolicitudEnum::COMPLETADA->value,
            'user_id' => Auth::id(),
            'comentario' => 'Carga de combustible finalizada por el usuario.',
        ]);

        return response()->json([
            'message' => 'Carga de combustible finalizada con éxito.',
            'data' => $solicitud->fresh(),
        ]);
    }

    public function cancelar(SolicitudCombustible $solicitud)
    {
        $this->authorizeOwner($solicitud);

        try {
            $solicitud = $this->service->cancelar($solicitud, Auth::id());

            return response()->json([
                'message' => 'Solicitud cancelada correctamente.',
                'data' => $solicitud->fresh(),
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function observacion(Request $request, SolicitudCombustible $solicitud)
    {
        $this->authorizeJefe();

        $data = $request->validate([
            'comentario' => ['required', 'string', 'max:2000'],
        ]);

        try {
            $solicitud = $this->service->observar($solicitud, Auth::id(), $data['comentario']);

            return response()->json([
                'message' => 'Observación registrada.',
                'data' => $solicitud->fresh()->load(['vehiculo', 'motorista', 'solicitante']),
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function preAprobar(SolicitudCombustible $solicitud)
    {
        $this->authorizeJefe();

        try {
            $solicitud = $this->service->preAprobar($solicitud, Auth::id());

            return response()->json([
                'message' => 'Solicitud pre-aprobada exitosamente.',
                'data' => $solicitud->fresh()->load(['vehiculo', 'motorista', 'solicitante']),
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function aprobar(Request $request, SolicitudCombustible $solicitud)
    {
        $this->authorizeJefe();

        $data = $request->validate([
            'observaciones' => ['required', 'string', 'max:2000'],
        ]);

        try {
            $solicitud = $this->service->aprobar($solicitud, Auth::id(), $data['observaciones']);

            return response()->json([
                'message' => 'Solicitud aprobada con éxito.',
                'data' => $solicitud->fresh()->load(['vehiculo', 'motorista', 'solicitante']),
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function rechazar(Request $request, SolicitudCombustible $solicitud)
    {
        $this->authorizeJefe();

        $data = $request->validate([
            'motivo' => ['required', 'string', 'max:2000'],
        ]);

        try {
            $solicitud = $this->service->rechazar($solicitud, Auth::id(), $data['motivo']);

            return response()->json([
                'message' => 'Solicitud rechazada.',
                'data' => $solicitud->fresh()->load(['vehiculo', 'motorista', 'solicitante']),
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    // ── HELPERS DE AUTORIZACIÓN ─────────────────────────────────────────────

    private function authorizeOwner(SolicitudCombustible $solicitud): void
    {
        if ($solicitud->solicitante_id !== Auth::id()) {
            abort(Response::HTTP_FORBIDDEN, 'No tienes permiso para realizar esta acción.');
        }
    }

    private function authorizeJefe(): void
    {
        if (! Auth::user()->hasAnyRole(['jefe', 'admin', 'ti'])) {
            abort(Response::HTTP_FORBIDDEN, 'Acción permitida únicamente para personal con rol de jefatura.');
        }
    }

    private function authorizeView(SolicitudCombustible $solicitud): void
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
