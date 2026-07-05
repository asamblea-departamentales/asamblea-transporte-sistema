<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA ESTADOS DE CATÁLOGO
// -----------------------------------------------------------------------------
// Administra los posibles estados o condiciones que puede tener un vehículo
// dentro del sistema (ej: "Activo", "Inactivo", "En reparación", "Dado de baja").
// Usado por administradores y jefes para definir las opciones de estado
// disponibles al registrar o actualizar la información de un vehículo.

namespace App\Filament\Resources;

use App\Filament\Clusters\VehiculosCatalogos;
use App\Filament\Resources\VehEstadoCatalogoResource\Pages;
use App\Models\VehEstadoCatalogo;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class VehEstadoCatalogoResource extends Resource
{
    protected static ?string $model = VehEstadoCatalogo::class;

    protected static ?string $cluster = VehiculosCatalogos::class;

    protected static ?string $navigationLabel = 'Estados de Catálogo';

    protected static ?int $navigationSort = 10;

    protected static ?string $navigationIcon = 'heroicon-o-shield-check';

    protected static ?string $modelLabel = 'Estado de Catálogo';

    protected static ?string $pluralModelLabel = 'Estados de Catálogo';

    public static function canViewAny(): bool
    {
        return auth()->user()->hasAnyRole(['admin', 'ti', 'jefe', 'super_admin']);
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make()->schema([
                    Forms\Components\TextInput::make('nombre')
                        ->label('Nombre')
                        ->required()
                        ->maxLength(100)
                        ->unique(ignoreRecord: true),

                    Forms\Components\Toggle::make('activo')
                        ->label('Activo')
                        ->default(true),
                ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('nombre')
                    ->label('Nombre')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\IconColumn::make('activo')
                    ->label('Activo')
                    ->boolean(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('activo')->label('Activo'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListVehEstadoCatalogos::route('/'),
            'create' => Pages\CreateVehEstadoCatalogo::route('/create'),
            'edit' => Pages\EditVehEstadoCatalogo::route('/{record}/edit'),
        ];
    }
}
