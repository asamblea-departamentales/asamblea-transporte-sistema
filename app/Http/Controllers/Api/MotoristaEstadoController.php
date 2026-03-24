<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Motorista;
use App\Models\MotoristaEstado;
use Illuminate\Http\Request;
use App\Domain\Solicitudes\Services\MotoristaService;

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
                    'id'      => $motorista->id,
                    'nombre'  => $motorista->nombre,
                    'dui'     => $motorista->dui,
                    'activo'  => (bool) ($motorista->estadoActual?->activo ?? true),
                    'motivo'  => $motorista->estadoActual?->motivo,
                    'desde'   => $motorista->estadoActual?->fecha_inicio,
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
            'id'     => $motorista->id,
            'nombre' => $motorista->nombre,
            'activo' => (bool) ($motorista->estadoActual?->activo ?? true),
            'motivo' => $motorista->estadoActual?->motivo,
            'desde'  => $motorista->estadoActual?->fecha_inicio,
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
            'data'    => $estado,
        ]);
    }

    /**
     * Ver el estado del motorista autenticado actualmente.
     */
    public function miEstado()
    {
        $motorista = auth()->user()->motorista;

        if (!$motorista) {
            return response()->json([
                'message' => 'El usuario autenticado no tiene un perfil de motorista asociado.'
            ], 404);
        }

        $motorista->load('estadoActual');

        return response()->json([
            'activo' => (bool) ($motorista->estadoActual?->activo ?? true),
            'motivo' => $motorista->estadoActual?->motivo,
            'desde'  => $motorista->estadoActual?->fecha_inicio,
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
        ]);

        $motorista = auth()->user()->motorista;

        if (!$motorista) {
            return response()->json([
                'message' => 'Acceso denegado: El usuario no es un motorista.'
            ], 404);
        }

        // AQUÍ ESTÁ LA CORRECCIÓN: Usamos ->boolean('activo')
        app(MotoristaService::class)->cambiarEstado(
            $motorista,
            $request->boolean('activo'),
            $request->motivo
        );

        return response()->json([
            'message' => 'Tu estado ha sido actualizado correctamente.'
        ]);
    }

    /**
     * Historial de estados del motorista logueado.
     */
    public function miHistorial()
    {
        $motorista = auth()->user()->motorista;

        if (!$motorista) return response()->json([], 404);

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
}