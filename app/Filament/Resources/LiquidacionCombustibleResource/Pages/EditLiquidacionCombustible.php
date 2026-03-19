<?php

namespace App\Filament\Resources\LiquidacionCombustibleResource\Pages;

use App\Filament\Resources\LiquidacionCombustibleResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditLiquidacionCombustible extends EditRecord
{
    protected static string $resource = LiquidacionCombustibleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
