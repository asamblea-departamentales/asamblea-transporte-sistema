<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA TIPOS DE LLANTAS
// -----------------------------------------------------------------------------
// Gestiona los tipos de llantas o neumáticos que se pueden asignar a los
// vehículos (ej: "Radiales", "Todo terreno", "Invierno").
// Permite crear, editar, buscar y eliminar tipos de llantas.
// Usado por administradores, jefes y personal de TI.

namespace App\Filament\Resources;

use App\Filament\Clusters\VehiculosCatalogos;
use App\Filament\Resources\VehTipoLlantaResource\Pages;
use App\Filament\Resources\VehTipoLlantaResource\RelationManagers;
use App\Models\VehTipoLlanta;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class VehTipoLlantaResource extends Resource
{
    protected static ?string $model = VehTipoLlanta::class;
    protected static ?string $cluster = VehiculosCatalogos::class;
    protected static ?string $navigationLabel = 'Tipos de Llantas';
    protected static ?string $navigationIcon = 'heroicon-o-circle-stack';
    protected static ?string $modelLabel = 'Tipo de Llanta';
    protected static ?string $pluralModelLabel = 'Tipos de Llantas';
    protected static ?int $navigationSort = 7;

        public static function canViewAny(): bool
        {
            return auth()->user()->hasAnyRole(['admin', 'ti', 'jefe']);
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
                    ->boolean()
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
            'index' => Pages\ListVehTipoLlantas::route('/'),
            'create' => Pages\CreateVehTipoLlanta::route('/create'),
            'edit' => Pages\EditVehTipoLlanta::route('/{record}/edit'),
        ];
    }
}
