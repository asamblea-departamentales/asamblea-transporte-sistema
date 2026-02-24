<?php

namespace App\Filament\Resources\VehTipoMantenimientoResource\Pages;

use App\Filament\Resources\VehTipoMantenimientoResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListVehTipoMantenimientos extends ListRecords
{
    protected static string $resource = VehTipoMantenimientoResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
