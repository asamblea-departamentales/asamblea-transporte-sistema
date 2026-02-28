<?php
namespace App\Filament\Resources;

use App\Filament\Resources\ParametroSistemaResource\Pages;
use App\Models\ParametroSistema;
use Filament\Resources\Resource;

class ParametroSistemaResource extends Resource
{
    protected static ?string $model = ParametroSistema::class;
    protected static ?string $navigationGroup = 'Catálogos Globales';
    protected static ?string $navigationLabel = 'Parámetros del Sistema';
    protected static ?string $navigationIcon  = 'heroicon-o-cog-6-tooth';
    protected static ?int    $navigationSort  = 7;

    public static function canViewAny(): bool { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canCreate(): bool  { return false; } // Solo se editan, no se crean desde UI
    public static function canEdit($r): bool  { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canDelete($r): bool { return false; } // Parámetros no se eliminan

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListParametroSistemas::route('/'),
        ];
    }
}