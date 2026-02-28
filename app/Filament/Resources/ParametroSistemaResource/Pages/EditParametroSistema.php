<?php

namespace App\Filament\Resources\ParametroSistemaResource\Pages;

use App\Filament\Resources\ParametroSistemaResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditParametroSistema extends EditRecord
{
    protected static string $resource = ParametroSistemaResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
