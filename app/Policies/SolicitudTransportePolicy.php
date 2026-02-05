<?php

namespace App\Policies;

use App\Models\SolicitudTransporte;
use App\Models\User;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use Illuminate\Auth\Access\Response;

class SolicitudTransportePolicy
{
    /**
     * Determina quién puede ver la lista (Index)
     */
    public function viewAny(User $user): bool
    {
        // Todos los roles autorizados pueden entrar a la lista
        return $user->hasAnyRole(['jefe', 'admin', 'ti', 'solicitante']);
    }

    /**
     * Determina quién puede ver una solicitud específica
     */
    public function view(User $user, SolicitudTransporte $solicitud): bool
    {
        // El jefe/admin ve todas
        if ($user->hasAnyRole(['jefe', 'admin', 'ti'])) {
            return true;
        }

        // El solicitante solo ve las suyas (clave para el colega de React)
        return $user->id === $solicitud->solicitante_id;
    }

    /**
     * Esta es la regla de oro para el Service (Aprobar/Rechazar)
     */
    public function decidir(User $user, SolicitudTransporte $solicitud): bool
    {
        // 1. Solo el jefe puede decidir
        // 2. Solo si la solicitud está esperando respuesta (PENDIENTE o REVISIÓN)
        return $user->hasRole('jefe') && 
               in_array($solicitud->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION]);
    }

    /**
     * Determina si el solicitante puede editar (Solo en Borrador)
     */
    public function update(User $user, SolicitudTransporte $solicitud): bool
    {
        return $user->id === $solicitud->solicitante_id && 
               $solicitud->estado === EstadoSolicitudEnum::BORRADOR;
    }
}