<?php

namespace App\Domain\Solicitudes\Services\Reportes;

use App\Models\RecepcionEntregaVehiculo;
use App\Models\Vehiculo;
use Illuminate\Support\Collection;

/**
 * Servicio para el reporte "Hoja de Registro de Vehículos".
 *
 * Recupera y empareja los registros de recepción/entrega de un vehículo
 * en un rango de fechas, agrupándolos por solicitud de transporte para
 * mostrar kilómetros inicial/final, combustible de salida/regreso, etc.
 */
class ReporteRegistroVehiculosService
{
    /**
     * Obtiene los registros pareados de entrega/recepción para un vehículo y rango.
     *
     * @param  string  $fechaInicio  Y-m-d
     * @param  string  $fechaFin  Y-m-d
     * @return Collection de arrays con keys:
     *                    fecha, km_inicial, km_final, km_recorridos, lugares, motorista_nombre,
     *                    combustible_salida, combustible_regreso
     */
    public function getRegistros(int $vehiculoId, string $fechaInicio, string $fechaFin): Collection
    {
        $movimientos = RecepcionEntregaVehiculo::with(['motorista', 'solicitud'])
            ->where('vehiculo_id', $vehiculoId)
            ->whereBetween('fecha_hora', [$fechaInicio.' 00:00:00', $fechaFin.' 23:59:59'])
            ->orderBy('fecha_hora')
            ->get();

        // Agrupar por solicitud_transporte_id
        $grupos = $movimientos->groupBy(function ($item) {
            return $item->solicitud_transporte_id ?? 'sin_solicitud_'.$item->id;
        });

        $resultados = collect();

        foreach ($grupos as $grupo) {
            $entrega = $grupo->firstWhere('tipo_movimiento', 'entrega');
            $recepcion = $grupo->firstWhere('tipo_movimiento', 'recepcion');

            $solicitud = $entrega?->solicitud ?? $recepcion?->solicitud;
            $motorista = $entrega?->motorista ?? $recepcion?->motorista;

            $kmInicial = $entrega?->kilometraje;
            $kmFinal = $recepcion?->kilometraje;
            $kmRecorridos = null;
            if ($kmInicial !== null && $kmFinal !== null) {
                $kmRecorridos = (int) $kmFinal - (int) $kmInicial;
            }

            $lugares = '';
            if ($solicitud) {
                $lugares = ($solicitud->origen ?? '').' → '.($solicitud->destino ?? '');
                $lugares = trim($lugares, ' →');
            }

            $resultados->push([
                'fecha' => $entrega?->fecha_hora ?? $recepcion?->fecha_hora,
                'km_inicial' => $kmInicial,
                'km_final' => $kmFinal,
                'km_recorridos' => $kmRecorridos,
                'lugares' => $lugares ?: '—',
                'motorista_nombre' => $motorista?->nombre ?? '—',
                'combustible_salida' => $entrega?->nivel_combustible,
                'combustible_regreso' => $recepcion?->nivel_combustible,
            ]);
        }

        // Mostrar también movimientos sin pareja (ej. solo recepción con solicitud nula)
        return $resultados;
    }

    /**
     * Devuelve datos del vehículo para el encabezado del reporte.
     *
     * @return array con placa, tipo_nombre, combustible_nombre
     */
    public function getDatosVehiculo(int $vehiculoId): array
    {
        $v = Vehiculo::with(['tipo', 'tipoCombustible'])->findOrFail($vehiculoId);

        return [
            'placa' => $v->placa,
            'tipo_nombre' => $v->tipo?->nombre ?? 'N/A',
            'combustible_nombre' => $v->tipoCombustible?->nombre ?? 'N/A',
        ];
    }
}
