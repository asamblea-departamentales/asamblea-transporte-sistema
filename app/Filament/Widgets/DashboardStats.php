<?php

namespace App\Filament\Widgets;

use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use App\Domain\Solicitudes\Services\Dashboard\DashboardService;

class DashboardStats extends StatsOverviewWidget
{
    protected static ?int $sort = 5;
    protected int|string|array $columnSpan = 2;
    protected function getStats(): array
    {
        $data = app(DashboardService::class)->getKpis();

        return [
            Stat::make('Total solicitudes', $data['total'])
                ->icon('heroicon-o-clipboard-document'),

            Stat::make('En ejecución', $data['enEjecucion'])
                ->color('warning'),

            Stat::make('Completadas', $data['completadas'])
                ->color('success'),

            Stat::make('Liquidadas', $data['liquidadas'])
                ->color('primary'),
        ];
    }
}