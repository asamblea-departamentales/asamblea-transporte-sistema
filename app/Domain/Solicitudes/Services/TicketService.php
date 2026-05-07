<?php

namespace App\Domain\Solicitudes\Services;

use App\Models\ParametroSistema;
use Illuminate\Database\Eloquent\Model;

class TicketService
{
    protected const PARAM_CODE = 'ULTIMO_TICKET';

    protected const DEFAULT_START = 59696;

    public function generar(Model $record): int
    {
        $ultimo = (int) ParametroSistema::get(self::PARAM_CODE, self::DEFAULT_START);
        $nuevo = $ultimo + 1;

        $record->ticket = $nuevo;
        ParametroSistema::set(self::PARAM_CODE, (string) $nuevo);

        return $nuevo;
    }
}
