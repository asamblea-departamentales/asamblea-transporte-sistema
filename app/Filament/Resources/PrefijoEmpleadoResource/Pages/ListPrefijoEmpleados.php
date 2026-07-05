<?php

namespace App\Filament\Resources\PrefijoEmpleadoResource\Pages;

use App\Filament\Resources\PrefijoEmpleadoResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListPrefijoEmpleados extends ListRecords
{
    protected static string $resource = PrefijoEmpleadoResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()->label('Nuevo Prefijo')];
    }
}
