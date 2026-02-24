<?php

namespace App\Filament\Resources\VehTipoCombustibleResource\Pages;

use App\Filament\Resources\VehTipoCombustibleResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListVehTipoCombustibles extends ListRecords
{
    protected static string $resource = VehTipoCombustibleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
