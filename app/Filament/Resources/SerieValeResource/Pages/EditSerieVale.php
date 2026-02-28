<?php

namespace App\Filament\Resources\SerieValeResource\Pages;

use App\Filament\Resources\SerieValeResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditSerieVale extends EditRecord
{
    protected static string $resource = SerieValeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
