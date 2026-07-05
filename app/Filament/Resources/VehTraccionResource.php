<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA TRACCIONES DE VEHÍCULOS
// -----------------------------------------------------------------------------
// Administra los tipos de tracción o transmisión que pueden tener los vehículos
// (ej: "Tracción delantera", "Tracción trasera", "4x4", "Doble tracción").
// Permite crear, editar, buscar y eliminar tipos de tracción.
// Usado por administradores, jefes y personal de TI.

namespace App\Filament\Resources;

use App\Filament\Clusters\VehiculosCatalogos;
use App\Filament\Resources\VehTraccionResource\Pages;
use App\Models\VehTraccion;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class VehTraccionResource extends Resource
{
    protected static ?string $model = VehTraccion::class;

    protected static ?string $cluster = VehiculosCatalogos::class;

    protected static ?string $navigationLabel = 'Tracciones de Vehículos';

    protected static ?string $navigationIcon = 'heroicon-o-arrows-up-down';

    protected static ?string $modelLabel = 'Tracción';

    protected static ?string $pluralModelLabel = 'Tracciones';

    protected static ?int $navigationSort = 6;

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
                Tables\Actions\DeleteAction::make(),
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
            'index' => Pages\ListVehTraccions::route('/'),
            'create' => Pages\CreateVehTraccion::route('/create'),
            'edit' => Pages\EditVehTraccion::route('/{record}/edit'),
        ];
    }
}
