<?php

namespace App\Filament\Widgets;

use App\Models\SolicitudTransporte;
use App\Models\UnidadSolicitante;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Solicitudes Totales', SolicitudTransporte::count())
                ->description('Registradas en el sistema')
                ->descriptionIcon('heroicon-m-truck')
                ->color('info'),

            Stat::make('Unidades', UnidadSolicitante::count())
                ->description('Unidades solicitantes activas')
                ->descriptionIcon('heroicon-m-building-office')
                ->color('success'),

            Stat::make('Usuarios del Sistema', \App\Models\User::count())
                ->description('Personal con acceso')
                ->descriptionIcon('heroicon-m-users')
                ->color('primary'),
        ];
    }
}