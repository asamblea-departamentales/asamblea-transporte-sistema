<?php

namespace App\Filament\Resources\VehMarcaResource\Pages;

use App\Filament\Resources\VehMarcaResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListVehMarcas extends ListRecords
{
    protected static string $resource = VehMarcaResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
