<?php

namespace App\Filament\Resources\PlanificacionFlotaResource\Pages;

use App\Filament\Pages\CalendarioFlota;
use App\Filament\Resources\PlanificacionFlotaResource;
use Filament\Actions\Action;
use Filament\Resources\Pages\ListRecords;

class ListPlanificacionFlotas extends ListRecords
{
    protected static string $resource = PlanificacionFlotaResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('ver_calendario')
                ->label('Ver Calendario')
                ->icon('heroicon-o-calendar-days')
                ->color('primary')
                ->url(CalendarioFlota::getUrl()),
        ];
    }
}