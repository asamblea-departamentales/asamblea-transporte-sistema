<?php

namespace App\Filament\Resources;

use App\Filament\Clusters\VehiculosCatalogos;
use App\Filament\Resources\VehTipoCombustibleResource\Pages;
use App\Filament\Resources\VehTipoCombustibleResource\RelationManagers;
use App\Models\VehTipoCombustible;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class VehTipoCombustibleResource extends Resource
{
    protected static ?string $model = VehTipoCombustible::class;
    protected static ?string $cluster = VehiculosCatalogos::class;
    protected static ?string $navigationLabel = 'Tipos de Combustible';

    protected static ?string $navigationIcon = 'heroicon-o-beaker';
    protected static ?string $modelLabel = 'Tipo de Combustible';
    protected static ?string $pluralModelLabel = 'Tipos de Combustible';
    protected static ?int $navigationSort = 8;

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
            'index' => Pages\ListVehTipoCombustibles::route('/'),
            'create' => Pages\CreateVehTipoCombustible::route('/create'),
            'edit' => Pages\EditVehTipoCombustible::route('/{record}/edit'),
        ];
    }
}
