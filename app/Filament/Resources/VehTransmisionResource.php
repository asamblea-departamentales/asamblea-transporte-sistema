<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA TRANSMISIONES DE VEHÍCULOS
// -----------------------------------------------------------------------------
// Gestiona los tipos de transmisión que pueden tener los vehículos
// (ej: "Automática", "Manual", "CVT", "Automática secuencial").
// Permite crear, editar, buscar y eliminar tipos de transmisión.
// Usado por administradores, jefes y personal de TI para mantener el catálogo.

namespace App\Filament\Resources;

use App\Filament\Clusters\VehiculosCatalogos;
use App\Filament\Resources\VehTransmisionResource\Pages;
use App\Models\VehTransmision;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class VehTransmisionResource extends Resource
{
    protected static ?string $model = VehTransmision::class;

    protected static ?string $cluster = VehiculosCatalogos::class;

    protected static ?string $navigationLabel = 'Transmisiones de Vehículos';

    protected static ?string $navigationIcon = 'heroicon-o-arrows-right-left';

    protected static ?string $modelLabel = 'Transmisión';

    protected static ?string $pluralModelLabel = 'Transmisiones';

    protected static ?int $navigationSort = 5;

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
            'index' => Pages\ListVehTransmisions::route('/'),
            'create' => Pages\CreateVehTransmision::route('/create'),
            'edit' => Pages\EditVehTransmision::route('/{record}/edit'),
        ];
    }
}
