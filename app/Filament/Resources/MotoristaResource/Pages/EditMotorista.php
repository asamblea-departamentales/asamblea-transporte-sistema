<?php

namespace App\Filament\Resources\MotoristaResource\Pages;

use App\Filament\Resources\MotoristaResource;
use App\Models\User;
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

    protected function afterSave(): void
    {
        $motorista = $this->record;

        if ($motorista->user_id) {
            return;
        }

        $user = User::where('email', $motorista->correo)
            ->orWhere('name', $motorista->nombre)
            ->first();

        if (!$user) {

            $baseUsername = str($motorista->nombre)
                ->lower()
                ->ascii()
                ->slug('.');

            $username = $baseUsername;

            $counter = 1;

            while (User::where('username', $username)->exists()) {

                $username = "{$baseUsername}.{$counter}";

                $counter++;
            }

            $user = User::create([

                'name' => $motorista->nombre,

                'username' => $username,

                'email' => $motorista->correo
                    ?? "{$username}@asamblea.gob.sv",

                'password' => bcrypt('password'),

                'activo' => true,
            ]);

            $user->assignRole('motorista');
        }

        $motorista->update([
            'user_id' => $user->id,
        ]);
    }
}
