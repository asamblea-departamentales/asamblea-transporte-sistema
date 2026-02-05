<?php

namespace App\Filament\Resources\SolicitudTransporteResource\Pages;

use App\Filament\Resources\SolicitudTransporteResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditSolicitudTransporte extends EditRecord
{
    protected static string $resource = SolicitudTransporteResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
