<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA PAÍSES
// -----------------------------------------------------------------------------
// Administra los países registrados en el sistema, como El Salvador,
// Guatemala, etc. Permite ver, crear, editar y eliminar países,
// además de indicar su nacionalidad o gentilicio. Es usado por
// los encargados de mantener los datos geográficos de la aplicación.

namespace App\Filament\Resources;

use App\Filament\Resources\PaisResource\Pages;
use App\Models\Pais;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PaisResource extends Resource
{
    protected static ?string $model = Pais::class;

    protected static ?string $navigationGroup = 'Catálogos Globales';

    protected static ?string $navigationLabel = 'Países';

    protected static ?string $pluralModelLabel = 'Países';

    protected static ?string $modelLabel = 'País';

    protected static ?string $navigationIcon = 'heroicon-o-globe-alt';

    protected static ?int $navigationSort = 6;

    public static function canViewAny(): bool
    {
        return auth()->user()->hasAnyRole(['super_admin', 'admin', 'jefe', 'ti']);
    }

    public static function canCreate(): bool
    {
        return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe', 'super_admin']);
    }

    public static function canEdit($r): bool
    {
        return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe', 'super_admin']);
    }

    public static function canDelete($r): bool
    {
        return auth()->user()->hasAnyRole(['superadmin', 'admin', 'jefe', 'super_admin']);
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Información del País')
                    ->schema([
                        Forms\Components\TextInput::make('nombre')
                            ->label(label: 'Nombre del País')
                            ->required()
                            ->maxLength(100)
                            ->columnSpan(2),
                        Forms\Components\TextInput::make('nacionalidad')
                            ->label(label: 'Nacionalidad / Gentilicio')
                            ->required()
                            ->maxLength(100)
                            ->columnSpan(2),
                        Forms\Components\Toggle::make('activo')
                            ->label(label: 'Activo')
                            ->default(true)
                            ->columnSpan(2),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort(column: 'nombre')
            ->columns([
                Tables\Columns\TextColumn::make('nombre')
                    ->label(label: 'País')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),
                Tables\Columns\TextColumn::make('nacionalidad')
                    ->label(label: 'Nacionalidad')
                    ->searchable()
                    ->placeholder('-'),
                Tables\Columns\TextColumn::make('departamentos_count')
                    ->label(label: 'Departamentos')
                    ->counts('departamentos')
                    ->badge()
                    ->color('info'),

                Tables\Columns\IconColumn::make('activo')
                    ->label(label: 'Activo')
                    ->boolean(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('activo')
                    ->label(label: 'Estado')
                    ->trueLabel('Activo')
                    ->falseLabel('Inactivo'),
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->button()
                    ->size('sm'),

                Tables\Actions\DeleteAction::make()
                    ->button()
                    ->size('sm'),
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
            'index' => Pages\ListPais::route('/'),
            'create' => Pages\CreatePais::route('/create'),
            'edit' => Pages\EditPais::route('/{record}/edit'),
        ];
    }
}
