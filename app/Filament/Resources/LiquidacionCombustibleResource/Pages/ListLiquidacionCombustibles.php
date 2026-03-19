<?php

namespace App\Filament\Resources\LiquidacionCombustibleResource\Pages;

use App\Filament\Resources\LiquidacionCombustibleResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListLiquidacionCombustibles extends ListRecords
{
    protected static string $resource = LiquidacionCombustibleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
