<?php

namespace App\Domain\Solicitudes\Services\Reportes;

use App\Models\SolicitudTransporte;

class ReporteSolicitudAutorizacionService
{
    public function getDatosOficiales(int $solicitudId): array
    {
        $solicitud = SolicitudTransporte::with([
            'unidad',
            'solicitante',
            'vehiculo.tipoCombustible',
            'motorista',
            'tipoVehiculo',
            'solicitudCombustible',
        ])->findOrFail($solicitudId);

        // numero_vale_ticket = ticket externo
        // NO es el correlativo físico del vale
        $combustible = $solicitud->solicitudCombustible;

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
            'placa' => $solicitud->vehiculo?->placa ?? '—',
            'tipo_vehiculo' => $solicitud->tipoVehiculo?->nombre ?? $solicitud->tipo_vehiculo_nombre ?? '—',
            'motorista' => $solicitud->motorista?->nombre ?? $solicitud->motorista?->name ?? '—',

            // Combustible
            'ticket' => $combustible?->numero_vale_ticket ?? '—',
            'tipo_combustible' => $solicitud->vehiculo?->tipoCombustible?->nombre ?? '—',
            'monto_combustible' => $combustible?->monto_asignado ?? 0,

            // Extras
            'observaciones' => $solicitud->comentario_jefe ?? '—',
        ];
    }
}
