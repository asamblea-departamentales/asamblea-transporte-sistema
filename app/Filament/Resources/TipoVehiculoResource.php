<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA TIPOS DE VEHÍCULO
// -----------------------------------------------------------------------------
// Este archivo define la lógica para gestionar los tipos de vehículo
// dentro del sistema. Aquí se configuran los formularios y las tablas para
// administrar los diferentes tipos de vehículos disponibles.
// Los comentarios están pensados para que cualquier ingeniero, incluso sin
// experiencia en Laravel o Filament, pueda entender cómo se administra este catálogo.

namespace App\Filament\Resources;

use App\Filament\Clusters\VehiculosCatalogos;
use App\Filament\Resources\TipoVehiculoResource\Pages;
use App\Models\TipoVehiculo;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

// Esta clase representa el "recurso" de Tipos de Vehículo.
// Un recurso es una pantalla o módulo donde se pueden ver, crear y gestionar tipos de vehículo.
class TipoVehiculoResource extends Resource
{
    // Indica el modelo principal que representa un tipo de vehículo en la base de datos.
    protected static ?string $model = TipoVehiculo::class;

    // Agrupa este recurso dentro del clúster de catálogos de vehículos.
    protected static ?string $cluster = VehiculosCatalogos::class;

    // Nombre que aparece en el menú de navegación.
    protected static ?string $navigationLabel = 'Tipos de Vehículo';

    // Icono visual para identificar este recurso en el menú.
    protected static ?string $navigationIcon = 'heroicon-o-truck';

    // Nombre singular y plural para mostrar en la interfaz.
    protected static ?string $modelLabel = 'Tipo de Vehículo';

    protected static ?string $pluralModelLabel = 'Tipos de Vehículo';

    // Orden en el que aparece en el menú.
    protected static ?int $navigationSort = 11;

    // Controla quién puede ver la lista de tipos de vehículo.
    public static function canViewAny(): bool
    {
        return auth()->user()->hasAnyRole(['admin', 'ti', 'jefe', 'super_admin']);
    }

    // -------------------------------------------------------------------------
    // FORMULARIO PRINCIPAL
    // -------------------------------------------------------------------------
    // Aquí se define cómo se ve y se comporta el formulario para crear o editar
    // un tipo de vehículo. Cada campo tiene validaciones y explicaciones.
    public static function form(Form $form): Form
    {
        return $form->schema([
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
            ->defaultSort('nombre', 'asc')
            ->columns([
                Tables\Columns\TextColumn::make('nombre')
                    ->label('Nombre')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\IconColumn::make('activo')
                    ->label('Activo')
                    ->boolean(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Creado')
                    ->dateTime('d/m/Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
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

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTipoVehiculos::route('/'),
            'create' => Pages\CreateTipoVehiculo::route('/create'),
            'edit' => Pages\EditTipoVehiculo::route('/{record}/edit'),
        ];
    }
}
