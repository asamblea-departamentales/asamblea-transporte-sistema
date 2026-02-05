<?php

namespace App\Filament\Resources\SolicitudTransporteResource\Pages;

use App\Filament\Resources\SolicitudTransporteResource;
use Filament\Resources\Pages\ListRecords;

class ListSolicitudTransportes extends ListRecords
{
    protected static string $resource = SolicitudTransporteResource::class;

    // PO: sin acciones en el header
    protected function getHeaderActions(): array
    {
        return [];
    }

    // Extra seguridad: aunque alguien intente forzar, no puede crear
    protected function canCreate(): bool
    {
        return false;
    }
}
