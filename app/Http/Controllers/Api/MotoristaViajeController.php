<?php

// -----------------------------------------------------------------------------
// CONTROLADOR DE VIAJES DEL MOTORISTA
// -----------------------------------------------------------------------------
// Este controlador permite al motorista gestionar sus propios viajes desde
// el sistema: iniciar un viaje, registrar la llegada al destino, iniciar
// el retorno y finalizar el viaje. Cada paso registra la hora exacta en
// que ocurrió y guarda un historial de lo que sucedió.

namespace App\Http\Controllers\Api;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Services\EstadoFlotaService;
use App\Domain\Solicitudes\Services\SolicitudTransporteService;
use App\Http\Controllers\Controller;
use App\Models\BitacoraEvento;
use App\Models\HistorialEstado;
use App\Models\SolicitudTransporte;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MotoristaViajeController extends Controller
{
    public function __construct(
        protected SolicitudTransporteService $service
    ) {}

    private function verificarOwnership(SolicitudTransporte $solicitud): void
    {
        $motorista = Auth::user()->motorista;
        if (! $motorista || $solicitud->motorista_id !== $motorista->id) {
            abort(403, 'Este viaje no te está asignado.');
        }
    }

    public function iniciar(Request $request, SolicitudTransporte $solicitud)
    {
        $this->verificarOwnership($solicitud);

        $request->validate([
            'timestamp_real' => 'nullable|date_format:Y-m-d\TH:i:s.v\Z,Y-m-d H:i:s',
        ]);

        return DB::transaction(function () use ($solicitud, $request) {
            $solicitud = SolicitudTransporte::lockForUpdate()->findOrFail($solicitud->id);

            if (! in_array($solicitud->estado, [
                EstadoSolicitudEnum::PROGRAMADA,
                EstadoSolicitudEnum::APROBADA,
                EstadoSolicitudEnum::ASIGNADA,
            ], true)) {
                return response()->json([
                    'message' => 'El viaje no está en un estado que permita iniciarlo.',
                ], 422);
            }

            $anterior = $solicitud->estado;
            $solicitud->estado = EstadoSolicitudEnum::EN_EJECUCION;
            $solicitud->fecha_salida_real = $request->input('timestamp_real', now());
            $solicitud->save();

            app(EstadoFlotaService::class)->aplicarPorEstado($solicitud);

            HistorialEstado::create([
                'entidad_tipo' => 'solicitud_transporte',
                'entidad_id' => $solicitud->id,
                'estado_anterior' => $anterior?->value,
                'estado_nuevo' => EstadoSolicitudEnum::EN_EJECUCION->value,
                'user_id' => Auth::id(),
                'comentario' => 'Viaje iniciado por el motorista.',
            ]);

            BitacoraEvento::create([
                'entidad_tipo' => 'solicitud_transporte',
                'entidad_id' => $solicitud->id,
                'accion' => 'INICIAR_VIAJE_MOTORISTA',
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'message' => 'Viaje iniciado.',
                'fecha_salida_real' => $solicitud->fecha_salida_real,
            ]);
        });
    }

    public function llegadaDestino(Request $request, SolicitudTransporte $solicitud)
    {
        $this->verificarOwnership($solicitud);

        if ($solicitud->estado !== EstadoSolicitudEnum::EN_EJECUCION) {
            return response()->json(['message' => 'El viaje debe estar en ejecución.'], 422);
        }

        $request->validate([
            'timestamp_real' => 'nullable|date_format:Y-m-d\TH:i:s.v\Z,Y-m-d H:i:s',
        ]);

        $solicitud->fecha_llegada_destino = $request->input('timestamp_real', now());
        $solicitud->save();

        return response()->json([
            'message' => 'Llegada registrada.',
            'fecha_llegada_destino' => $solicitud->fecha_llegada_destino,
        ]);
    }

    public function iniciarRetorno(Request $request, SolicitudTransporte $solicitud)
    {
        $this->verificarOwnership($solicitud);

        if (! $solicitud->fecha_llegada_destino) {
            return response()->json([
                'message' => 'Debe registrar la llegada a destino primero.',
            ], 422);
        }

        $request->validate([
            'timestamp_real' => 'nullable|date_format:Y-m-d\TH:i:s.v\Z,Y-m-d H:i:s',
        ]);

        $solicitud->fecha_inicio_retorno = $request->input('timestamp_real', now());
        $solicitud->save();

        return response()->json([
            'message' => 'Retorno iniciado.',
            'fecha_inicio_retorno' => $solicitud->fecha_inicio_retorno,
        ]);
    }

    public function finalizar(Request $request, SolicitudTransporte $solicitud)
    {
        $this->verificarOwnership($solicitud);

        if ($solicitud->estado !== EstadoSolicitudEnum::EN_EJECUCION) {
            return response()->json([
                'message' => 'El viaje debe estar en ejecución para finalizarlo.',
            ], 422);
        }

        $request->validate([
            'timestamp_real' => 'nullable|date_format:Y-m-d\TH:i:s.v\Z,Y-m-d H:i:s',
        ]);

        if ($solicitud->fecha_salida_real && ! $solicitud->fecha_retorno_real) {
            $solicitud->fecha_retorno_real = $request->input('timestamp_real', now());
            $solicitud->save();
        }

        $solicitud = $this->service->finalizar($solicitud, Auth::id());

        return response()->json([
            'message' => 'Viaje finalizado con éxito.',
            'horas_reales' => $solicitud->horas_reales,
            'horas_espera' => $solicitud->horas_espera,
        ]);
    }

    public function show(SolicitudTransporte $solicitud)
    {
        $this->verificarOwnership($solicitud);

        $solicitud->load('solicitante');

        return response()->json([
            'id' => $solicitud->id,
            'fecha' => $solicitud->fecha_salida?->format('Y-m-d'),
            'hora_salida' => $solicitud->fecha_salida?->format('H:i'),
            'origen' => $solicitud->origen,
            'destino' => $solicitud->destino,
            'estado' => strtoupper($solicitud->estado->value),
            'solicitante' => $solicitud->solicitante?->name ?? 'Desconocido',
            'fecha_salida_real' => $solicitud->fecha_salida_real,
            'fecha_llegada_destino' => $solicitud->fecha_llegada_destino,
            'fecha_inicio_retorno' => $solicitud->fecha_inicio_retorno,
            'fecha_retorno_real' => $solicitud->fecha_retorno_real,
        ]);
    }
}
