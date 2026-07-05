<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA MARCAS DE VEHÍCULOS
// -----------------------------------------------------------------------------
// Administra el catálogo de marcas de vehículos (ej: "Toyota", "Nissan", "Ford").
// Permite crear, editar, buscar y eliminar marcas. También evita que se borre
// una marca si tiene modelos o vehículos asociados. Es utilizado por
// administradores, jefes y personal de TI.

namespace App\Filament\Resources;

use App\Filament\Clusters\VehiculosCatalogos;
use App\Filament\Resources\VehMarcaResource\Pages;
use App\Models\VehMarca;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class VehMarcaResource extends Resource
{
    protected static ?string $model = VehMarca::class;

    protected static ?string $cluster = VehiculosCatalogos::class;

    protected static ?string $navigationLabel = 'Marcas de Vehículos';

    protected static ?string $navigationIcon = 'heroicon-o-tag';

    protected static ?string $modelLabel = 'Marca';

    protected static ?string $pluralModelLabel = 'Marcas';

    protected static ?int $navigationSort = 1;

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
                Tables\Actions\DeleteAction::make()
                    ->button()
                    ->size('sm')
                    ->before(function ($record, Tables\Actions\DeleteAction $action) {
                        $conteoModelos = $record->modelos()->count();
                        $conteoVehiculos = $record->vehiculos()->count();

                        if ($conteoModelos > 0 || $conteoVehiculos > 0) {
                            // Enviamos la notificación
                            \Filament\Notifications\Notification::make()
                                ->title('No se puede eliminar la marca')
                                ->body("Esta marca está en uso: tiene {$conteoModelos} modelos y {$conteoVehiculos} vehículos asociados.")
                                ->danger()
                                ->send();

                            // Detenemos el proceso de borrado por completo
                            $action->halt();
                        }
                    }),
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
            'index' => Pages\ListVehMarcas::route('/'),
            'create' => Pages\CreateVehMarca::route('/create'),
            'edit' => Pages\EditVehMarca::route('/{record}/edit'),
        ];
    }
}
