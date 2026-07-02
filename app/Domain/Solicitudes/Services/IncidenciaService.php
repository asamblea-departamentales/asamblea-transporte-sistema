<?php

namespace App\Domain\Solicitudes\Services;

use App\Models\Incidencia;
use App\Models\BitacoraEvento;
use App\Models\SolicitudCombustible;
use App\Models\SolicitudMantenimiento;
use App\Models\SolicitudTransporte;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class IncidenciaService
{
    public function crear(array $data): Incidencia
    {
        return DB::transaction(function () use ($data) {

            $entidad = $this->resolveEntidad($data['entidad_tipo'], $data['entidad_id']);

            $incidencia = $entidad->incidencias()->create([
                'tipo'          => $data['tipo'],
                'severidad'     => $data['severidad'],
                'descripcion'   => $data['descripcion'],
                'estado'        => 'abierta',
                'reportado_por' => auth()->id(),
                'evidencias'    => $data['evidencias'] ?? null,
            ]);

            BitacoraEvento::create([
                'entidad_tipo' => 'incidencia',
                'entidad_id'   => $incidencia->id,
                'accion'       => 'crear',
                'user_id'      => auth()->id(),
                'datos_extras' => [
                    'tipo' => $incidencia->tipo,
                    'severidad' => $incidencia->severidad,
                ],
            ]);

            return $incidencia;
        });
    }

    private function resolveEntidad(string $tipo, int $id): Model
    {
        return match ($tipo) {
            'combustible'   => SolicitudCombustible::findOrFail($id),
            'mantenimiento' => SolicitudMantenimiento::findOrFail($id),
            'transporte'    => SolicitudTransporte::findOrFail($id),
            default         => throw new \InvalidArgumentException("Tipo de entidad inválido: {$tipo}"),
        };
    }

    public function asignar(Incidencia $incidencia, int $userId): void
    {
        DB::transaction(function () use ($incidencia, $userId) {

            $antes = $incidencia->toArray();

            $incidencia->update([
                'asignado_a' => $userId,
                'estado'     => 'en_proceso',
            ]);

            BitacoraEvento::create([
                'entidad_tipo' => 'incidencia',
                'entidad_id'   => $incidencia->id,
                'accion'       => 'asignar',
                'user_id'      => auth()->id(),
                'datos_extras' => [
                    'antes' => $antes,
                    'despues' => $incidencia->fresh()->toArray(),
                ],
            ]);
        });
    }

    public function resolver(Incidencia $incidencia, array $data): void
    {
        DB::transaction(function () use ($incidencia, $data) {

            $antes = $incidencia->toArray();

            $incidencia->update([
                'estado'           => 'resuelta',
                'resolucion'       => $data['resolucion'],
                'fecha_resolucion' => now(),
            ]);

            BitacoraEvento::create([
                'entidad_tipo' => 'incidencia',
                'entidad_id'   => $incidencia->id,
                'accion'       => 'resolver',
                'user_id'      => auth()->id(),
                'datos_extras' => [
                    'antes' => $antes,
                    'despues' => $incidencia->fresh()->toArray(),
                ],
            ]);
        });
    }

    public function cerrar(Incidencia $incidencia): void
    {
        DB::transaction(function () use ($incidencia) {

            $antes = $incidencia->toArray();

            $incidencia->update([
                'estado' => 'cerrada',
            ]);

            BitacoraEvento::create([
                'entidad_tipo' => 'incidencia',
                'entidad_id'   => $incidencia->id,
                'accion'       => 'cerrar',
                'user_id'      => auth()->id(),
                'datos_extras' => [
                    'antes' => $antes,
                    'despues' => $incidencia->fresh()->toArray(),
                ],
            ]);
        });
    }

    public function reabrir(Incidencia $incidencia): void
    {
        DB::transaction(function () use ($incidencia) {

            $incidencia->update([
                'estado' => 'abierta',
            ]);

            BitacoraEvento::create([
                'entidad_tipo' => 'incidencia',
                'entidad_id'   => $incidencia->id,
                'accion'       => 'reabrir',
                'user_id'      => auth()->id(),
            ]);
        });
    }
}