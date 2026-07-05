<?php

namespace App\Policies;

use App\Models\Motorista;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class MotoristaPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('view_any_motorista');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Motorista $motorista): bool
    {
        return $user->can('view_motorista');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('create_motorista');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Motorista $motorista): bool
    {
        return $user->can('update_motorista');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Motorista $motorista): bool
    {
        return $user->can('delete_motorista');
    }

    /**
     * Determine whether the user can bulk delete.
     */
    public function deleteAny(User $user): bool
    {
        return $user->can('delete_any_motorista');
    }

    /**
     * Determine whether the user can permanently delete.
     */
    public function forceDelete(User $user, Motorista $motorista): bool
    {
        return $user->can('force_delete_motorista');
    }

    /**
     * Determine whether the user can permanently bulk delete.
     */
    public function forceDeleteAny(User $user): bool
    {
        return $user->can('force_delete_any_motorista');
    }

    /**
     * Determine whether the user can restore.
     */
    public function restore(User $user, Motorista $motorista): bool
    {
        return $user->can('restore_motorista');
    }

    /**
     * Determine whether the user can bulk restore.
     */
    public function restoreAny(User $user): bool
    {
        return $user->can('restore_any_motorista');
    }

    /**
     * Determine whether the user can replicate.
     */
    public function replicate(User $user, Motorista $motorista): bool
    {
        return $user->can('replicate_motorista');
    }

    /**
     * Determine whether the user can reorder.
     */
    public function reorder(User $user): bool
    {
        return $user->can('reorder_motorista');
    }
}
