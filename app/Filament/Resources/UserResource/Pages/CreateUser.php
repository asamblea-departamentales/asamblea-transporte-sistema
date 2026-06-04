<?php

namespace App\Filament\Resources\UserResource\Pages;

use App\Filament\Resources\UserResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateUser extends CreateRecord
{
    protected static string $resource = UserResource::class;

    //Como roles no es columna de users, hay que sincronizar en Pages
    protected function afterCreate(): void
    {
        $roles = $this->data['roles'] ?? [];

        if (!empty($roles)) {
            $this->record->syncRoles($roles);
        }

        if (!$this->record->username && $this->record->email) {
            $this->record->username = str($this->record->email)->before('@')->value();
            $this->record->save();
        }
    }
}
