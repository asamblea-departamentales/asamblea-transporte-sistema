<?php

namespace App\Filament\Resources;

use App\Filament\Resources\GrupoResource\Pages;
use App\Models\Grupo;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class GrupoResource extends Resource
{
    protected static ?string $model = Grupo::class;

    protected static ?string $navigationGroup = 'Administración';

    protected static ?string $navigationLabel = 'Grupos';

    protected static ?string $modelLabel = 'Grupo';

    protected static ?string $pluralModelLabel = 'Grupos';

    protected static ?string $navigationIcon = 'heroicon-o-users';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Información del Grupo')
                    ->schema([
                        Forms\Components\TextInput::make('nombre')
                            ->label('Nombre')
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(100),

                        Forms\Components\Textarea::make('descripcion')
                            ->label('Descripción')
                            ->rows(3),

                        Forms\Components\Select::make('nivel_prioridad')
                            ->label('Nivel de Prioridad')
                            ->options([
                                'critica' => 'Crítica',
                                'alta'    => 'Alta',
                                'media'   => 'Media',
                                'baja'    => 'Baja',
                            ])
                            ->required(),

                        Forms\Components\TextInput::make('orden')
                            ->label('Orden de Operación')
                            ->numeric()
                            ->required(),

                        Forms\Components\Toggle::make('activo')
                            ->label('Activo')
                            ->default(true),
                    ]),
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

                Tables\Columns\TextColumn::make('nivel_prioridad')
                    ->label('Prioridad')
                    ->badge()
                    ->color(fn ($state) => match($state) {
                        'critica' => 'danger',
                        'alta'    => 'warning',
                        'media'   => 'info',
                        'baja'    => 'gray',
                    })
                    ->formatStateUsing(fn ($state) => ucfirst($state)),

                Tables\Columns\TextColumn::make('orden')
                    ->label('Orden')
                    ->sortable(),

                Tables\Columns\TextColumn::make('usuarios_count')
                    ->counts('usuarios')
                    ->label('Usuarios'),

                Tables\Columns\IconColumn::make('activo')
                    ->label('Activo')
                    ->boolean(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('activo')
                    ->label('Activo'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('orden');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListGrupos::route('/'),
            'create' => Pages\CreateGrupo::route('/create'),
            'edit'   => Pages\EditGrupo::route('/{record}/edit'),
        ];
    }

}