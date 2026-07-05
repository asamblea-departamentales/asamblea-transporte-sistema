<?php

namespace App\Filament\Resources\BitacoraEventoResource\Pages;

use App\Filament\Resources\BitacoraEventoResource;
use Filament\Resources\Pages\ListRecords;

class ListBitacoraEventos extends ListRecords
{
    protected static string $resource = BitacoraEventoResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }

    protected function canCreate(): bool
    {
        return false;
    }
}
