<?php

namespace App\Filament\Resources\UnidadSolicitanteResource\Pages;

use App\Filament\Resources\UnidadSolicitanteResource;
use Filament\Resources\Pages\CreateRecord;

class CreateUnidadSolicitante extends CreateRecord
{
    protected static string $resource = UnidadSolicitanteResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
