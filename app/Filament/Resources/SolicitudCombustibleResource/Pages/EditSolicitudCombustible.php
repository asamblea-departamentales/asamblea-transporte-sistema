<?php

namespace App\Filament\Resources\SolicitudCombustibleResource\Pages;

use App\Filament\Resources\SolicitudCombustibleResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditSolicitudCombustible extends EditRecord
{
    protected static string $resource = SolicitudCombustibleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
