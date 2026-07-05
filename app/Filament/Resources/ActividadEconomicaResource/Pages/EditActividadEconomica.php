<?php

namespace App\Filament\Resources\ActividadEconomicaResource\Pages;

use App\Filament\Resources\ActividadEconomicaResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditActividadEconomica extends EditRecord
{
    protected static string $resource = ActividadEconomicaResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
