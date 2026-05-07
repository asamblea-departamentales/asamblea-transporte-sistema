<?php

namespace App\Filament\Resources\AsignacionCombustibleLoteResource\Pages;

use App\Filament\Resources\AsignacionCombustibleLoteResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListAsignacionCombustibleLotes extends ListRecords
{
    protected static string $resource = AsignacionCombustibleLoteResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
