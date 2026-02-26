<?php

namespace App\Filament\Clusters;

use Filament\Clusters\Cluster;

class VehiculosCatalogos extends Cluster
{
    protected static ?string $navigationGroup = 'Catálogos de Vehículos';
    protected static ?string $navigationIcon = 'heroicon-o-squares-2x2';
    protected static ?string $navigationLabel = 'Catálogo de Vehículos';
    protected static ?int $navigationSort = 2;

    public static function canViewAny(): bool
    {
        return auth()->user()->hasAnyRole(['admin', 'ti', 'jefe']);
    }
}
