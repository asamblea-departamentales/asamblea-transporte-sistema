<?php

namespace App\Filament\Resources\ContratoCombustibleResource\Pages;

use App\Filament\Resources\ContratoCombustibleResource;
use Filament\Resources\Pages\CreateRecord;

class CreateContratoCombustible extends CreateRecord
{
    protected static string $resource = ContratoCombustibleResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
