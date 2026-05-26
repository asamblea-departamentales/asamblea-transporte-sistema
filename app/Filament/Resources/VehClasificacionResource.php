<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA CLASIFICACIONES DE VEHÍCULOS
// -----------------------------------------------------------------------------
// Este archivo define la lógica para gestionar las clasificaciones de vehículos
// dentro del sistema. Aquí se configuran los formularios y las tablas para
// administrar los diferentes tipos de clasificación de vehículos.
// Los comentarios están pensados para que cualquier ingeniero, incluso sin
// experiencia en Laravel o Filament, pueda entender cómo se administra este catálogo.


namespace App\Filament\Resources;

use App\Filament\Clusters\VehiculosCatalogos;
use App\Filament\Resources\VehClasificacionResource\Pages;
use App\Filament\Resources\VehClasificacionResource\RelationManagers;
use App\Models\VehClasificacion;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

// Esta clase representa el "recurso" de Clasificaciones de Vehículos.
// Un recurso es una pantalla o módulo donde se pueden ver, crear y gestionar clasificaciones.
class VehClasificacionResource extends Resource
{

    // Indica el modelo principal que representa una clasificación de vehículo en la base de datos.
    protected static ?string $model = VehClasificacion::class;
    // Agrupa este recurso dentro del clúster de catálogos de vehículos.
    protected static ?string $cluster = VehiculosCatalogos::class; 
    // Nombre que aparece en el menú de navegación.
    protected static ?string $navigationLabel = 'Clasificaciones de Vehículos';
    // Icono visual para identificar este recurso en el menú.
    protected static ?string $navigationIcon = 'heroicon-o-squares-2x2';
    // Nombre singular y plural para mostrar en la interfaz.
    protected static ?string $modelLabel = 'Clasificación';
    protected static ?string $pluralModelLabel = 'Clasificaciones';
    // Orden en el que aparece en el menú.
    protected static ?int $navigationSort = 9;


    // Controla quién puede ver la lista de clasificaciones de vehículos.
    public static function canViewAny(): bool
    {
        return auth()->user()->hasAnyRole(['admin', 'ti', 'jefe']);
    }


    // ------------------------------------------------------------------------- 
    // FORMULARIO PRINCIPAL
    // ------------------------------------------------------------------------- 
    // Aquí se define cómo se ve y se comporta el formulario para crear o editar
    // una clasificación de vehículo. Cada campo tiene validaciones y explicaciones.
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
            'index' => Pages\ListVehClasificacions::route('/'),
            'create' => Pages\CreateVehClasificacion::route('/create'),
            'edit' => Pages\EditVehClasificacion::route('/{record}/edit'),
        ];
    }
}
