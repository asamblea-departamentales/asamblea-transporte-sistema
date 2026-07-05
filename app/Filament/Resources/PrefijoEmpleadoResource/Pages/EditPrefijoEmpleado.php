<?php

namespace App\Filament\Resources\PrefijoEmpleadoResource\Pages;

use App\Filament\Resources\PrefijoEmpleadoResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditPrefijoEmpleado extends EditRecord
{
    protected static string $resource = PrefijoEmpleadoResource::class;

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
