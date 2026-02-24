<?php

namespace App\Filament\Resources\VehEstadoCatalogoResource\Pages;

use App\Filament\Resources\VehEstadoCatalogoResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditVehEstadoCatalogo extends EditRecord
{
    protected static string $resource = VehEstadoCatalogoResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
