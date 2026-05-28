<?php

namespace App\Domain\Solicitudes\Services\Reportes;

use App\Models\SolicitudCombustible;
use App\Models\SolicitudTransporte;

class ReporteSolicitudAutorizacionService
{
    public function getDatosOficiales(int $solicitudId, ?int $combustibleId = null): array
    {
        $solicitud = SolicitudTransporte::with([
            'unidad',
            'solicitante',
            'vehiculo.tipoCombustible',
            'motorista',
            'tipoVehiculo',
            'solicitudCombustible',
        ])->findOrFail($solicitudId);

        // Usar el combustible específico si se pasa, o el ligado al transporte
        $combustible = $combustibleId
            ? SolicitudCombustible::with('vehiculo.tipoCombustible')->find($combustibleId)
            : $solicitud->solicitudCombustible;

        return [
            'codigo' => $solicitud->codigo,
            'fecha_emision' => now()->format('d/m/Y'),
            'unidad' => $solicitud->unidad?->nombre ?? '—',
            'solicitante' => $solicitud->solicitante?->name ?? '—',
            'destino' => $solicitud->destino ?? '—',
            'destino_adicional' => $solicitud->destino_adicional,
            'motivo' => $solicitud->motivo_actividad ?? '—',
            'fecha_salida' => optional($solicitud->fecha_salida)->format('d/m/Y') ?? '—',
            'fecha_regreso' => optional($solicitud->fecha_retorno)->format('d/m/Y') ?? '—',
            'hora_salida' => optional($solicitud->fecha_salida)->format('H:i') ?? '—',
            'hora_regreso' => optional($solicitud->fecha_retorno)->format('H:i') ?? '—',

            // Vehículo
            'placa' => $solicitud->vehiculo?->placa ?? $combustible?->vehiculo?->placa ?? '—',
            'tipo_vehiculo' => $solicitud->tipoVehiculo?->nombre ?? '—',
            'motorista' => $solicitud->motorista?->nombre ?? $solicitud->motorista?->name ?? '—',

            // Combustible
            'ticket' => $solicitud->ticket,
            'numero_vale_ticket' => $combustible?->numero_vale_ticket ?? '—',
            'tipo_combustible' => $combustible?->vehiculo?->tipoCombustible?->nombre
                ?? $solicitud->vehiculo?->tipoCombustible?->nombre
                ?? '—',
            'monto_combustible' => $combustible?->monto_asignado ?? 0,

            // Extras
            'observaciones' => $solicitud->comentario_jefe ?? '—',
        ];
    }
}
