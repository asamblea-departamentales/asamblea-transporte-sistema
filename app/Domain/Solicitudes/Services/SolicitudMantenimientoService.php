<?php

namespace App\Domain\Solicitudes\Services;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\BitacoraEvento;
use App\Models\HistorialEstado;
use App\Models\SolicitudMantenimiento;
use Illuminate\Support\Facades\DB;

/**
 * Servicio encargado de gestionar la lógica y transiciones de estado de Solicitudes de Mantenimiento.
 */
class SolicitudMantenimientoService
{
    // El solicitante envía la solicitud como borrador para revisión
    public function enviarSolicitud(SolicitudMantenimiento $solicitud, int $userId): SolicitudMantenimiento
    {
        if ($solicitud->estado !== EstadoSolicitudEnum::BORRADOR) {
            throw new \DomainException('Solo se puede enviar una solicitud en estado Borrador.');
        }

        return DB::transaction(function () use ($solicitud, $userId) {
            $anterior = $solicitud->estado;

            $solicitud->estado = EstadoSolicitudEnum::PENDIENTE;
            $solicitud->save();

            $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $userId, null);
            $this->registrarEvento($solicitud, AccionBitacoraEnum::ENVIAR->value, $userId, null);

            return $solicitud;
        });
    }

    // El jefe puede agregar notas / observación
    public function observar(SolicitudMantenimiento $solicitud, int $jefeId, ?string $comentario): SolicitudMantenimiento
    {
        if (! in_array($solicitud->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)) {
            throw new \DomainException('Solo se puede observar una solicitud en estado Pendiente o En Revisión.');
        }

        return DB::transaction(function () use ($solicitud, $jefeId, $comentario) {
            $anterior = $solicitud->estado;

            // Guardar comentario siempre
            $solicitud->observaciones = $comentario;

            // Transición automática de PENDIENTE -> EN_REVISION
            if ($solicitud->estado === EstadoSolicitudEnum::PENDIENTE) {
                $solicitud->estado = EstadoSolicitudEnum::EN_REVISION;
            }

            $solicitud->save();

            // Registrar historial solo si hubo cambio real
            if ($anterior !== $solicitud->estado) {
                $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $jefeId, $comentario);
            }

            $this->registrarEvento($solicitud, AccionBitacoraEnum::OBSERVAR->value, $jefeId, [
                'comentario' => $comentario,
            ]);

            return $solicitud;
        });
    }

    // Pre-aprobación: PENDIENTE/EN_REVISION -> PRE_APROBADA
    public function preAprobar(SolicitudMantenimiento $solicitud, int $jefeId): SolicitudMantenimiento
    {
        if (! in_array($solicitud->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)) {
            throw new \DomainException('Solo se puede pre-aprobar una solicitud Pendiente o En Revisión.');
        }

        return DB::transaction(function () use ($solicitud, $jefeId) {
            $anterior = $solicitud->estado;

            $solicitud->estado           = EstadoSolicitudEnum::PRE_APROBADA;
            $solicitud->aprobador_id     = $jefeId;     // útil para auditoría
            $solicitud->fecha_aprobacion = now();       // útil para auditoría
            $solicitud->save();

            $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $jefeId, 'Solicitud pre-aprobada.');
            $this->registrarEvento($solicitud, 'PRE_APROBAR', $jefeId, null);

            return $solicitud;
        });
    }

    // Aprobación final: PRE_APROBADA -> APROBADA
    public function aprobar(SolicitudMantenimiento $solicitud, int $jefeId, ?string $observaciones): SolicitudMantenimiento
    {
        if ($solicitud->estado !== EstadoSolicitudEnum::PRE_APROBADA) {
            throw new \DomainException('Solo se puede aprobar una solicitud Pre-Aprobada.');
        }

        return DB::transaction(function () use ($solicitud, $jefeId, $observaciones) {
            $anterior = $solicitud->estado;

            $solicitud->estado           = EstadoSolicitudEnum::APROBADA;
            $solicitud->aprobador_id     = $jefeId;
            $solicitud->fecha_aprobacion = now();
            $solicitud->observaciones    = $observaciones;
            $solicitud->motivo_rechazo   = null; // limpiar si venía rechazada antes
            $solicitud->save();

            $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $jefeId, $observaciones);
            $this->registrarEvento($solicitud, AccionBitacoraEnum::APROBAR->value, $jefeId, [
                'observaciones' => $observaciones,
            ]);

            return $solicitud;
        });
    }

    // Rechazo: PENDIENTE/EN_REVISION/PRE_APROBADA -> RECHAZADA
    public function rechazar(SolicitudMantenimiento $solicitud, int $jefeId, string $motivoRechazo): SolicitudMantenimiento
    {
        if (! in_array($solicitud->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION, EstadoSolicitudEnum::PRE_APROBADA], true)) {
            throw new \DomainException('Solo se puede rechazar una solicitud Pendiente, En Revisión o Pre-Aprobada.');
        }

        return DB::transaction(function () use ($solicitud, $jefeId, $motivoRechazo) {
            $anterior = $solicitud->estado;

            $solicitud->estado           = EstadoSolicitudEnum::RECHAZADA;
            $solicitud->motivo_rechazo   = $motivoRechazo;
            $solicitud->aprobador_id     = $jefeId;
            $solicitud->fecha_aprobacion = now();
            $solicitud->save();

            $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $jefeId, $motivoRechazo);
            $this->registrarEvento($solicitud, AccionBitacoraEnum::RECHAZAR->value, $jefeId, [
                'motivo_rechazo' => $motivoRechazo,
            ]);

            return $solicitud;
        });
    }

    // Iniciar ejecución: APROBADA -> EN_EJECUCION
    //public function iniciarEjecucion(SolicitudMantenimiento $solicitud, int $userId): SolicitudMantenimiento
  //  {
       // if ($solicitud->estado !== EstadoSolicitudEnum::APROBADA) {
          //  throw new \DomainException('Solo se puede iniciar ejecución de una solicitud Aprobada.');
        //}

        //return DB::transaction(function () use ($solicitud, $userId) {
            //$anterior = $solicitud->estado;

           // $solicitud->estado = EstadoSolicitudEnum::EN_EJECUCION;
            //$solicitud->save();

          //  $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $userId, 'Mantenimiento iniciado.');
         //   $this->registrarEvento($solicitud, 'EN_EJECUCION', $userId, null);

       //     return $solicitud;
     //   });
   // }

    // Completar: APROBADA -> COMPLETADA (desde frontend, con adjuntos / atestado)
    //Mismo cambio que en transporte, pasamos la accion de finalizar al service

