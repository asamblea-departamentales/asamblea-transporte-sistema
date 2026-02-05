<?php

namespace App\Filament\Resources\SolicitudTransporteResource\Pages;

use App\Filament\Resources\SolicitudTransporteResource;
use Filament\Resources\Pages\ViewRecord;

class ViewSolicitudTransporte extends ViewRecord
{
    protected static string $resource = SolicitudTransporteResource::class;

    // PO: sin acciones (no editar, no borrar)
    protected function getHeaderActions(): array
    {
        return [];
    }

    // Extra seguridad: aunque alguien intente forzar, no puede editar ni borrar
    protected function canCreate(): bool
    {
        return false;
    }
}
