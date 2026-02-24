<?php

namespace App\Filament\Resources\VehModeloResource\Pages;

use App\Filament\Resources\VehModeloResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListVehModelos extends ListRecords
{
    protected static string $resource = VehModeloResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
