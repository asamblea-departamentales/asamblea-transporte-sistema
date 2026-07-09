<?php

// -----------------------------------------------------------------------------
// CONTROLADOR DE ESTADO DE LOS MOTORISTAS
// -----------------------------------------------------------------------------
// Este controlador permite consultar y cambiar el estado de los motoristas
// (disponible / no disponible). Los motoristas pueden marcar su propio estado
// (por ejemplo "No Disponible" por enfermedad) y los administradores pueden
// ver el historial de cambios de estado de cada motorista.

namespace App\Http\Controllers\Api;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Services\MotoristaService;
use App\Domain\Solicitudes\Services\SolicitudEmailDispatchService;
use App\Domain\Solicitudes\Services\SolicitudEmailPayloadService;
use App\Http\Controllers\Controller;
use App\Models\Motorista;
use App\Models\MotoristaEstado;
use App\Models\SolicitudTransporte;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MotoristaEstadoController extends Controller
{
    /**
     * Listar todos los motoristas con su estado actual mapeado.
     */
    public function index()
    {
        $motoristas = Motorista::with('estadoActual')->get()
            ->map(function ($motorista) {
                return [
                    'id' => $motorista->id,
                    'nombre' => $motorista->nombre,
                    'dui' => $motorista->dui,
                    'activo' => (bool) ($motorista->estadoActual?->activo ?? true),
                    'motivo' => $motorista->estadoActual?->motivo,
                    'desde' => $motorista->estadoActual?->fecha_inicio,
                ];
            });

        return response()->json($motoristas);
    }

    /**
     * Obtener el estado detallado de un motorista específico.
     */
    public function estadoActual($motoristaId)
    {
        $motorista = Motorista::with('estadoActual')->findOrFail($motoristaId);

        return response()->json([
            'id' => $motorista->id,
            'nombre' => $motorista->nombre,
            'activo' => (bool) ($motorista->estadoActual?->activo ?? true),
            'motivo' => $motorista->estadoActual?->motivo,
            'desde' => $motorista->estadoActual?->fecha_inicio,
        ]);
    }

    /**
     * Cambiar el estado de cualquier motorista (vía Administración).
     */
    public function cambiarEstado(Request $request, $motoristaId)
    {
        $request->validate([
            'activo' => 'required|boolean',
            'motivo' => 'nullable|string|max:255',
        ]);

        $motorista = Motorista::findOrFail($motoristaId);

        // AQUÍ ESTÁ LA CORRECCIÓN: Usamos ->boolean('activo')
        $estado = app(MotoristaService::class)->cambiarEstado(
            $motorista,
            $request->boolean('activo'),
            $request->motivo
        );

        return response()->json([
            'message' => 'Estado actualizado correctamente',
            'data' => $estado,
        ]);
    }

    /**
     * Ver el estado del motorista autenticado actualmente.
     */
    public function miEstado()
    {
        $motorista = auth()->user()->motorista;

        if (! $motorista) {
            return response()->json([
                'message' => 'El usuario autenticado no tiene un perfil de motorista asociado.',
            ], 404);
        }

        $motorista->load('estadoActual');

        return response()->json([
            'activo' => (bool) ($motorista->estadoActual?->activo ?? true),
            'motivo' => $motorista->estadoActual?->motivo,
            'desde' => $motorista->estadoActual?->fecha_inicio,
        ]);
    }

    /**
     * Permitir que el motorista cambie su propio estado (ej: marcarse como No Disponible).
     */
    public function cambiarMiEstado(Request $request)
    {
        $request->validate([
            'activo' => 'required|boolean',
            'motivo' => 'nullable|string|max:255',
            'archivo' => 'nullable|file|max:10240', // Aumenté el límite a 10MB
        ]);

        $motorista = auth()->user()->motorista;

        if (! $motorista) {
            return response()->json([
                'message' => 'Acceso denegado: El usuario no es un motorista.',
            ], 404);
        }

        $archivoPath = null;

        // Guardar el archivo si se ha subido
        if ($request->hasFile('archivo')) {
            $archivoPath = $request->file('archivo')->store('motoristas/no-disponibilidad', 'public');
        }

        // AQUÍ ESTÁ LA CORRECCIÓN: Usamos ->boolean('activo')
        $activo = $request->boolean('activo');
        app(MotoristaService::class)->cambiarEstado(
            $motorista,
            $activo,
            $request->motivo,
            $archivoPath
        );

        if (! $activo) {
            try {
                $jefeEmails = User::role('jefe')
                    ->whereNotNull('email')
                    ->pluck('email')
                    ->filter()
                    ->unique()
                    ->toArray();

                if (! empty($jefeEmails)) {
                    $payloadService = app(SolicitudEmailPayloadService::class);
                    $payload = $payloadService->motoristaNoDisponible($motorista, $request->motivo, $archivoPath);

                    app(SolicitudEmailDispatchService::class)->withPayload(
                        $payloadService->subjectFor('motorista_estado', 'motorista_no_disponible'),
                        $payload,
                        $jefeEmails
                    );
                }
            } catch (\Exception $e) {
                Log::error('Error enviando correo de motorista no disponible: '.$e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Tu estado ha sido actualizado correctamente.',
            'archivo_url' => $archivoPath ? asset('storage/'.$archivoPath) : null, // Devolver la URL del archivo si se subió
        ]);
    }

    /**
     * Historial de estados del motorista logueado.
     */
    public function miHistorial()
    {
        $motorista = auth()->user()->motorista;

        if (! $motorista) {
            return response()->json([], 404);
        }

        return response()->json(
            $motorista->estados()->orderByDesc('fecha_inicio')->get()
        );
    }

    /**
     * Historial de estados de un motorista específico para fines administrativos.
     */
    public function historial($motoristaId)
    {
        $historial = MotoristaEstado::where('motorista_id', $motoristaId)
            ->orderByDesc('fecha_inicio')
            ->get();

        return response()->json($historial);
    }

    /**
     * Listar los viajes asignados al motorista autenticado.
     */
    public function misViajes(Request $request)
    {
        $user = auth()->user();

        $motorista = $user->motorista;

        // Validar que el usuario autenticado tenga un perfil de motorista asociado
        if (! $motorista) {
            return response()->json([
                'message' => 'El usuario autenticado no tiene un perfil de motorista asociado.',
            ], 404);
        }

        // Obtener el mes
        $mes = $request->query('mes');

        if (! $mes) {
            return response()->json([
                'message' => 'El parámetro "mes" es requerido en formato YYYY-MM.',
            ], 422);
        }
        try {
            [$year, $month] = explode('-', $mes);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'El formato del parámetro "mes" es inválido. Debe ser YYYY-MM.',
            ], 422);
        }

        // Query para obtener los viajes asignados al motorista autenticado en el mes especificado
        $viajes = SolicitudTransporte::query()
            ->where('motorista_id', $motorista->id)
            ->whereYear('fecha_salida', $year)
            ->whereMonth('fecha_salida', $month)
            ->whereIn('estado', [
                EstadoSolicitudEnum::ASIGNADA,
                EstadoSolicitudEnum::APROBADA,
                EstadoSolicitudEnum::PROGRAMADA,
                EstadoSolicitudEnum::EN_EJECUCION,
                EstadoSolicitudEnum::COMPLETADA,
                EstadoSolicitudEnum::CANCELADA,
            ])
            ->with('solicitante')
            ->orderBy('fecha_salida', 'asc')
            ->get()
            ->map(function ($viaje) {
                return [
                    'id' => $viaje->id,
                    'fecha' => optional($viaje->fecha_salida)->format('Y-m-d'),
                    'hora_salida' => optional($viaje->fecha_salida)->format('H:i A'),
                    'origen' => $viaje->origen,
                    'destino' => $viaje->destino,
                    'estado' => strtoupper($viaje->estado->value),
                    'solicitante' => $viaje->solicitante?->name ?? 'Desconocido',
                    'fecha_salida_real' => $viaje->fecha_salida_real,
                    'fecha_llegada_destino' => $viaje->fecha_llegada_destino,
                    'fecha_inicio_retorno' => $viaje->fecha_inicio_retorno,
                    'fecha_retorno_real' => $viaje->fecha_retorno_real,
                ];
            });

        return response()->json($viajes);
    }
}
