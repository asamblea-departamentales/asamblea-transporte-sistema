<?php

namespace App\Filament\Resources\RecepcionEntregaVehiculoResource\Pages;

use App\Filament\Resources\RecepcionEntregaVehiculoResource;
use App\Models\HistorialEstado;
use App\Models\SolicitudTransporte;
use Filament\Resources\Pages\CreateRecord;

class CreateRecepcionEntregaVehiculo extends CreateRecord
{
    protected static string $resource = RecepcionEntregaVehiculoResource::class;

    protected function afterCreate(): void
    {
        $record = $this->record;

        if (!$record->solicitud_transporte_id) return;

        $solicitud = SolicitudTransporte::find($record->solicitud_transporte_id);
        if (!$solicitud) return;

        if ($record->tipo_movimiento === 'entrega' && !$solicitud->fecha_salida_real) {
            $solicitud->update([
                'fecha_salida_real' => $record->fecha_hora,
                'despachado_por'    => auth()->id(),
            ]);

            HistorialEstado::create([
                'entidad_tipo'    => 'solicitud_transporte',
                'entidad_id'      => $solicitud->id,
                'estado_anterior' => $solicitud->estado->value,
                'estado_nuevo'    => $solicitud->estado->value,
                'user_id'         => auth()->id(),
                'comentario'      => 'Despacho automático al registrar entrega.',
            ]);
        }

        if ($record->tipo_movimiento === 'recepcion' && !$solicitud->fecha_retorno_real) {
            $solicitud->update([
                'fecha_retorno_real' => $record->fecha_hora,
            ]);

            HistorialEstado::create([
                'entidad_tipo'    => 'solicitud_transporte',
                'entidad_id'      => $solicitud->id,
                'estado_anterior' => $solicitud->estado->value,
                'estado_nuevo'    => $solicitud->estado->value,
                'user_id'         => auth()->id(),
                'comentario'      => 'Cierre real registrado al recibir vehículo.',
            ]);
        }
    }
}