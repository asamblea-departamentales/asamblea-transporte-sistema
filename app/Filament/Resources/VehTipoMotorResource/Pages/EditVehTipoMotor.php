<?php

namespace App\Filament\Resources\VehTipoMotorResource\Pages;

use App\Filament\Resources\VehTipoMotorResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditVehTipoMotor extends EditRecord
{
    protected static string $resource = VehTipoMotorResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
