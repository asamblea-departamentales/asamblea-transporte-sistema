<?php

namespace App\Domain\Solicitudes\Services;

use App\Models\Motorista;
use App\Models\MotoristaEstado;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class MotoristaService
{
    public function cambiarEstado(Motorista $motorista, bool $activo, ?string $motivo = null, ?string $archivo = null): MotoristaEstado
    {
        return DB::transaction(function () use ($motorista, $activo, $motivo, $archivo) {
            $motorista->estados()->whereNull('fecha_fin')->update(['fecha_fin' => Carbon::now()]);

            return $motorista->estados()->create([
                'activo' => $activo,
                'motivo' => $motivo,
                'archivo' => $archivo,
                'fecha_inicio' => Carbon::now(),
                'user_id' => auth()->id(),
            ]);
        });
    }
}
