<?php

namespace App\Policies;

use App\Models\User;
use App\Models\SolicitudTransporte;
use Illuminate\Auth\Access\HandlesAuthorization;

class SolicitudTransportePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
   public function viewAny(User $user): bool
{
    // Permitir si tiene el permiso de Shield O si es un usuario autenticado 
    // (el filtrado de "ver solo lo mío" se hace en el controlador)
    return $user->can('view_any_solicitud::transporte') || auth()->check();
}

public function view(User $user, SolicitudTransporte $solicitudTransporte): bool
{
    // Opción 1: Tiene permiso administrativo (Shield)
    if ($user->can('view_solicitud::transporte')) {
        return true;
    }

    // Opción 2: Es el dueño de la solicitud
    return $user->id === $solicitudTransporte->solicitante_id;
}

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('create_solicitud::transporte');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, SolicitudTransporte $solicitudTransporte): bool
    {
        return $user->can('update_solicitud::transporte');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, SolicitudTransporte $solicitudTransporte): bool
    {
        return $user->can('delete_solicitud::transporte');
    }

    /**
     * Determine whether the user can bulk delete.
     */
    public function deleteAny(User $user): bool
    {
        return $user->can('delete_any_solicitud::transporte');
    }

    /**
     * Determine whether the user can permanently delete.
     */
    public function forceDelete(User $user, SolicitudTransporte $solicitudTransporte): bool
    {
        return $user->can('force_delete_solicitud::transporte');
    }

    /**
     * Determine whether the user can permanently bulk delete.
     */
    public function forceDeleteAny(User $user): bool
    {
        return $user->can('force_delete_any_solicitud::transporte');
    }

    /**
     * Determine whether the user can restore.
     */
    public function restore(User $user, SolicitudTransporte $solicitudTransporte): bool
    {
        return $user->can('restore_solicitud::transporte');
    }

    /**
     * Determine whether the user can bulk restore.
     */
    public function restoreAny(User $user): bool
    {
        return $user->can('restore_any_solicitud::transporte');
    }

    /**
     * Determine whether the user can replicate.
     */
    public function replicate(User $user, SolicitudTransporte $solicitudTransporte): bool
    {
        return $user->can('replicate_solicitud::transporte');
    }

    /**
     * Determine whether the user can reorder.
     */
    public function reorder(User $user): bool
    {
        return $user->can('reorder_solicitud::transporte');
    }
}
