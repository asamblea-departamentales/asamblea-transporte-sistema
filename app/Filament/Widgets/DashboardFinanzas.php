<?php

namespace App\Filament\Widgets;

use App\Domain\Solicitudes\Services\Dashboard\DashboardService;
use Filament\Widgets\Widget;

class DashboardFinanzas extends Widget
{
    protected static string $view = 'filament.widgets.dashboard-finanzas';

    protected static ?int $sort = 4;

    protected int|string|array $columnSpan = [
        'default' => 1,
        'sm' => 1,
        'lg' => 1,
    ];

    public function getData(): array
    {
        return app(DashboardService::class)->getFinanzas();
    }
}
