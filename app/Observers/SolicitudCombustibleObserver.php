<?php

namespace App\Observers;

use App\Domain\Solicitudes\Enums\EstadoLoteEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\SolicitudCombustible;
use Illuminate\Support\Facades\Log;

class SolicitudCombustibleObserver
{
    public function updated(SolicitudCombustible $solicitud): void
    {
        if ($solicitud->isDirty('estado') && $solicitud->estado === EstadoSolicitudEnum::CANCELADA) {
            $detallesEnLotesActivos = $solicitud->loteDetalles()
                ->whereHas('lote', fn ($q) => $q->where('estado', EstadoLoteEnum::BORRADOR))
                ->get();

            foreach ($detallesEnLotesActivos as $detalle) {
                $detalle->delete();
            }

            if ($detallesEnLotesActivos->isNotEmpty()) {
                Log::info('Solicitud cancelada, removida de lotes activos', [
                    'solicitud_id' => $solicitud->id,
                    'codigo' => $solicitud->codigo,
                    'detalles_removidos' => $detallesEnLotesActivos->count(),
                ]);
            }
        }
    }
}
