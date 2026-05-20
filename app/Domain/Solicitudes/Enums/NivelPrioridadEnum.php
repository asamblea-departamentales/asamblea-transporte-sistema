<?php

namespace App\Domain\Solicitudes\Enums;

enum NivelPrioridadEnum: string
{
    case CRITICA = 'critica';
    case ALTA    = 'alta';
    case MEDIA   = 'media';
    case BAJA    = 'baja';

    public function label(): string
    {
        return match ($this) {
            self::CRITICA => 'Crítica',
            self::ALTA    => 'Alta',
            self::MEDIA   => 'Media',
            self::BAJA    => 'Baja',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::CRITICA => 'danger',
            self::ALTA    => 'warning',
            self::MEDIA   => 'info',
            self::BAJA    => 'gray',
        };
    }

    public function order(): int
    {
        return match ($this) {
            self::CRITICA => 1,
            self::ALTA    => 2,
            self::MEDIA   => 3,
            self::BAJA    => 4,
        };
    }
}