public function completar(SolicitudMantenimiento $solicitud, int $userId, array $data): SolicitudMantenimiento
{
    if (!in_array($solicitud->estado, [
        EstadoSolicitudEnum::APROBADA,
        EstadoSolicitudEnum::EN_EJECUCION,
    ])) {
        throw new \DomainException('Solo se puede completar una solicitud aprobada o en ejecución.');
    }

    $adjuntosExistentes = $solicitud->adjuntos ?? [];
    $nuevosAdjuntos = $data['adjuntos'] ?? [];

    $todosAdjuntos = array_values(array_filter(array_merge($adjuntosExistentes, $nuevosAdjuntos)));

    if (empty($todosAdjuntos)) {
        throw new \DomainException('Debes subir al menos un adjunto.');
    }

    return DB::transaction(function () use ($solicitud, $userId, $data, $todosAdjuntos) {
        $anterior = $solicitud->estado;

        $solicitud->estado = EstadoSolicitudEnum::COMPLETADA;
        $solicitud->fecha_realizada = $data['fecha_realizada'];
        $solicitud->costo_real = $data['costo_real'];
        $solicitud->adjuntos = $todosAdjuntos;
        $solicitud->finalizado_por = $userId;
        $solicitud->fecha_finalizacion = now();

        $solicitud->save();

        $this->registrarCambioEstado(
            $solicitud,
            $anterior,
            $solicitud->estado,
            $userId,
            'Mantenimiento finalizado.'
        );

        $this->registrarEvento($solicitud, AccionBitacoraEnum::COMPLETAR->value, $userId, [
            'costo_real' => $data['costo_real'],
            'fecha_realizada' => $data['fecha_realizada'],
        ]);

        return $solicitud;
    });
}

    // Cancelar: BORRADOR/PENDIENTE -> CANCELADA
    public function cancelar(SolicitudMantenimiento $solicitud, int $userId): SolicitudMantenimiento
    {
        if (! in_array($solicitud->estado, [EstadoSolicitudEnum::BORRADOR, EstadoSolicitudEnum::PENDIENTE], true)) {
            throw new \DomainException('Solo se puede cancelar una solicitud en estado Borrador o Pendiente.');
        }

        return DB::transaction(function () use ($solicitud, $userId) {
            $anterior = $solicitud->estado;

            $solicitud->estado = EstadoSolicitudEnum::CANCELADA;
            $solicitud->save();

            $this->registrarCambioEstado($solicitud, $anterior, $solicitud->estado, $userId, 'Solicitud cancelada.');
            $this->registrarEvento($solicitud, AccionBitacoraEnum::CANCELAR->value, $userId, null);

            return $solicitud;
        });
    }
    

    //Nuevo, agregado como proceso
    public function evaluar(
    SolicitudMantenimiento $solicitud,
    int $userId,
    string $estado,
    ?string $comentario
): SolicitudMantenimiento {

    if ($solicitud->estado !== EstadoSolicitudEnum::COMPLETADA) {
        throw new \DomainException('Solo se puede evaluar una solicitud completada.');
    }

    return DB::transaction(function () use ($solicitud, $userId, $estado, $comentario) {

        $solicitud->evaluacion_estado = $estado;
        $solicitud->evaluacion_comentario = $comentario;
        $solicitud->evaluado_por = $userId;
        $solicitud->fecha_evaluacion = now();

        $solicitud->save();

        // NO cambia estado → se mantiene COMPLETADA
        // (igual que hiciste con liquidador ✔️)

        BitacoraEvento::create([
            'entidad_tipo' => 'solicitud_mantenimiento',
            'entidad_id' => $solicitud->id,
            'accion' => 'EVALUAR',
            'user_id' => $userId,
            'datos_extras' => [
                'estado' => $estado,
                'comentario' => $comentario,
            ],
        ]);

        return $solicitud;
    });
}

