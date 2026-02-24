<?php

namespace App\Filament\Resources\VehModeloResource\Pages;

use App\Filament\Resources\VehModeloResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditVehModelo extends EditRecord
{
    protected static string $resource = VehModeloResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
