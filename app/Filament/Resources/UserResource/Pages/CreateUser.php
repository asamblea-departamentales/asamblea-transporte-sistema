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
    
     \Log::info('Roles a asignar:', ['roles' => $roles]);
    
     if (!empty($roles)) {
        $this->record->syncRoles($roles);
        
        \Log::info('Roles asignados:', ['user_roles' => $this->record->getRoleNames()]);
      }
    }
}
