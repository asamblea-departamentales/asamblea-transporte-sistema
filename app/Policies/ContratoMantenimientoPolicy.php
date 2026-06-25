<?php

namespace App\Policies;

use App\Models\User;
use App\Models\ContratoMantenimiento;
use Illuminate\Auth\Access\HandlesAuthorization;

class ContratoMantenimientoPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can('view_any_contrato::mantenimiento');
    }

    public function view(User $user, ContratoMantenimiento $contratoMantenimiento): bool
    {
        return $user->can('view_contrato::mantenimiento');
    }

    public function create(User $user): bool
    {
        return $user->can('create_contrato::mantenimiento');
    }

    public function update(User $user, ContratoMantenimiento $contratoMantenimiento): bool
    {
        return $user->can('update_contrato::mantenimiento');
    }

    public function delete(User $user, ContratoMantenimiento $contratoMantenimiento): bool
    {
        return $user->can('delete_contrato::mantenimiento');
    }

    public function deleteAny(User $user): bool
    {
        return $user->can('delete_any_contrato::mantenimiento');
    }

    public function forceDelete(User $user, ContratoMantenimiento $contratoMantenimiento): bool
    {
        return $user->can('force_delete_contrato::mantenimiento');
    }

    public function forceDeleteAny(User $user): bool
    {
        return $user->can('force_delete_any_contrato::mantenimiento');
    }

    public function restore(User $user, ContratoMantenimiento $contratoMantenimiento): bool
    {
        return $user->can('restore_contrato::mantenimiento');
    }

    public function restoreAny(User $user): bool
    {
        return $user->can('restore_any_contrato::mantenimiento');
    }

    public function replicate(User $user, ContratoMantenimiento $contratoMantenimiento): bool
    {
        return $user->can('replicate_contrato::mantenimiento');
    }

    public function reorder(User $user): bool
    {
        return $user->can('reorder_contrato::mantenimiento');
    }
}
