<?php

namespace App\Domain\Solicitudes\Listeners;

use App\Domain\Solicitudes\Events\SolicitudEstadoCambiado;
use App\Models\HistorialEstado;

class RegistrarHistorialEstado
{
    public function handle(SolicitudEstadoCambiado $event): void
    {
        $solicitud = $event->solicitud;

        HistorialEstado::create([
            'entidad_tipo' => $solicitud->getEntidadTipo(),
            'entidad_id' => $solicitud->getKey(),
            'estado_anterior' => $event->estadoAnterior?->value ?? 'ninguno',
            'estado_nuevo' => $event->estadoNuevo->value,
            'user_id' => $event->actor->id,
            'comentario' => $event->metadata['comentario'] ?? null,
        ]);
    }
}