public function liquidar(SolicitudMantenimiento $solicitud, int $userId, array $data): void
{
    if (empty($solicitud->adjuntos)) {
        throw new \DomainException('No se puede liquidar sin adjuntos.');
    }

    DB::transaction(function () use ($solicitud, $userId, $data) {
        $solicitud->liquidacion()->create([
            'user_id'           => $userId,
            'monto_solicitado'  => $solicitud->costo_real ?? $solicitud->costo_estimado,
            'monto_validado'    => $data['monto_validado'],
            'resultado'         => $data['resultado'],
            'observaciones'     => $data['observaciones'] ?? null,
            'fecha_liquidacion' => now(),
        ]);

        $anterior = $solicitud->estado;
        $solicitud->estado = EstadoSolicitudEnum::LIQUIDADA;
        $solicitud->save();

        $this->registrarCambioEstado(
            $solicitud,
            $anterior,
            $solicitud->estado,
            $userId,
            'Liquidación registrada.'
        );

        $this->registrarEvento($solicitud, 'LIQUIDAR', $userId, [
            'monto_validado' => $data['monto_validado'],
            'resultado'      => $data['resultado'],
        ]);
    });
}



    // =====================================================
    // Helpers (mismo patrón que transporte)
    // =====================================================

    private function registrarCambioEstado(SolicitudMantenimiento $solicitud, $anterior, $nuevo, int $userId, ?string $comentario): void
    {
        HistorialEstado::create([
            'entidad_tipo'    => 'solicitud_mantenimiento',
            'entidad_id'      => $solicitud->id,
            'estado_anterior' => $anterior?->value ?? (string) $anterior,
            'estado_nuevo'    => $nuevo?->value ?? (string) $nuevo,
            'user_id'         => $userId,
            'comentario'      => $comentario,
        ]);
    }

    private function registrarEvento(SolicitudMantenimiento $solicitud, string $accion, int $userId, ?array $extra = null): void
    {
        BitacoraEvento::create([
            'entidad_tipo'  => 'solicitud_mantenimiento',
            'entidad_id'    => $solicitud->id,
            'accion'        => $accion,
            'user_id'       => $userId,
            'datos_extras'  => $extra,
        ]);
    }
}