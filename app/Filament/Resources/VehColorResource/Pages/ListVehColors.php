<?php

namespace App\Filament\Resources\VehColorResource\Pages;

use App\Filament\Resources\VehColorResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListVehColors extends ListRecords
{
    protected static string $resource = VehColorResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
