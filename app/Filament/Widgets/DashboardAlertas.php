<?php

namespace App\Filament\Widgets;

use Filament\Widgets\Widget;
use App\Domain\Solicitudes\Services\Dashboard\DashboardService;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Arr;

class DashboardAlertas extends Widget
{
    protected static string $view = 'filament.widgets.dashboard-alertas';
    protected static ?int $sort = 2;
    protected int|string|array $columnSpan = [
        'default' => 1,
        'sm'      => 1,
        'lg'      => 1,
    ];

    public function getData(): array
    {
        return app(DashboardService::class)->getAlertas();
    }
}
