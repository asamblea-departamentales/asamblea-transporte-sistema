<?php

namespace App\Filament\Resources\VehTipoMotorResource\Pages;

use App\Filament\Resources\VehTipoMotorResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListVehTipoMotors extends ListRecords
{
    protected static string $resource = VehTipoMotorResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
