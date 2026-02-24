<?php

namespace App\Filament\Resources\VehTraccionResource\Pages;

use App\Filament\Resources\VehTraccionResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListVehTraccions extends ListRecords
{
    protected static string $resource = VehTraccionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
