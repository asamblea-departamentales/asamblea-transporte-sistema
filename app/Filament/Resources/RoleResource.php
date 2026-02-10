<?php

namespace App\Filament\Resources;

use BezhanSalleh\FilamentShield\Resources\RoleResource as BaseRoleResource;

class RoleResource extends BaseRoleResource
{
    protected static ?string $navigationGroup = 'Administración';
    protected static ?int $navigationSort = 2;
    protected static ?string $navigationLabel = 'Roles';
}