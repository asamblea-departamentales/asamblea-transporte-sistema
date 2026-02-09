<?php

namespace App\Filament\Resources\BitacoraEventoResource\Pages;

use App\Filament\Resources\BitacoraEventoResource;
use Filament\Resources\Pages\ViewRecord;

class ViewBitacoraEvento extends ViewRecord
{
    protected static string $resource = BitacoraEventoResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }
}
