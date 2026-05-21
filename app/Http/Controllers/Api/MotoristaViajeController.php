<?php

namespace App\Http\Controllers\Api;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Services\EstadoFlotaService;
use App\Domain\Solicitudes\Services\SolicitudTransporteService;
use App\Http\Controllers\Controller;
use App\Models\BitacoraEvento;
use App\Models\HistorialEstado;
use App\Models\SolicitudTransporte;
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
        if (!$motorista || $solicitud->motorista_id !== $motorista->id) {
            abort(403, 'Este viaje no te está asignado.');
        }
    }

    public function iniciar(SolicitudTransporte $solicitud)
    {
        $this->verificarOwnership($solicitud);

        if (!in_array($solicitud->estado, [
            EstadoSolicitudEnum::PROGRAMADA,
            EstadoSolicitudEnum::APROBADA,
            EstadoSolicitudEnum::ASIGNADA,
        ], true)) {
            return response()->json([
                'message' => 'El viaje no está en un estado que permita iniciarlo.',
            ], 422);
        }

        return DB::transaction(function () use ($solicitud) {
            $anterior = $solicitud->estado;
            $solicitud->estado = EstadoSolicitudEnum::EN_EJECUCION;
            $solicitud->fecha_salida_real = now();
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

    public function llegadaDestino(SolicitudTransporte $solicitud)
    {
        $this->verificarOwnership($solicitud);

        if ($solicitud->estado !== EstadoSolicitudEnum::EN_EJECUCION) {
            return response()->json(['message' => 'El viaje debe estar en ejecución.'], 422);
        }

        $solicitud->fecha_llegada_destino = now();
        $solicitud->save();

        return response()->json([
            'message' => 'Llegada registrada.',
            'fecha_llegada_destino' => $solicitud->fecha_llegada_destino,
        ]);
    }

    public function iniciarRetorno(SolicitudTransporte $solicitud)
    {
        $this->verificarOwnership($solicitud);

        if (!$solicitud->fecha_llegada_destino) {
            return response()->json([
                'message' => 'Debe registrar la llegada a destino primero.',
            ], 422);
        }

        $solicitud->fecha_inicio_retorno = now();
        $solicitud->save();

        return response()->json([
            'message' => 'Retorno iniciado.',
            'fecha_inicio_retorno' => $solicitud->fecha_inicio_retorno,
        ]);
    }

    public function finalizar(SolicitudTransporte $solicitud)
    {
        $this->verificarOwnership($solicitud);

        if ($solicitud->estado !== EstadoSolicitudEnum::EN_EJECUCION) {
            return response()->json([
                'message' => 'El viaje debe estar en ejecución para finalizarlo.',
            ], 422);
        }

        if ($solicitud->fecha_salida_real && !$solicitud->fecha_retorno_real) {
            $solicitud->fecha_retorno_real = now();
            $solicitud->save();
        }

        $solicitud = $this->service->finalizar($solicitud, Auth::id());

        return response()->json([
            'message' => 'Viaje finalizado con éxito.',
            'horas_reales' => $solicitud->horas_reales,
            'horas_espera' => $solicitud->horas_espera,
        ]);
    }
}
