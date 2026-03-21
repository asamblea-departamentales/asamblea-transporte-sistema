<?php

//Archivo creado para mejorar la vista del panel de control

namespace App\Domain\Solicitudes\Services\Dashboard;

use App\Models\SolicitudCombustible;
use App\Models\SolicitudMantenimiento;
use App\Models\Incidencia;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
class DashboardService
{
    public function getKpis(): array
    {
        $total = SolicitudCombustible::count() + SolicitudMantenimiento::count();

        $enEjecucion =
            SolicitudCombustible::where('estado', EstadoSolicitudEnum::EN_EJECUCION)->count() +
            SolicitudMantenimiento::where('estado', EstadoSolicitudEnum::EN_EJECUCION)->count();

        $completadas =
            SolicitudCombustible::where('estado', EstadoSolicitudEnum::COMPLETADA)->count() +
            SolicitudMantenimiento::where('estado', EstadoSolicitudEnum::COMPLETADA)->count();

        $liquidadas =
            SolicitudCombustible::where('estado', EstadoSolicitudEnum::LIQUIDADA)->count() +
            SolicitudMantenimiento::where('estado', EstadoSolicitudEnum::LIQUIDADA)->count();

        return compact('total', 'enEjecucion', 'completadas', 'liquidadas');
    }

    public function getFinanzas(): array
    {
        $combustible = SolicitudCombustible::sum('valor_total');

        $mantenimiento = SolicitudMantenimiento::sum('costo_real')
            ?: SolicitudMantenimiento::sum('costo_estimado');

        return [
            'combustible' => $combustible,
            'mantenimiento' => $mantenimiento,
            'total' => $combustible + $mantenimiento,
        ];
    }

    public function getAlertas(): array
    {
        $incidencias = class_exists(Incidencia::class)
            ? Incidencia::where('estado', 'abierta')->count()
            : 0;

        $sinComprobantes = SolicitudCombustible::whereNull('comprobantes')
            ->orWhere('comprobantes', '[]')
            ->count();

        return [
            'incidencias' => $incidencias,
            'sinComprobantes' => $sinComprobantes,
        ];
    }

    public function getActividad(): array
    {
        $comb = SolicitudCombustible::latest()->take(5)->get();
        $mant = SolicitudMantenimiento::latest()->take(5)->get();

        return $comb->merge($mant)
            ->sortByDesc('created_at')
            ->take(10)
            ->values()
            ->all();
    }
}
