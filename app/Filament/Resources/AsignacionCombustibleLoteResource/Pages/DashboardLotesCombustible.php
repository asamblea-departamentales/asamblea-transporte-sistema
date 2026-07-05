<?php

namespace App\Filament\Resources\AsignacionCombustibleLoteResource\Pages;

use App\Filament\Resources\AsignacionCombustibleLoteResource;
use App\Filament\Resources\SolicitudCombustibleResource\Widgets\SolicitudesPorPrioridadStats;
use Filament\Resources\Pages\Page;

class DashboardLotesCombustible extends Page
{
    protected static string $resource = AsignacionCombustibleLoteResource::class;

    protected static string $view = 'filament.resources.asignacion-combustible-lote-resource.pages.dashboard-lotes-combustible';

    protected static ?string $title = 'Dashboard Operativo';

    protected static ?string $navigationLabel = 'Dashboard Operativo';

    protected static ?string $navigationIcon = 'heroicon-o-chart-bar';

    protected static ?int $navigationSort = 0;

    public function getHeaderWidgets(): array
    {
        return [
            \App\Filament\Resources\AsignacionCombustibleLoteResource\Widgets\LotesStatsOverview::class,
            \App\Filament\Resources\AsignacionCombustibleLoteResource\Widgets\EstadoOperativoChart::class,
            \App\Filament\Resources\AsignacionCombustibleLoteResource\Widgets\UltimosLotesTable::class,
            SolicitudesPorPrioridadStats::class, // Reutiliza el widget de solicitudes por prioridad del recurso de solicitudes
        ];
    }
}
