<?php

namespace App\Filament\Resources\UnidadSolicitanteResource\Pages;

use App\Filament\Resources\UnidadSolicitanteResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListUnidadSolicitantes extends ListRecords
{
    protected static string $resource = UnidadSolicitanteResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()->label('Nueva Unidad'),
        ];
    }
}
