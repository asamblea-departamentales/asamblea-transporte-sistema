<?php

namespace App\Filament\Widgets;

use App\Models\SolicitudCombustible;
use App\Models\SolicitudTransporte;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class SolicitudesPorPrioridadStats extends BaseWidget
{
    protected static ?int $sort = 2;

    protected function getStats(): array
    {
        // Contar solicitudes por prioridad (COMBUSTIBLE + TRANSPORTE)
        $criticasC = SolicitudCombustible::where('prioridad_grupo', 'critica')->count();
        $criticasT = SolicitudTransporte::where('prioridad_grupo', 'critica')->count();
        $criticas = $criticasC + $criticasT;

        $altasC = SolicitudCombustible::where('prioridad_grupo', 'alta')->count();
        $altasT = SolicitudTransporte::where('prioridad_grupo', 'alta')->count();
        $altas = $altasC + $altasT;

        $mediasC = SolicitudCombustible::where('prioridad_grupo', 'media')->count();
        $mediasT = SolicitudTransporte::where('prioridad_grupo', 'media')->count();
        $medias = $mediasC + $mediasT;

        $bajasC = SolicitudCombustible::where('prioridad_grupo', 'baja')->count();
        $bajasT = SolicitudTransporte::where('prioridad_grupo', 'baja')->count();
        $bajas = $bajasC + $bajasT;

        return [
            Stat::make('Críticas', $criticas)
                ->color('danger')
                ->icon('heroicon-o-exclamation-circle'),

            Stat::make('Altas', $altas)
                ->color('warning')
                ->icon('heroicon-o-arrow-trending-up'),

            Stat::make('Medias', $medias)
                ->color('info')
                ->icon('heroicon-o-minus'),

            Stat::make('Bajas', $bajas)
                ->color('success')
                ->icon('heroicon-o-check-circle'),
        ];
    }
}
