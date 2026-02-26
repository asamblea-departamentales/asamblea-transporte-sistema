<?php

namespace App\Filament\Resources\SolicitudMantenimientoResource\Pages;

use App\Filament\Resources\SolicitudMantenimientoResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListSolicitudMantenimientos extends ListRecords
{
    protected static string $resource = SolicitudMantenimientoResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
