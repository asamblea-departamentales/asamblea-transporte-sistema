<?php

namespace App\Filament\Resources\SerieCargaResource\Pages;

use App\Filament\Resources\SerieCargaResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditSerieCarga extends EditRecord
{
    protected static string $resource = SerieCargaResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
