<?php

namespace App\Filament\Resources\VehTipoCombustibleResource\Pages;

use App\Filament\Resources\VehTipoCombustibleResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditVehTipoCombustible extends EditRecord
{
    protected static string $resource = VehTipoCombustibleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
