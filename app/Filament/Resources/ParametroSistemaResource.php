<?php
// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA PARÁMETROS DEL SISTEMA
// -----------------------------------------------------------------------------
// Administra las configuraciones generales del sistema de transporte.
// Aquí se definen valores globales que afectan cómo funciona la
// aplicación (límites, tiempos, opciones por defecto, etc.).
// Solo se pueden ver y editar; no se crean ni eliminan desde la interfaz.
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

    public static function canViewAny(): bool { return auth()->user()->hasAnyRole(['super_admin', 'superadmin', 'admin', 'ti', 'jefe']); }
    public static function canCreate(): bool  { return false; } // Solo se editan, no se crean desde UI
    public static function canEdit($r): bool  { return auth()->user()->hasAnyRole(['super_admin', 'superadmin', 'admin', 'ti', 'jefe']); }
    public static function canDelete($r): bool { return false; } // Parámetros no se eliminan

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListParametroSistemas::route('/'),
        ];
    }
}