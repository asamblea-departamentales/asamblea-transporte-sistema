<?php

namespace App\Domain\Solicitudes\Services;

use App\Models\Motorista;
use App\Models\MotoristaEstado;
use Carbon\Carbon; // Es mejor usar Carbon para Laravel

class MotoristaService
{
    public function cambiarEstado(Motorista $motorista, bool $activo, ?string $motivo = null): MotoristaEstado
{
    // 1. Cerrar el estado actual
    $actual = $motorista->estadoActual;
    if ($actual) {
        $actual->update([
            'fecha_fin' => now(),
        ]);
    }

    // 2. Crear nuevo estado con los nombres confirmados
    return MotoristaEstado::create([
        'motorista_id' => $motorista->id,
        'activo'       => $activo,
        'motivo'       => $motivo,       // Confirmado por el show
        'fecha_inicio' => now(),         // Confirmado por el show
        'user_id'      => auth()->id(),
    ]);
}
}