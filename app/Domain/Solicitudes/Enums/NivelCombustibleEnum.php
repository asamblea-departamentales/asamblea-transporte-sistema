<?php

namespace App\Domain\Solicitudes\Enums;

enum NivelCombustibleEnum: int
{
    case VACIO = 0;
    case CUARTO = 25;
    case MEDIO = 50;
    case TRES_CUARTOS = 75;
    case LLENO = 100;

    public function label(): string
    {
        return match ($this) {
            self::VACIO => 'Vacío',
            self::CUARTO => '¼',
            self::MEDIO => '½',
            self::TRES_CUARTOS => '¾',
            self::LLENO => 'Lleno',
        };
    }

    public static function fromInt(int $value): self
    {
        return match (true) {
            $value <= 0 => self::VACIO,
            $value <= 25 => self::CUARTO,
            $value <= 50 => self::MEDIO,
            $value <= 75 => self::TRES_CUARTOS,
            default => self::LLENO,
        };
    }

    public static function options(): array
    {
        return [
            0 => '0% — Vacío',
            25 => '25% — ¼',
            50 => '50% — ½',
            75 => '75% — ¾',
            100 => '100% — Lleno',
        ];
    }
}
