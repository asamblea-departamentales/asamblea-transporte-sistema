<?php

namespace App\Filament\Resources\VehMarcaResource\Pages;

use App\Filament\Resources\VehMarcaResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditVehMarca extends EditRecord
{
    protected static string $resource = VehMarcaResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
