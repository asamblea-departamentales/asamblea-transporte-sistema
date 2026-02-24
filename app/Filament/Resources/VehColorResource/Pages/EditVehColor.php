<?php

namespace App\Filament\Resources\VehColorResource\Pages;

use App\Filament\Resources\VehColorResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditVehColor extends EditRecord
{
    protected static string $resource = VehColorResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
