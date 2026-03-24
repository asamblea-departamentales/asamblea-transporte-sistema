<?php

namespace App\Filament\Resources\AsignacionVehiculoMotoristaResource\Pages;

use App\Filament\Resources\AsignacionVehiculoMotoristaResource;
use Filament\Resources\Pages\ListRecords;

class ListAsignacionVehiculoMotoristas extends ListRecords
{
    protected static string $resource = AsignacionVehiculoMotoristaResource::class;

    // Sin botón "Crear" nativo — el flujo es por headerAction
    protected function getHeaderActions(): array
    {
        return [];
    }
}