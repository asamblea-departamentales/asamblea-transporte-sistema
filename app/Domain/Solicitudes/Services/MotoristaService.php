<?php

namespace App\Domain\Solicitudes\Services;

use App\Models\Motorista;
use App\Models\MotoristaEstado;

use function Symfony\Component\Clock\now;

class MotoristaService
{
    public function cambiarEstado(Motorista $motorista, bool $activo, ?string $motivo = null): MotoristaEstado
    {
        //cerrar el estado actual
        $actual = $motorista->estadoActual;
        if ($actual) {
            $actual->update([
                'fecha_fin' => now(),
            ]);
        }

        //crear nuevo estado
        return MotoristaEstado::create([
            'motorista_id' => $motorista->id,
            'activo' => $activo,
            'motivo' => $motivo,
            'fecha_inicio' => now(),
            'user_id' => auth()->id(),
        ]);
    }

}