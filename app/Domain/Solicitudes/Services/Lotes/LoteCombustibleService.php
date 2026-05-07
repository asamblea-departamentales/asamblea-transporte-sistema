<?php

namespace App\Domain\Solicitudes\Services\Lotes;

use App\Domain\Solicitudes\Enums\EstadoLoteEnum;
use App\Models\AsignacionCombustibleLote;
use App\Models\AsignacionCombustibleLoteDetalle;
use App\Models\Vehiculo;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LoteCombustibleService
{
    public function crearLote(array $data, int $userId): AsignacionCombustibleLote
    {
        return DB::transaction(function () use ($data, $userId) {
            $lote = AsignacionCombustibleLote::create([
                'fecha' => $data['fecha'],
                'creado_por' => $userId,
                'estado' => EstadoLoteEnum::BORRADOR->value,
                'observaciones' => $data['observaciones'] ?? null,
            ]);

            Log::info("Lote de combustible creado", [
                'lote_id' => $lote->id, 'creado_por' => $userId
            ]);

            return $lote;
        });
    }

    public function agregarVehiculo(int $loteId, array $data): AsignacionCombustibleLoteDetalle
    {
        return DB::transaction(function () use ($loteId, $data){
            $lote = AsignacionCombustibleLote::findOrFail($loteId);

            if ($lote->estado !== EstadoLoteEnum::BORRADOR->value) {
                throw new \DomainException('No se pueded modificar un lote finalizado o en proceso');
            }

            $vehiculoId = $data['vehiculo_id'];

            $exists = $lote->detalles()->where('vehiculo_id', $vehiculoId)->exists();
            if ($exists) {
                throw new \DomainException('El vehículo ya ha sido agregado a este lote');
            }

            $vehiculo = Vehiculo::findOrFail($vehiculoId);

            $detalle = $lote->detalles()->create([
                'vehiculo_id' => $vehiculoId,
                'solicitud_combustible_id' => $data['solicitud_combustible_id'] ?? null,
                'placa_cache' => $vehiculo->placa,
                'monto_asignado' => $data['monto_asignado'],
                'numero_ticket' => $data['numero_ticket'],
            ]);
            return $detalle;
        });
    }

    public function eliminarVehiculo(int $detalleId): void
    {
        DB::transaction(function () use ($detalleId) {
            $detalle = AsignacionCombustibleLoteDetalle::with('lote')->findOrFail($detalleId);
            $lote = $detalle->lote;

            if ($lote->estado !== EstadoLoteEnum::BORRADOR->value) {
                throw new \DomainException('No se pueded modificar un lote finalizado o en proceso');
            }

            $detalle->delete();
        });
    }

    public function finalizarLote(int $loteId, int $userId): AsignacionCombustibleLote
    {
        return DB::transaction(function () use ($loteId, $userId) {
            $lote = AsignacionCombustibleLote::findOrFail($loteId);

            if ($lote->estado !== EstadoLoteEnum::BORRADOR->value) {
                throw new \DomainException('Solo se pueden finalizar lotes en estado borrador');
            }

            if ($lote->detalles()->count() === 0) {
                throw new \DomainException('No se puede finalizar un lote sin vehículos asignados');
            }

            $lote->estado = EstadoLoteEnum::FINALIZADO->value;

            Log::info("Lote de combustible finalizado", [
                'lote_id' => $lote->id, 'finalizado_por' => $userId, 'total_vehiculos' => $lote->detalles()->count(), 'monto_total' => $lote->total_monto
            ]);
            return $lote;
        });
    }
}