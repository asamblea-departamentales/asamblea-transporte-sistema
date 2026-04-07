<?php

namespace App\Domain\Solicitudes\Services;

use App\Models\Motorista;
use App\Models\MotoristaEstado;
use Carbon\Carbon; // Es mejor usar Carbon para Laravel

class MotoristaService
{
    public function cambiarEstado(Motorista $motorista, bool $activo, ?string $motivo = null, ?string $archivo = null): MotoristaEstado
{

        return DB::transaction(function () use ($motorista, $activo, $motivo, $archivo) {
            // Cerrar el estado anterior si existe
           $motorista->estados()->whereNull('fecha_fin')->update(['fecha_fin' => Carbon::now()]);

            // Crear un nuevo estado
            $motorista->estados()->create([
                'activo' => $activo,
                'motivo' => $motivo,
                'archivo' => $archivo, // Guardar la ruta del archivo si se proporcionó
                'fecha_inicio' => Carbon::now(),
                'user_id' => auth()->id(),
            ]);
        }

}