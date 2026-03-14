<?php

namespace App\Filament\Resources\RecepcionEntregaVehiculoResource\Pages;

use App\Filament\Resources\RecepcionEntregaVehiculoResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewRecepcionEntregaVehiculo extends ViewRecord
{
    protected static string $resource = RecepcionEntregaVehiculoResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}