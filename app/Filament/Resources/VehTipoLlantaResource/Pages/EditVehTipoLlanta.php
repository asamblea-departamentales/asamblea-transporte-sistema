<?php

namespace App\Filament\Resources\VehTipoLlantaResource\Pages;

use App\Filament\Resources\VehTipoLlantaResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditVehTipoLlanta extends EditRecord
{
    protected static string $resource = VehTipoLlantaResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
