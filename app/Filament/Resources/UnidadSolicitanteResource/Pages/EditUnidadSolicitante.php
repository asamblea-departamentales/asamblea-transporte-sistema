<?php

namespace App\Filament\Resources\UnidadSolicitanteResource\Pages;

use App\Filament\Resources\UnidadSolicitanteResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditUnidadSolicitante extends EditRecord
{
    protected static string $resource = UnidadSolicitanteResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
