<?php

namespace App\Filament\Resources\VehEstadoCatalogoResource\Pages;

use App\Filament\Resources\VehEstadoCatalogoResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListVehEstadoCatalogos extends ListRecords
{
    protected static string $resource = VehEstadoCatalogoResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
