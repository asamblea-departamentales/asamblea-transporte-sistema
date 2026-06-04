<?php

namespace App\Policies;

use App\Models\User;
use App\Models\RecepcionEntregaVehiculo;
use Illuminate\Auth\Access\HandlesAuthorization;

class RecepcionEntregaVehiculoPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('view_any_recepcion::entrega::vehiculo');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, RecepcionEntregaVehiculo $recepcionEntregaVehiculo): bool
    {
        return $user->can('view_recepcion::entrega::vehiculo');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('create_recepcion::entrega::vehiculo');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, RecepcionEntregaVehiculo $recepcionEntregaVehiculo): bool
    {
        return $user->can('update_recepcion::entrega::vehiculo');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, RecepcionEntregaVehiculo $recepcionEntregaVehiculo): bool
    {
        return $user->can('delete_recepcion::entrega::vehiculo');
    }

    /**
     * Determine whether the user can bulk delete.
     */
    public function deleteAny(User $user): bool
    {
        return $user->can('delete_any_recepcion::entrega::vehiculo');
    }

    /**
     * Determine whether the user can permanently delete.
     */
    public function forceDelete(User $user, RecepcionEntregaVehiculo $recepcionEntregaVehiculo): bool
    {
        return $user->can('force_delete_recepcion::entrega::vehiculo');
    }

    /**
     * Determine whether the user can permanently bulk delete.
     */
    public function forceDeleteAny(User $user): bool
    {
        return $user->can('force_delete_any_recepcion::entrega::vehiculo');
    }

    /**
     * Determine whether the user can restore.
     */
    public function restore(User $user, RecepcionEntregaVehiculo $recepcionEntregaVehiculo): bool
    {
        return $user->can('restore_recepcion::entrega::vehiculo');
    }

    /**
     * Determine whether the user can bulk restore.
     */
    public function restoreAny(User $user): bool
    {
        return $user->can('restore_any_recepcion::entrega::vehiculo');
    }

    /**
     * Determine whether the user can replicate.
     */
    public function replicate(User $user, RecepcionEntregaVehiculo $recepcionEntregaVehiculo): bool
    {
        return $user->can('replicate_recepcion::entrega::vehiculo');
    }

    /**
     * Determine whether the user can reorder.
     */
    public function reorder(User $user): bool
    {
        return $user->can('reorder_recepcion::entrega::vehiculo');
    }
}
