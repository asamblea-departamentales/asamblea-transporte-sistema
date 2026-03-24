<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Motorista;
use App\Models\MotoristaEstado;
use Illuminate\Http\Request;
use App\Domain\Solicitudes\Services\MotoristaService;

class MotoristaEstadoController extends Controller
{
    //Listar motoristas con estado
    public function index()
    {
        $motoristas = Motorista::with('estadoActual')->get()
            ->map(function ($motorista){
                return [
                    'id' => $motorista->id,
                    'nombre' => $motorista->nombre,
                    'activo' => $motorista->estadoActual?->activo ?? true,
                    'motivo' => $motorista->estadoActual?->motivo,
                ];
            });
        return response()->json($motoristas);    
    }

    //Estado Actual
    public function estadoActual($motoristaId)
    {
        $motorista = Motorista::with('estadoActual')->findOrFail($motoristaId);

        return response()->json([
            'activo' => $motorista->estadoActual?->activo ?? true,
            'motivo' => $motorista->estadoActual?->motivo,
            'desde'=>$motorista->estadoActual?->fecha_inicio,
        ]);
    }

    //Cambiar Estado
    public function cambiarEstado(Request $request, $motoristaId)
    {
        $request->validate([
            'activo' => 'required|boolean',
            'motivo' => 'nullable|string|max:255',
        ]);

        $motorista = Motorista::findOrFail($motoristaId);

        $estado = app(MotoristaService::class)->cambiarEstado(
            $motorista,
            $request->activo,
            $request->motivo
        );

        return response()->json([
            'message' => 'Estado actualizado correctamente',
            'data' => $estado,
        ]);
    }

    //Nuevo
    public function miEstado()
    {
        $motorista = auth()->user()->motorista->load('estadoActual');

        return response()->json([
            'activo' => $motorista->estadoActual?->activo ?? true,
            'motivo' => $motorista->estadoActual?->motivo,
            'desde' => $motorista->estadoActual?->fecha_inicio,
        ]);
    }

    public function cambiarMiEstado(Request $request)
    {
        $request ->validate([
            'activo' => 'required|boolean',
            'motivo' => 'nullable|string|max:255',
        ]);

        $motorista = auth()->user()->motorista;

        app(MotoristaService::class)->cambiarEstado($motorista, $request->activo, $request->motivo);

        return response()->json([
            'message' => 'Estado actualizado correctamente'
        ]);
    }

    public function miHistorial()
    {
        $motorista = auth()->user()->motorista;

        return response()->json(
            $motorista->estados()->latest()->get()
        );
    }
    //Historial
    public function historial($motoristaId)
    {
        $historial = MotoristaEstado::where('motorista_id', $motoristaId)
        ->orderByDesc('fecha_inicio')->get();

        return response()->json($historial);
    }
}