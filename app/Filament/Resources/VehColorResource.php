<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA COLORES DE VEHÍCULOS
// -----------------------------------------------------------------------------
// Gestiona el catálogo de colores disponibles para los vehículos del sistema.
// Permite crear, editar, buscar y eliminar colores (ej: "Rojo", "Blanco", "Azul").
// Los administradores, jefes y personal de TI usan esto para mantener la lista
// de colores que se pueden asignar a cada vehículo.

namespace App\Filament\Resources;

use App\Filament\Clusters\VehiculosCatalogos;
use App\Filament\Resources\VehColorResource\Pages;
use App\Models\VehColor;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class VehColorResource extends Resource
{
    protected static ?string $model = VehColor::class;

    protected static ?string $cluster = VehiculosCatalogos::class;

    protected static ?string $navigationLabel = 'Colores de Vehículos';

    protected static ?string $navigationIcon = 'heroicon-o-swatch';

    protected static ?string $modelLabel = 'Color';

    protected static ?string $pluralModelLabel = 'Colores';

    protected static ?int $navigationSort = 3;

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
            'index' => Pages\ListVehColors::route('/'),
            'create' => Pages\CreateVehColor::route('/create'),
            'edit' => Pages\EditVehColor::route('/{record}/edit'),
        ];
    }
}
