<?php

namespace App\Filament\Resources\UserResource\Pages;

use App\Filament\Resources\UserResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateUser extends CreateRecord
{
    protected static string $resource = UserResource::class;

    //Como roles no es columna de users, hay que sincronizar en Pages
    protected function afterCreate():void
    {
        $roles = $this->form->getState()['roles'] ?? [];
        $this->record->syncRoles($roles);
    }
}
