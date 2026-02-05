<?php

namespace App\Filament\Resources\HistorialEstadoResource\Pages;

use App\Filament\Resources\HistorialEstadoResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListHistorialEstados extends ListRecords
{
    protected static string $resource = HistorialEstadoResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
