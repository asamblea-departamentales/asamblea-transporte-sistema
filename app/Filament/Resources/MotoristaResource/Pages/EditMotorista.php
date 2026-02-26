<?php

namespace App\Filament\Resources\MotoristaResource\Pages;

use App\Filament\Resources\MotoristaResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditMotorista extends EditRecord
{
    protected static string $resource = MotoristaResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
