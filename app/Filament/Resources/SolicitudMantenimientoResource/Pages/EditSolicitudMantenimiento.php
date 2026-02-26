<?php

namespace App\Filament\Resources\SolicitudMantenimientoResource\Pages;

use App\Filament\Resources\SolicitudMantenimientoResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditSolicitudMantenimiento extends EditRecord
{
    protected static string $resource = SolicitudMantenimientoResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
