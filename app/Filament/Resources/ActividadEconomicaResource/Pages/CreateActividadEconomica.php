<?php

namespace App\Filament\Resources\ActividadEconomicaResource\Pages;

use App\Filament\Resources\ActividadEconomicaResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateActividadEconomica extends CreateRecord
{
    protected static string $resource = ActividadEconomicaResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
