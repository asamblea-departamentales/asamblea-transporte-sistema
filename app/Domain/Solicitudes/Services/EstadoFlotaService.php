<?php

// / Este servicio se encarga de gestionar el estado operativo de los vehículos y motoristas en función del estado de las solicitudes de transporte.
// Se encarga de reservar y liberar vehículos y motoristas basado en los estados de las solicitudes, asegurando que los recursos se asignen correctamente y se liberen cuando ya no estén en uso.

namespace App\Domain\Solicitudes\Services;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\Motorista;
use App\Models\SolicitudTransporte;
use App\Models\VehEstadoCatalogo;
use App\Models\Vehiculo;
use Illuminate\Support\Facades\DB;

class EstadoFlotaService
{
    // Reserva un vehículo y ocupa un motorista para una solicitud de transporte específica. Estado del vehículo se cambia a "Reservado" y el estado del motorista se cambia a inactivo.
    public function reservarVehiculo(Vehiculo $vehiculo, string $codigoViaje): void
    {
        $reservado = VehEstadoCatalogo::where('nombre', 'Reservado')->value('id');

        if ($reservado) {
            $vehiculo->update(['veh_estado_catalogo_id' => $reservado]);
        }
    }

    // Libera un vehículo, cambiando su estado a "Disponible" solo si no tiene otro viaje activo
    // y su estado actual es "Reservado". Preserva estados manuales como "En Taller" o "Baja".
    public function liberarVehiculo(Vehiculo $vehiculo): void
    {
        if (! $this->esEstadoReservado($vehiculo)) {
            return;
        }

        $tieneOtroViajeActivo = SolicitudTransporte::where('vehiculo_id', $vehiculo->id)
            ->whereIn('estado', [
                EstadoSolicitudEnum::EN_EJECUCION,
                EstadoSolicitudEnum::PROGRAMADA,
                EstadoSolicitudEnum::APROBADA,
                EstadoSolicitudEnum::ASIGNADA,
            ])
            ->exists();

        if (! $tieneOtroViajeActivo) {
            $disponible = VehEstadoCatalogo::where('nombre', 'Disponible')->value('id');
            if ($disponible) {
                $vehiculo->update(['veh_estado_catalogo_id' => $disponible]);
            }
        }
    }

    private function esEstadoReservado(Vehiculo $vehiculo): bool
    {
        if ($vehiculo->veh_estado_catalogo_id === null) {
            return false;
        }

        $estadoNombre = VehEstadoCatalogo::where('id', $vehiculo->veh_estado_catalogo_id)->value('nombre');

        return $estadoNombre === 'Reservado';
    }

    // Ocupar un motorista, cambiando su estado a inactivo solo si no tiene otro viaje activo. Cambia el estado del motorista a inactivo.
    public function ocuparMotorista(Motorista $motorista, string $codigoViaje): void
    {
        app(MotoristaService::class)->cambiarEstado(
            $motorista,
            false,
            "Asignado a viaje {$codigoViaje}"
        );
    }

    // Liberar un motorista, cambiando su estado a disponible solo si no tiene otro viaje activo. Cambia el estado del motorista a disponible solo si no tiene otro viaje activo.
    public function liberarMotorista(Motorista $motorista, string $codigoViaje): void
    {
        $tieneOtroViajeActivo = SolicitudTransporte::where('motorista_id', $motorista->id)
            ->whereIn('estado', [
                EstadoSolicitudEnum::EN_EJECUCION,
                EstadoSolicitudEnum::PROGRAMADA,
                EstadoSolicitudEnum::APROBADA,
                EstadoSolicitudEnum::ASIGNADA,
            ])
            ->exists();

        if (! $tieneOtroViajeActivo) {
            app(MotoristaService::class)->cambiarEstado(
                $motorista,
                true,
                "Viaje {$codigoViaje} finalizado"
            );
        }
    }

    // Aplica los cambios de estado a vehículos y motoristas según el estado de la solicitud de transporte. Si la solicitud se asigna o programa, reserva el vehículo y ocupa el motorista. Si la solicitud se completa o cancela, libera el vehículo y el motorista.
    public function aplicarPorEstado(SolicitudTransporte $solicitud): void
    {
        DB::transaction(function () use ($solicitud) {
            $codigo = $solicitud->codigo;

            if (in_array($solicitud->estado, [
                EstadoSolicitudEnum::ASIGNADA,
                EstadoSolicitudEnum::PROGRAMADA,
            ], true) && $solicitud->vehiculo_id && $solicitud->motorista_id) {

                $vehiculo = Vehiculo::find($solicitud->vehiculo_id);
                $motorista = Motorista::find($solicitud->motorista_id);

                if ($vehiculo) {
                    $this->reservarVehiculo($vehiculo, $codigo);
                }
                if ($motorista) {
                    $this->ocuparMotorista($motorista, $codigo);
                }
            }

            if (in_array($solicitud->estado, [
                EstadoSolicitudEnum::COMPLETADA,
                EstadoSolicitudEnum::CANCELADA,
            ], true)) {

                $vehiculo = Vehiculo::find($solicitud->vehiculo_id);
                $motorista = Motorista::find($solicitud->motorista_id);

                if ($vehiculo) {
                    $this->liberarVehiculo($vehiculo);
                }
                if ($motorista) {
                    $this->liberarMotorista($motorista, $codigo);
                }
            }
        });
    }
}
