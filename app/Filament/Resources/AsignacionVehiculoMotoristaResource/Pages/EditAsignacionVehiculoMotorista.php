<?php

namespace App\Filament\Resources\AsignacionVehiculoMotoristaResource\Pages;

use App\Filament\Resources\AsignacionVehiculoMotoristaResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditAsignacionVehiculoMotorista extends EditRecord
{
    protected static string $resource = AsignacionVehiculoMotoristaResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
