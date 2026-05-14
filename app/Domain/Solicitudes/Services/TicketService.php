<?php

namespace App\Domain\Solicitudes\Services;

use App\Models\ParametroSistema;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class TicketService
{
    protected const PARAM_CODE = 'ULTIMO_TICKET';

    protected const DEFAULT_START = 59696;

    public function generar(Model $record): int
    {
        return DB::transaction(function () use ($record) {
            $parametro = ParametroSistema::where('codigo', self::PARAM_CODE)
                ->lockForUpdate()
                ->first();

            $ultimo = $parametro ? (int) $parametro->valor : self::DEFAULT_START;
            $nuevo = $ultimo + 1;

            if ($parametro) {
                $parametro->update(['valor' => (string) $nuevo]);
            } else {
                ParametroSistema::create([
                    'codigo' => self::PARAM_CODE,
                    'valor' => (string) $nuevo,
                    'nombre' => 'Último Ticket Generado',
                    'tipo' => 'integer',
                    'es_sistema' => true,
                ]);
            }

            $record->ticket = $nuevo;

            return $nuevo;
        });
    }
}
