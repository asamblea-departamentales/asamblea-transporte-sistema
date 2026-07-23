<?php

namespace Database\Seeders;

use App\Models\Motorista;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MigrarMotoristasAuthSeeder extends Seeder
{
    public function run(): void
    {
        $motoristas = Motorista::whereNotNull('user_id')->get();

        foreach ($motoristas as $motorista) {
            $telefonoLimpio = preg_replace('/\D/', '', $motorista->telefono ?? '');

            if (empty($telefonoLimpio)) {
                $this->command->warn("Motorista {$motorista->nombre} (ID: {$motorista->id}) sin teléfono, saltando.");

                continue;
            }

            $username = $telefonoLimpio;

            $counter = 1;
            while (
                User::where('username', $username)
                    ->where('id', '!=', $motorista->user_id)
                    ->exists()
            ) {
                $username = "{$telefonoLimpio}{$counter}";
                $counter++;
            }

            DB::table('users')
                ->where('id', $motorista->user_id)
                ->update([
                    'username' => $username,
                    'password' => bcrypt('password'),
                    'debe_cambiar_password' => true,
                    'updated_at' => now(),
                ]);

            $this->command->info("Motorista {$motorista->nombre}: username → {$username}");
        }

        $this->command->info('Migración de motoristas completada.');
    }
}
