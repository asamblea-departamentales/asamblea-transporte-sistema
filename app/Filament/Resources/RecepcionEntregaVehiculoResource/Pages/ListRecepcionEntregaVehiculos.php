<?php

namespace App\Filament\Resources\RecepcionEntregaVehiculoResource\Pages;

use App\Filament\Resources\RecepcionEntregaVehiculoResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListRecepcionEntregaVehiculos extends ListRecords
{
    protected static string $resource = RecepcionEntregaVehiculoResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}