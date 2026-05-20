<?php

namespace App\Filament\Resources\SolicitudCombustibleResource\Widgets;

use App\Models\SolicitudCombustible;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class SolicitudesPorPrioridadStats extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make(
                'Críticas Pendientes',
                SolicitudCombustible::where('prioridad_grupo', 'critica')
                    ->where('estado', 'pendiente_aprobacion')
                    ->count()
            )
                ->color('danger')
                ->icon('heroicon-o-exclamation-circle'),

            Stat::make(
                'Altas Pendientes',
                SolicitudCombustible::where('prioridad_grupo', 'alta')
                    ->where('estado', 'pendiente_aprobacion')
                    ->count()
            )
                ->color('warning')
                ->icon('heroicon-o-clock'),

            Stat::make(
                'Medias Pendientes',
                SolicitudCombustible::where('prioridad_grupo', 'media')
                    ->where('estado', 'pendiente_aprobacion')
                    ->count()
            )
                ->color('info')
                ->icon('heroicon-o-information-circle'),

            Stat::make(
                'Bajas Pendientes',
                SolicitudCombustible::where('prioridad_grupo', 'baja')
                    ->where('estado', 'pendiente_aprobacion')
                    ->count()
            )
                ->color('gray')
                ->icon('heroicon-o-check-circle'),
        ];
    }
}