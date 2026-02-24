<?php

namespace App\Filament\Resources;

use App\Filament\Resources\VehModeloResource\Pages;
use App\Filament\Resources\VehModeloResource\RelationManagers;
use App\Models\VehModelo;
use Filament\Clusters\Cluster;
use Filament\Forms;
use App\Filament\Clusters\VehiculosCatalogos;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class VehModeloResource extends Resource
{
    protected static ?string $model = VehModelo::class;
    protected static ?string $cluster = VehiculosCatalogos::class;
    protected static ?string $navigationLabel = 'Modelos de Vehículos';
    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
    protected static ?string $modelLabel = 'Modelo';
    protected static ?string $pluralModelLabel = 'Modelos';
    protected static ?int $navigationSort = 2;

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

                Forms\Components\Select::make('marca_id')
                    ->label('Marca')
                    ->options(function () {
                        return \App\Models\VehMarca::where('activo', true)->pluck('nombre', 'id');
                    })
                    ->searchable()
                    ->required(),

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

                Tables\Columns\TextColumn::make('marca.nombre')
                    ->label('Marca')
                    ->badge()
                    ->color('info')
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
            'index' => Pages\ListVehModelos::route('/'),
            'create' => Pages\CreateVehModelo::route('/create'),
            'edit' => Pages\EditVehModelo::route('/{record}/edit'),
        ];
    }
}
