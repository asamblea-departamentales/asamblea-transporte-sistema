<?php

namespace App\Filament\Resources\HistorialEstadoResource\Pages;

use App\Filament\Resources\HistorialEstadoResource;
use Filament\Resources\Pages\Page;

class ViewHistorialEstado extends Page
{
    protected static string $resource = HistorialEstadoResource::class;

 // PO: sin acciones (no editar, no borrar)
    protected function getHeaderActions(): array
    {
        return [];
    }

    // Extra seguridad: aunque alguien intente forzar, no puede editar ni borrar
    protected function canCreate(): bool
    {
        return false;
    }}
