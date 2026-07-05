<?php

namespace App\Filament\Resources\TamanoProveedorResource\Pages;

use App\Filament\Resources\TamanoProveedorResource;
use Filament\Resources\Pages\CreateRecord;

class CreateTamanoProveedor extends CreateRecord
{
    protected static string $resource = TamanoProveedorResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
