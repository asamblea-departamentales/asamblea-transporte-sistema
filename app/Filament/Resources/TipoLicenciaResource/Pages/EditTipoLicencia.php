<?php

namespace App\Filament\Resources\TipoLicenciaResource\Pages;

use App\Filament\Resources\TipoLicenciaResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditTipoLicencia extends EditRecord
{
    protected static string $resource = TipoLicenciaResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
