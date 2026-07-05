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

        if (! $record->solicitud_transporte_id) {
            return;
        }

        $solicitud = SolicitudTransporte::find($record->solicitud_transporte_id);
        if (! $solicitud) {
            return;
        }

        if ($record->tipo_movimiento === 'entrega' && ! $solicitud->fecha_salida_real) {
            $solicitud->update([
                'fecha_salida_real' => $record->fecha_hora,
                'despachado_por' => auth()->id(),
            ]);

            HistorialEstado::create([
                'entidad_tipo' => 'solicitud_transporte',
                'entidad_id' => $solicitud->id,
                'estado_anterior' => $solicitud->estado->value,
                'estado_nuevo' => $solicitud->estado->value,
                'user_id' => auth()->id(),
                'comentario' => 'Despacho automático al registrar entrega.',
            ]);
        }

        if ($record->tipo_movimiento === 'recepcion' && ! $solicitud->fecha_retorno_real) {
            $solicitud->update([
                'fecha_retorno_real' => $record->fecha_hora,
            ]);

            HistorialEstado::create([
                'entidad_tipo' => 'solicitud_transporte',
                'entidad_id' => $solicitud->id,
                'estado_anterior' => $solicitud->estado->value,
                'estado_nuevo' => $solicitud->estado->value,
                'user_id' => auth()->id(),
                'comentario' => 'Cierre real registrado al recibir vehículo.',
            ]);
        }

        // ─────────────────────────────────────────────────────────────────────────
        // Consumo automático de reserva de combustible
        // ─────────────────────────────────────────────────────────────────────────
        // Cuando se registra una ENTREGA (vehículo sale), se revisa si existía
        // una recepción previa con "tiene_reserva = true". La reserva se consume
        // automáticamente porque el vehículo está usando ese combustible en su
        // nuevo viaje. El estado real se calcula en Vehiculo::tieneReservaActiva
        // comparando si hay una entrega posterior a la recepción con reserva.
        // ─────────────────────────────────────────────────────────────────────────
        if ($record->tipo_movimiento === 'entrega') {
            $reservaPrevia = \App\Models\RecepcionEntregaVehiculo::where('vehiculo_id', $record->vehiculo_id)
                ->where('tipo_movimiento', 'recepcion')
                ->where('tiene_reserva', true)
                ->latest('fecha_hora')
                ->first();

            if ($reservaPrevia) {
                \App\Models\BitacoraEvento::create([
                    'entidad_tipo' => 'recepcion_entrega',
                    'entidad_id' => $record->id,
                    'accion' => 'RESERVA_CONSUMIDA',
                    'user_id' => auth()->id(),
                    'datos_extras' => [
                        'vehiculo_id' => $record->vehiculo_id,
                        'reserva_origen_id' => $reservaPrevia->id,
                        'nivel_combustible' => $reservaPrevia->nivel_combustible,
                        'mensaje' => 'Reserva de combustible consumida automáticamente al registrar entrega del vehículo.',
                    ],
                ]);
            }
        }
    }
}
