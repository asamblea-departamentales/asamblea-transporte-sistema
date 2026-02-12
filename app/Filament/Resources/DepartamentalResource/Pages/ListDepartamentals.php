<?php

namespace App\Filament\Resources\DepartamentalResource\Pages;

use App\Filament\Resources\DepartamentalResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListDepartamentals extends ListRecords
{
    protected static string $resource = DepartamentalResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
