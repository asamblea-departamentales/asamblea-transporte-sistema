<?php

namespace App\Filament\Widgets;

use Filament\Widgets\Widget;
use App\Domain\Solicitudes\Services\Dashboard\DashboardService;

class DashboardFinanzas extends Widget
{
    protected static string $view = 'filament.widgets.dashboard-finanzas';

    public function getData(): array
    {
        return app(DashboardService::class)->getFinanzas();
    }
}