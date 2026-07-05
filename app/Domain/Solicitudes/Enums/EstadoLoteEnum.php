<?php

namespace App\Domain\Solicitudes\Enums;

enum EstadoLoteEnum: string
{
    case BORRADOR = 'borrador';
    case FINALIZADO = 'finalizado';
    case EN_PROCESO = 'en_proceso';
    case COMPLETADO = 'completado';

    public function label(): string
    {
        return match ($this) {
            self::BORRADOR => 'Borrador',
            self::FINALIZADO => 'Finalizado',
            self::EN_PROCESO => 'En Proceso',
            self::COMPLETADO => 'Completado',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::BORRADOR => 'warning',
            self::FINALIZADO => 'info',
            self::EN_PROCESO => 'primary',
            self::COMPLETADO => 'success',
        };
    }
}
