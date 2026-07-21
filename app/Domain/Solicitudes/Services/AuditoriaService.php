<?php

namespace App\Domain\Solicitudes\Services;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum; // Importa el enum con las acciones permitidas para la bitácora
use App\Models\BitacoraEvento; // Importa el modelo para registrar eventos en la bitácora

// Servicio responsable de registrar eventos en la bitácora de auditoría
class AuditoriaService
{
    /**
     * Registra una acción en la bitácora de eventos
     */
    public function registrar(
        AccionBitacoraEnum $accion,
        string $modelo,
        ?int $entidadId = null,
        array $datos = [],
    ): void {
        BitacoraEvento::create([
            'entidad_tipo' => $modelo,
            'entidad_id' => $entidadId,
            'accion' => $accion->value,
            'user_id' => auth()->id(),
            'datos_extras' => $datos,
        ]);
    }
}
