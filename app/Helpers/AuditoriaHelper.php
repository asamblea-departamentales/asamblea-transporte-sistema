<?php

namespace App\Helpers;

use App\Models\BitacoraEvento;
use App\Models\HistorialEstado;

class AuditoriaHelper
{
    public static function timeline(string $tipo, int $id)
    {
        $eventos = BitacoraEvento::where('entidad_tipo', $tipo)
            ->where('entidad_id', $id)
            ->with('usuario')
            ->get()
            ->map(fn ($e) => [
                'tipo' => 'evento',
                'fecha' => $e->created_at,
                'accion' => strtoupper($e->accion),
                'usuario' => $e->usuario?->name ?? 'Sistema',
                'detalle' => $e->datos_extras,
            ]);

        $estados = HistorialEstado::where('entidad_tipo', $tipo)
            ->where('entidad_id', $id)
            ->with('usuario')
            ->get()
            ->map(fn ($h) => [
                'tipo' => 'estado',
                'fecha' => $h->created_at,
                'accion' => "Estado: {$h->estado_anterior} → {$h->estado_nuevo}",
                'usuario' => $h->usuario?->name ?? 'Sistema',
                'detalle' => $h->comentario,
            ]);

        return $eventos
            ->merge($estados)
            ->sortByDesc('fecha')
            ->values();
    }
}