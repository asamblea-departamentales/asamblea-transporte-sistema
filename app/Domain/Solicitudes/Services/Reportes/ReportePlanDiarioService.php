<?php

namespace App\Domain\Solicitudes\Services\Reportes;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\SolicitudTransporte;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class ReportePlanDiarioService
{
    public function obtenerPorFecha(Carbon $fecha): Collection
    {
        return SolicitudTransporte::query()
            ->whereDate('fecha_salida', $fecha)
            ->whereIn('estado', [EstadoSolicitudEnum::PROGRAMADA->value, EstadoSolicitudEnum::ASIGNADA->value, EstadoSolicitudEnum::COMPLETADA->value])
            ->with(['unidad', 'solicitante', 'motorista', 'tipoVehiculo', 'vehiculo'])
            ->orderBy('fecha_salida', 'asc')
            ->get()
            ->map(function (SolicitudTransporte $solicitud) {
                return [
                    'id' => $solicitud->id,
                    'codigo' => $solicitud->codigo,
                    'hora' => optional($solicitud->fecha_salida)->format('H:i'),
                    'unidad' => $solicitud->unidad?->nombre ?? 'N/A',
                    'destino' => trim(($solicitud->destino ?? '-').($solicitud->destino_adicional ? ' - '.$solicitud->destino_adicional : '')),
                    'vehiculo' => $solicitud->vehiculo?->placa ?? 'N/A',
                    'motorista' => $solicitud->motorista?->nombre ?? 'N/A',
                    'solicitante' => $solicitud->solicitante?->nombre ?? 'N/A',
                    'tipo_vehiculo' => $solicitud->tipoVehiculo?->nombre ?? 'N/A',
                    'estado' => $solicitud->estado->value,
                    'comunicado' => '',
                ];
            });
    }

    public function getKpis(Carbon $fecha): array
    {
        $rows = $this->obtenerPorFecha($fecha);

        return [
            'total' => $rows->count(),
            'programadas' => $rows->where('estado', EstadoSolicitudEnum::PROGRAMADA->value)->count(),
            'asignadas' => $rows->where('estado', EstadoSolicitudEnum::ASIGNADA->value)->count(),
            'completadas' => $rows->where('estado', EstadoSolicitudEnum::COMPLETADA->value)->count(),
        ];
    }

    private function enumValueToText(string $value): string
    {
        return $value instanceof \UnitEnum ? $value->name : (string) $value;
    }
}
