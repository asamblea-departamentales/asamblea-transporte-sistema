<?php

namespace App\Filament\Resources\PrefijoEmpleadoResource\Pages;

use App\Filament\Resources\PrefijoEmpleadoResource;
use Filament\Resources\Pages\CreateRecord;

class CreatePrefijoEmpleado extends CreateRecord
{
    protected static string $resource = PrefijoEmpleadoResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
