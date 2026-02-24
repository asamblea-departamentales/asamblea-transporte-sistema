<?php

namespace App\Filament\Resources;

use App\Filament\Clusters\VehiculosCatalogos;
use App\Filament\Resources\TipoVehiculoResource\Pages;
use App\Models\TipoVehiculo;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class TipoVehiculoResource extends Resource
{
    protected static ?string $model = TipoVehiculo::class;
    protected static ?string $cluster = VehiculosCatalogos::class;
    protected static ?string $navigationLabel = 'Tipos de Vehículo';
    protected static ?string $navigationIcon = 'heroicon-o-truck';
    protected static ?string $modelLabel = 'Tipo de Vehículo';
    protected static ?string $pluralModelLabel = 'Tipos de Vehículo';
    protected static ?int $navigationSort = 11;

    public static function canViewAny(): bool
    {
        return auth()->user()->hasAnyRole(['admin', 'ti']);
    }

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
            'index'  => Pages\ListTipoVehiculos::route('/'),
            'create' => Pages\CreateTipoVehiculo::route('/create'),
            'edit'   => Pages\EditTipoVehiculo::route('/{record}/edit'),
        ];
    }
}