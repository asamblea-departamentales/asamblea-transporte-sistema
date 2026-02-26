<?php

namespace App\Filament\Resources\SolicitudCombustibleResource\Pages;

use App\Filament\Resources\SolicitudCombustibleResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListSolicitudCombustibles extends ListRecords
{
    protected static string $resource = SolicitudCombustibleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
