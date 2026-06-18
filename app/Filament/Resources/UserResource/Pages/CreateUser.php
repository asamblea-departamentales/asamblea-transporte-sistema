<?php

namespace App\Filament\Resources\UserResource\Pages;

use App\Filament\Resources\UserResource;
use App\Models\Motorista;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateUser extends CreateRecord
{
    protected static string $resource = UserResource::class;

    protected function afterCreate(): void
    {
        $roles = $this->data['roles'] ?? [];

        if (!empty($roles)) {
            $this->record->syncRoles($roles);
        }

        if (in_array('motorista', $roles)) {
            Motorista::firstOrCreate(
                ['user_id' => $this->record->id],
                [
                    'nombre' => $this->record->name,
                    'correo' => $this->record->email,
                    'activo' => true,
                ]
            );
        }

        if (!$this->record->username && $this->record->email) {
            $this->record->username = str($this->record->email)->before('@')->value();
            $this->record->save();
        }
    }
}
