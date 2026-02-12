<?php

namespace App\Filament\Resources\DepartamentalResource\Pages;

use App\Filament\Resources\DepartamentalResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditDepartamental extends EditRecord
{
    protected static string $resource = DepartamentalResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
