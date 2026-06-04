<?php

namespace App\Filament\Resources\UserResource\Pages;

use App\Filament\Resources\UserResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditUser extends EditRecord
{
    protected static string $resource = UserResource::class;

    protected function afterSave(): void
    {
        $roles = $this->data['roles'] ?? [];
        $this->record->syncRoles($roles);

        if (!$this->record->username && $this->record->email) {
            $this->record->username = str($this->record->email)->before('@')->value();
            $this->record->save();
        }
    }

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}