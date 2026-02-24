<?php

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

class VehClasificacionResource extends Resource
{
    protected static ?string $model = VehClasificacion::class;
    protected static ?string $cluster = VehiculosCatalogos::class; 
    protected static ?string $navigationLabel = 'Clasificaciones de Vehículos';
    protected static ?string $navigationIcon = 'heroicon-o-squares-2x2';
    protected static ?string $modelLabel = 'Clasificación';
    protected static ?string $pluralModelLabel = 'Clasificaciones';
    protected static ?int $navigationSort = 9;

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
            'index' => Pages\ListVehClasificacions::route('/'),
            'create' => Pages\CreateVehClasificacion::route('/create'),
            'edit' => Pages\EditVehClasificacion::route('/{record}/edit'),
        ];
    }
}
