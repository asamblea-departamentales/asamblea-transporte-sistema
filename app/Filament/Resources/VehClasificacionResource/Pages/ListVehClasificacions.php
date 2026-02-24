<?php

namespace App\Filament\Resources\VehClasificacionResource\Pages;

use App\Filament\Resources\VehClasificacionResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListVehClasificacions extends ListRecords
{
    protected static string $resource = VehClasificacionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
