<?php

namespace App\Filament\Widgets;

use Filament\Widgets\Widget;
use App\Domain\Solicitudes\Services\Dashboard\DashboardService;

class DashboardAlertas extends Widget
{
    protected static string $view = 'filament.widgets.dashboard-alertas';

    public function getData(): array
    {
        return app(DashboardService::class)->getAlertas();
    }
}
