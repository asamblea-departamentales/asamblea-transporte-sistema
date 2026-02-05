<?php

namespace App\Filament\Resources\BitacoraEventoResource\Pages;

use App\Filament\Resources\BitacoraEventoResource;
use Filament\Resources\Pages\Page;

class ViewBitacoraEvento extends Page
{
    protected static string $resource = BitacoraEventoResource::class;

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
