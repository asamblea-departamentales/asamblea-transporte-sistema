<?php

namespace App\Filament\Resources\TipoLicenciaResource\Pages;

use App\Filament\Resources\TipoLicenciaResource;
use Filament\Resources\Pages\CreateRecord;

class CreateTipoLicencia extends CreateRecord
{
    protected static string $resource = TipoLicenciaResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
