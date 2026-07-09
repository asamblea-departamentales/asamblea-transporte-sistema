<?php

namespace App\Domain\Solicitudes\Services\Reportes;

use App\Models\SolicitudCombustible;
use App\Models\SolicitudTransporte;

class ReporteSolicitudAutorizacionService
{
    public function getDatosOficiales(int $solicitudId, ?int $combustibleId = null): array
    {
        // ── MODO: Solo Combustible (sin transporte) ──────────────────────
        if ($solicitudId === 0 && $combustibleId) {
            $combustible = SolicitudCombustible::with([
                'vehiculo.vehMarca',
                'vehiculo.vehModelo',
                'vehiculo.tipo',
                'vehiculo.tipoCombustible',
                'solicitante',
                'motorista',
            ])->findOrFail($combustibleId);

            return [
                'modo' => 'solo_combustible',
                'codigo' => $combustible->codigo,
                'fecha_emision' => now()->format('d/m/Y'),
                'unidad' => $combustible->solicitante?->unidadSolicitante?->nombre ?? '—',
                'solicitante' => $combustible->solicitante?->name ?? '—',
                'destino' => $combustible->destino_actividad ?? '—',
                'destino_adicional' => null,
                'motivo' => $combustible->destino_actividad ?? '—',
                'fecha_salida' => optional($combustible->fecha_solicitud)->format('d/m/Y') ?? '—',
                'fecha_regreso' => '—',
                'hora_salida' => '—',
                'hora_regreso' => '—',

                // Vehículo
                'placa' => $combustible->vehiculo?->placa ?? '—',
                'tipo_vehiculo' => $combustible->vehiculo?->tipo?->nombre ?? '—',
                'motorista' => $combustible->motorista?->nombre ?? '—',

                // Combustible
                'ticket' => $combustible->numero_vale_ticket ?? '—',
                'numero_vale_ticket' => $combustible->numero_vale_ticket ?? '—',
                'tipo_combustible' => $combustible->vehiculo?->tipoCombustible?->nombre ?? '—',
                'monto_combustible' => $combustible->monto_asignado ?? $combustible->cantidad_combustible ?? 0,

                // Extras
                'observaciones' => '—',
            ];
        }

        // ── MODO: Con Transporte ─────────────────────────────────────────
        $solicitud = SolicitudTransporte::with([
            'unidad',
            'solicitante',
            'vehiculo.tipoCombustible',
            'motorista',
            'tipoVehiculo',
            'solicitudCombustible',
        ])->findOrFail($solicitudId);

        $combustible = $combustibleId
            ? SolicitudCombustible::with('vehiculo.tipoCombustible')->find($combustibleId)
            : $solicitud->solicitudCombustible;

        $modo = $combustible ? 'completo' : 'solo_transporte';

        return [
            'modo' => $modo,
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
