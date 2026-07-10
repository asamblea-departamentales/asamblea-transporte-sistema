<?php

namespace App\Domain\Solicitudes\Services\Lotes;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoLoteEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\AsignacionCombustibleLote;
use App\Models\AsignacionCombustibleLoteDetalle;
use App\Models\ContratoCombustible;
use App\Models\SerieCarga;
use App\Models\SolicitudCombustible;
use App\Models\Vehiculo;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LoteCombustibleService
{
    // ─────────────────────────────────────────────────────────────────────────
    // CREAR LOTE
    // ─────────────────────────────────────────────────────────────────────────

    public function crearLote(array $data, int $userId): AsignacionCombustibleLote
    {
        return DB::transaction(function () use ($data, $userId) {
            $lote = AsignacionCombustibleLote::create([
                'fecha' => $data['fecha'],
                'creado_por' => $userId,
                'estado' => EstadoLoteEnum::BORRADOR,
                'observaciones' => $data['observaciones'] ?? null,
            ]);

            Log::info('Lote de combustible creado', [
                'lote_id' => $lote->id,
                'creado_por' => $userId,
            ]);

            app(\App\Domain\Solicitudes\Services\AuditoriaService::class)
                ->registrar(
                    accion: AccionBitacoraEnum::CREAR,
                    modelo: 'AsignacionCombustibleLote',
                    datos: [
                        'lote_id' => $lote->id,
                        'fecha' => $lote->fecha,
                    ]
                );

            return $lote;
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AGREGAR VEHÍCULO MANUAL (flujo anterior, se conserva)
    // ─────────────────────────────────────────────────────────────────────────

    public function agregarVehiculo(int $loteId, array $data): AsignacionCombustibleLoteDetalle
    {
        return DB::transaction(function () use ($loteId, $data) {
            $lote = AsignacionCombustibleLote::findOrFail($loteId);

            if ($lote->estado !== EstadoLoteEnum::BORRADOR) {
                throw new \DomainException('No se puede modificar un lote finalizado o en proceso.');
            }

            $vehiculoId = $data['vehiculo_id'];

            $exists = $lote->detalles()->where('vehiculo_id', $vehiculoId)->exists();
            if ($exists) {
                throw new \DomainException('El vehículo ya ha sido agregado a este lote.');
            }

            $vehiculo = Vehiculo::findOrFail($vehiculoId);

            return $lote->detalles()->create([
                'vehiculo_id' => $vehiculoId,
                'solicitud_combustible_id' => $data['solicitud_combustible_id'] ?? null,
                'placa_cache' => $vehiculo->placa,
                'monto_asignado' => $data['monto_asignado'],
                'numero_ticket' => $data['numero_ticket'],
                'estado_asignacion' => 'pendiente',
            ]);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ELIMINAR VEHÍCULO
    // ─────────────────────────────────────────────────────────────────────────

    public function eliminarVehiculo(int $detalleId): void
    {
        DB::transaction(function () use ($detalleId) {
            $detalle = AsignacionCombustibleLoteDetalle::with('lote')->findOrFail($detalleId);
            $lote = $detalle->lote;

            if ($lote->estado !== EstadoLoteEnum::BORRADOR) {
                throw new \DomainException('No se puede modificar un lote finalizado o en proceso.');
            }

            $detalle->delete();
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // IMPORTAR SOLICITUDES DEL DÍA
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Importa automáticamente las solicitudes aprobadas del día del lote
     * que aún no hayan sido importadas. Solo funciona en BORRADOR.
     *
     * @return array{imported: int, skipped: int}
     */
    public function importarSolicitudes(int $loteId, int $userId): array
    {
        return DB::transaction(function () use ($loteId, $userId) {
            $lote = AsignacionCombustibleLote::with('detalles')->findOrFail($loteId);

            if ($lote->estado !== EstadoLoteEnum::BORRADOR) {
                throw new \DomainException('Solo se pueden importar solicitudes en lotes en borrador.');
            }

            // Solicitudes ya presentes en este lote
            $yaImportados = $lote->detalles
                ->pluck('solicitud_combustible_id')
                ->filter()
                ->all();

            $solicitudes = SolicitudCombustible::query()
                ->whereDate('fecha_solicitud', $lote->fecha)
                ->whereIn('estado', [EstadoSolicitudEnum::APROBADA->value, EstadoSolicitudEnum::EN_REVISION->value])
                ->whereNotNull('ticket') // <-- Cambiado de numero_ticket a ticket
                ->whereNotNull('vehiculo_id')
                ->whereNotIn('id', $yaImportados)
                ->whereDoesntHave('loteDetalles', fn ($q) => $q->whereHas('lote', fn ($q2) => $q2->where('estado', '!=', EstadoLoteEnum::COMPLETADO)))
                ->with('vehiculo')
                ->get();

            $imported = 0;
            $skipped = 0;

            if ($solicitudes->isEmpty()) {

                Log::info('Importación de solicitudes: ninguna pendiente', [
                    'lote_id' => $loteId,
                    'fecha' => $lote->fecha,
                ]);

                app(\App\Domain\Solicitudes\Services\AuditoriaService::class)
                    ->registrar(
                        accion: AccionBitacoraEnum::ASIGNAR,
                        modelo: 'AsignacionCombustibleLote',
                        datos: [
                            'lote_id' => $lote->id,
                            'accion' => 'importar_solicitudes_vacio',
                            'importadas' => $imported,
                            'omitidas' => $skipped,
                        ]
                    );

                return ['imported' => 0, 'skipped' => 0];
            }

            foreach ($solicitudes as $solicitud) {
                // Seguridad extra: evitar duplicado por vehiculo en el mismo lote
                $duplicado = $lote->detalles()
                    ->where('vehiculo_id', $solicitud->vehiculo_id)
                    ->exists();

                if ($duplicado) {
                    $skipped++;

                    continue;
                }

                $lote->detalles()->create([
                    'vehiculo_id' => $solicitud->vehiculo_id,
                    'solicitud_combustible_id' => $solicitud->id,
                    'placa_cache' => $solicitud->vehiculo->placa ?? '',
                    'numero_ticket' => $solicitud->ticket,
                    'monto_asignado' => 0,
                    'cantidad_galones' => $solicitud->cantidad_combustible ?? 0,
                    'estado_asignacion' => 'pendiente',
                ]);

                $imported++;
            }

            Log::info('Solicitudes importadas al lote', [
                'lote_id' => $loteId,
                'imported' => $imported,
                'skipped' => $skipped,
                'importado_por' => $userId,
            ]);

            app(\App\Domain\Solicitudes\Services\AuditoriaService::class)
                ->registrar(
                    accion: AccionBitacoraEnum::ASIGNAR,
                    modelo: 'AsignacionCombustibleLote',
                    datos: [
                        'lote_id' => $lote->id,
                        'accion' => 'importar_solicitudes',
                        'importadas' => $imported,
                        'omitidas' => $skipped,
                        'fecha_lote' => $lote->fecha,
                    ]
                );

            return ['imported' => $imported, 'skipped' => $skipped];
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FINALIZAR LOTE (BORRADOR → FINALIZADO)
    // ─────────────────────────────────────────────────────────────────────────

    public function finalizarLote(int $loteId, int $userId): AsignacionCombustibleLote
    {
        return DB::transaction(function () use ($loteId, $userId) {
            $lote = AsignacionCombustibleLote::with('detalles.solicitudCombustible')->findOrFail($loteId);

            if ($lote->estado !== EstadoLoteEnum::BORRADOR) {
                throw new \DomainException('Solo se pueden finalizar lotes en estado borrador.');
            }

            if ($lote->detalles->isEmpty()) {
                throw new \DomainException('No se puede finalizar un lote sin vehículos asignados.');
            }

            $sinMonto = $lote->detalles->filter(fn ($d) => $d->monto_asignado <= 0);
            if ($sinMonto->isNotEmpty()) {
                throw new \DomainException(
                    "Hay {$sinMonto->count()} detalle(s) sin monto asignado. Todos deben tener monto mayor a 0."
                );
            }

            $noAprobadas = $lote->detalles->filter(fn ($d) => $d->solicitud_combustible_id !== null
                && optional($d->solicitudCombustible)->estado !== EstadoSolicitudEnum::APROBADA
            );
            if ($noAprobadas->isNotEmpty()) {
                $codigos = $noAprobadas
                    ->map(fn ($d) => optional($d->solicitudCombustible)->codigo ?? 'N/A')
                    ->implode(', ');
                throw new \DomainException(
                    "No se puede finalizar: las siguientes solicitudes no están aprobadas: {$codigos}"
                );
            }

            $lote->estado = EstadoLoteEnum::FINALIZADO->value;
            $lote->save();

            Log::info('Lote de combustible finalizado', [
                'lote_id' => $lote->id,
                'finalizado_por' => $userId,
                'total_vehiculos' => $lote->detalles->count(),
                'monto_total' => $lote->total_monto,
            ]);

            app(\App\Domain\Solicitudes\Services\AuditoriaService::class)
                ->registrar(
                    accion: AccionBitacoraEnum::COMPLETAR,
                    modelo: 'AsignacionCombustibleLote',
                    datos: [
                        'lote_id' => $lote->id,
                        'estado' => 'FINALIZADO',
                        'monto_total' => $lote->total_monto,
                    ]
                );

            return $lote;
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INICIAR ASIGNACIÓN (FINALIZADO → EN_PROCESO)
    // ─────────────────────────────────────────────────────────────────────────

    public function iniciarAsignacion(int $loteId, int $userId): AsignacionCombustibleLote
    {
        return DB::transaction(function () use ($loteId, $userId) {
            $lote = AsignacionCombustibleLote::findOrFail($loteId);

            if ($lote->estado !== EstadoLoteEnum::FINALIZADO) {
                throw new \DomainException('El lote debe estar finalizado para iniciar la asignación operativa.');
            }

            $lote->estado = EstadoLoteEnum::EN_PROCESO->value;
            $lote->save();

            Log::info('Asignación operativa iniciada', [
                'lote_id' => $lote->id,
                'iniciado_por' => $userId,
            ]);

            app(\App\Domain\Solicitudes\Services\AuditoriaService::class)
                ->registrar(
                    accion: AccionBitacoraEnum::ASIGNAR,
                    modelo: 'AsignacionCombustibleLote',
                    datos: [
                        'lote_id' => $lote->id,
                        'estado' => 'EN_PROCESO',
                    ]
                );

            return $lote;
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // COMPLETAR LOTE (EN_PROCESO → COMPLETADO)
    // ─────────────────────────────────────────────────────────────────────────

    public function completarLote(int $loteId, int $userId): AsignacionCombustibleLote
    {
        return DB::transaction(function () use ($loteId, $userId) {
            $lote = AsignacionCombustibleLote::with('detalles')->findOrFail($loteId);

            if ($lote->estado !== EstadoLoteEnum::EN_PROCESO) {
                throw new \DomainException('El lote debe estar en proceso para poder completarlo.');
            }

            $incompletos = $lote->detalles->filter(fn ($d) => ! $d->estaCompleto());
            if ($incompletos->isNotEmpty()) {
                throw new \DomainException(
                    "Hay {$incompletos->count()} detalle(s) sin datos operativos completos (serie, contrato, tipo combustible, galones)."
                );
            }

            $lote->estado = EstadoLoteEnum::COMPLETADO->value;
            $lote->save();

            // Poblar solicitudes con datos del lote para el reporte
            foreach ($lote->detalles as $detalle) {
                if (! $detalle->solicitud_combustible_id) {
                    continue;
                }

                $solicitud = $detalle->solicitudCombustible;
                if (! $solicitud || $solicitud->estado !== EstadoSolicitudEnum::APROBADA) {
                    Log::warning('Detalle de lote saltado en completarLote: solicitud no está APROBADA', [
                        'lote_id' => $lote->id,
                        'detalle_id' => $detalle->id,
                        'solicitud_id' => $detalle->solicitud_combustible_id,
                        'estado_actual' => optional($solicitud)->estado?->value ?? 'sin solicitud',
                    ]);

                    continue;
                }

                $contrato = ContratoCombustible::where('numero_contrato', $detalle->numero_contrato)->first();
                $serie = SerieCarga::where('nombre', $detalle->numero_serie)->first();
                if (! $contrato || ! $serie) {
                    continue;
                }

                $cantidadVales = (int) ($detalle->cantidad_galones ?? 1);
                $inicio = $serie->correlativo_actual;
                $fin = $inicio + $cantidadVales - 1;

                $solicitud->contrato_id = $contrato->id;
                $solicitud->serie_vale_id = $serie->id;
                $solicitud->correlativo_inicio = $inicio;
                $solicitud->correlativo_fin = $fin;
                $solicitud->cantidad_vales = $cantidadVales;
                $solicitud->monto_asignado = $detalle->monto_asignado ?? ($cantidadVales * $serie->valor);
                $solicitud->valor_total = $solicitud->monto_asignado;
                $solicitud->fecha_asignacion = now();
                $solicitud->asignado_por = $userId;
                $solicitud->estado = EstadoSolicitudEnum::ASIGNADA;
                $solicitud->save();

                // Avanzar correlativo en la serie
                $serie->correlativo_actual = $fin + 1;
                $serie->save();

                // Descontar del contrato
                $contrato->monto_disponible = (float) $contrato->monto_disponible - $solicitud->monto_asignado;
                $contrato->save();
            }

            Log::info('Lote de combustible completado', [
                'lote_id' => $lote->id,
                'completado_por' => $userId,
                'total_vehiculos' => $lote->detalles->count(),
                'total_galones' => $lote->total_galones,
                'monto_total' => $lote->total_monto,
            ]);

            app(\App\Domain\Solicitudes\Services\AuditoriaService::class)
                ->registrar(
                    accion: AccionBitacoraEnum::COMPLETAR,
                    modelo: 'AsignacionCombustibleLote',
                    datos: [
                        'lote_id' => $lote->id,
                        'estado' => 'COMPLETADO',
                        'total_galones' => $lote->total_galones,
                    ]
                );

            return $lote;
        });
    }
}
