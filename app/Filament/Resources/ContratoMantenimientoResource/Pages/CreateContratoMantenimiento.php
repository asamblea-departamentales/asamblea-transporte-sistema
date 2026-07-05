<?php

namespace App\Filament\Resources\ContratoMantenimientoResource\Pages;

use App\Filament\Resources\ContratoMantenimientoResource;
use Filament\Resources\Pages\CreateRecord;

class CreateContratoMantenimiento extends CreateRecord
{
    protected static string $resource = ContratoMantenimientoResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
