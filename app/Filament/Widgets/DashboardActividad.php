<?php

namespace App\Filament\Widgets;

use Filament\Widgets\Widget;
use App\Domain\Solicitudes\Services\Dashboard\DashboardService;

class DashboardActividad extends Widget
{
    protected static string $view = 'filament.widgets.dashboard-actividad';

    public function getData()
    {
        return app(DashboardService::class)->getActividad();
    }
}