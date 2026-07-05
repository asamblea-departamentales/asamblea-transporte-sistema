<?php

namespace App\Filament\Resources\HistorialEstadoResource\Pages;

use App\Filament\Resources\HistorialEstadoResource;
use Filament\Resources\Pages\ViewRecord;

class ViewHistorialEstado extends ViewRecord
{
    protected static string $resource = HistorialEstadoResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }
}
