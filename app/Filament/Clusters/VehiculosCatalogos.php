<?php

namespace App\Filament\Clusters;

use Filament\Clusters\Cluster;

class VehiculosCatalogos extends Cluster
{
    protected static ?string $navigationGroup = 'Flota';
    protected static ?string $navigationIcon = 'heroicon-o-squares-2x2';
    protected static ?string $navigationLabel = 'Catálogo de Vehículos';
    protected static ?int $navigationSort = 10;
}
