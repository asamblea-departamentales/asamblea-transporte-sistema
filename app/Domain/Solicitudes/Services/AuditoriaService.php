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
        AccionBitacoraEnum $accion, // Tipo de acción realizada (enum tipado)
        string $modelo, // Nombre del modelo/entidad afectada
        array $datos = [] // Datos adicionales opcionales para registrar
    ): void {
        BitacoraEvento::create([ // Crea un nuevo registro en la tabla bitacora_eventos
            'entidad_tipo' => $modelo, // Tipo de entidad afectada (ej: 'Solicitud', 'Usuario')
            'entidad_id' => null, // ID de la entidad (actualmente null, podría usarse en el futuro)
            'accion' => $accion->value, // Valor del enum convertido a string
            'user_id' => auth()->id(), // ID del usuario autenticado que realizó la acción
            'datos_extras' => $datos, // Datos adicionales en formato JSON
        ]);
    }
}