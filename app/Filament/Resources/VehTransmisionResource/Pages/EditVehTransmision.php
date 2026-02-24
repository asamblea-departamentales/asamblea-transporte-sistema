<?php

namespace App\Filament\Resources\VehTransmisionResource\Pages;

use App\Filament\Resources\VehTransmisionResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditVehTransmision extends EditRecord
{
    protected static string $resource = VehTransmisionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
