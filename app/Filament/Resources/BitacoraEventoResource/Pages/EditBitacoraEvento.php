<?php

namespace App\Filament\Resources\BitacoraEventoResource\Pages;

use App\Filament\Resources\BitacoraEventoResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditBitacoraEvento extends EditRecord
{
    protected static string $resource = BitacoraEventoResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
