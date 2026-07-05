<?php

namespace App\Filament\Resources\TamanoProveedorResource\Pages;

use App\Filament\Resources\TamanoProveedorResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditTamanoProveedor extends EditRecord
{
    protected static string $resource = TamanoProveedorResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
