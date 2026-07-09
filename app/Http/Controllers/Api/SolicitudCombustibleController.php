<?php

// -----------------------------------------------------------------------------
// CONTROLADOR DE SOLICITUDES DE COMBUSTIBLE
// -----------------------------------------------------------------------------
// Este controlador permite a los empleados crear solicitudes de combustible
// para los vehículos. Maneja todo el proceso: crear, enviar, aprobar,
// rechazar, finalizar y cancelar solicitudes. También permite a los jefes
// hacer observaciones y pre-aprobar. Cada solicitud pasa por varios estados
// (borrador, pendiente, aprobada, asignada, completada, cancelada).

namespace App\Http\Controllers\Api;

use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use App\Domain\Solicitudes\Services\SolicitudCombustibleService;
use App\Models\SolicitudCombustible;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SolicitudCombustibleController extends BaseSolicitudController
{
    public function __construct(
        protected SolicitudCombustibleService $service
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $query = SolicitudCombustible::query()
            ->with(['vehiculo.vehMarca', 'vehiculo.vehModelo', 'motorista', 'solicitante', 'aprobador', 'solicitudTransporte']);

        if (! $user->hasAnyRole(['jefe', 'admin', 'ti', 'super_admin'])) {
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
            $solicitud->load(['vehiculo.vehMarca', 'vehiculo.vehModelo', 'vehiculo.ultimaRecepcionEntrega', 'motorista', 'solicitante', 'aprobador', 'solicitudTransporte'])
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

        $request->validate([
            'forma_pago' => ['required', 'in:carga,ticket,tarjeta,efectivo,otro'],
            'numero_vale_ticket' => ['nullable', 'string'],
            'valor_total' => ['required', 'numeric', 'min:0'],
            'comprobantes' => ['required', 'array', 'min:1'],
            'comprobantes.*' => ['file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        $rutas = [];
        foreach ($request->file('comprobantes') as $archivo) {
            $rutas[] = $archivo->store('combustible/comprobantes', 'public');
        }

        try {
            $solicitud = $this->service->completar($solicitud, Auth::id(), [
                'forma_pago' => $request->forma_pago,
                'numero_vale_ticket' => $request->numero_vale_ticket,
                'valor_total' => $request->valor_total,
                'comprobantes' => $rutas,
            ]);

            return response()->json([
                'message' => 'Carga de combustible finalizada con éxito.',
                'data' => $solicitud->fresh(),
            ]);
        } catch (\DomainException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function cancelar(Request $request, SolicitudCombustible $solicitud)
    {
        $this->authorizeOwner($solicitud);

        $data = $request->validate([
            'motivo_cancelacion' => ['required', 'string', 'min:10', 'max:2000'],
        ]);

        try {
            $solicitud = $this->service->cancelar($solicitud, Auth::id(), $data['motivo_cancelacion']);

            return response()->json([
                'message' => 'Solicitud cancelada correctamente.',
                'data' => $solicitud->fresh()->load(['vehiculo', 'motorista', 'solicitante']),
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

    public function comparativa(SolicitudCombustible $solicitud)
    {
        $this->authorizeJefe();

        return response()->json($this->service->comparativa($solicitud));
    }

    public function asignarCarga(Request $request, SolicitudCombustible $solicitud)
    {
        $this->authorizeOperativo();

        $data = $request->validate([
            'monto_aprobado' => ['required', 'numeric', 'min:0.01'],
            'justificacion' => ['nullable', 'string', 'max:2000'],
        ]);

        try {
            $result = $this->service->asignarCarga(
                $solicitud,
                Auth::id(),
                $data['monto_aprobado'],
                $data['justificacion'] ?? null
            );

            return response()->json([
                'message' => 'Carga asignada correctamente.',
                'data' => $result,
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function asignarVales(Request $request, SolicitudCombustible $solicitud)
    {
        $this->authorizeOperativo();

        $data = $request->validate([
            'contrato_id' => ['required', 'exists:contrato_combustibles,id'],
            'serie_vale_id' => ['required', 'exists:series_carga,id'],
            'cantidad_vales' => ['required', 'integer', 'min:1'],
        ]);

        try {
            $solicitud = $this->service->asignarVales(
                $solicitud,
                Auth::id(),
                $data
            );

            return response()->json([
                'message' => 'Vales asignados correctamente.',
                'data' => $solicitud->fresh()->load(['vehiculo', 'motorista', 'solicitante', 'contrato', 'serieVale']),
            ]);
        } catch (\DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'codigo' => $solicitud->codigo,
                'estado_actual' => $solicitud->estado?->value ?? $solicitud->estado,
                'sugerencia' => 'Revisa el estado de la solicitud en el panel de administración o contacta al operador encargado.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function aprobarConDecision(Request $request, SolicitudCombustible $solicitud)
    {
        $this->authorizeJefe();

        $data = $request->validate([
            'decision_final' => ['required', 'in:operativo,jefe'],
            'monto_aprobado' => ['nullable', 'numeric', 'min:0.01'],
            'comentario' => ['nullable', 'string', 'max:2000'],
        ]);

        try {
            $result = $this->service->aprobarConDecision(
                $solicitud,
                Auth::id(),
                $data['decision_final'],
                $data['monto_aprobado'] ?? null,
                $data['comentario'] ?? null
            );

            return response()->json([
                'message' => 'Solicitud aprobada con decisión.',
                'data' => $result,
            ]);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function desbloquear(SolicitudCombustible $solicitud)
    {
        $this->authorizeJefe();

        try {
            $result = $this->service->desbloquear($solicitud, Auth::id());

            return response()->json($result);
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
