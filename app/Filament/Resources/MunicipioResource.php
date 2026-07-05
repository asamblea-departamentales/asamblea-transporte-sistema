<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA MUNICIPIOS
// -----------------------------------------------------------------------------
// Administra los municipios (ciudades o pueblos) del sistema.
// Permite ver, crear, editar y eliminar municipios, y asociarlos
// al departamento y país correspondiente. Lo usan los encargados
// de mantener actualizados los datos geográficos del sistema de transporte.

namespace App\Filament\Resources;

use App\Filament\Resources\MunicipioResource\Pages;
use App\Models\Departamento;
use App\Models\Municipio;
use App\Models\Pais;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class MunicipioResource extends Resource
{
    protected static ?string $model = Municipio::class;

    protected static ?string $navigationGroup = 'Catálogos Globales';

    protected static ?string $navigationLabel = 'Municipios';

    protected static ?string $navigationIcon = 'heroicon-o-map-pin';

    protected static ?int $navigationSort = 5;

    public static function canViewAny(): bool
    {
        return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe', 'super_admin']);
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
        return $form->schema([
            Forms\Components\Section::make('Información del Municipio')->schema([
                Forms\Components\Select::make('pais_id')
                    ->label('País')
                    ->options(Pais::where('activo', true)->pluck('nombre', 'id'))
                    ->live()
                    ->afterStateUpdated(fn ($set) => $set('departamento_id', null))
                    ->dehydrated(false)
                    ->required(),
                Forms\Components\Select::make('departamento_id')
                    ->label('Departamento')
                    ->options(fn ($get) => Departamento::where('pais_id', $get('pais_id'))
                        ->where('activo', true)
                        ->pluck('nombre', 'id')
                    )
                    ->searchable()
                    ->required()
                    ->live(),
                Forms\Components\TextInput::make('nombre')
                    ->label('Nombre')->required()->maxLength(100)->columnSpan(2),
                Forms\Components\Toggle::make('activo')
                    ->label('Activo')->default(true)->columnSpan(2),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('nombre')
            ->groups([
                Tables\Grouping\Group::make('departamento.nombre')
                    ->label('Departamento')
                    ->collapsible(),
            ])
            ->columns([
                Tables\Columns\TextColumn::make('nombre')
                    ->label('Municipio')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->description(fn (Municipio $record): string => "País: {$record->departamento?->pais?->nombre}"),

                Tables\Columns\TextColumn::make('departamento.nombre')
                    ->label('Ubicación')
                    ->badge()
                    ->color('info')
                    ->icon('heroicon-m-map')
                    ->sortable(),

                Tables\Columns\IconColumn::make('activo')
                    ->label('Estado')
                    ->boolean()
                    ->toggleable(), // Permite ocultar la columna si el usuario quiere

                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Última edición')
                    ->dateTime('d/m/Y H:i')
                    ->color('gray')
                    ->size('xs')
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('pais_id')
                    ->label('Filtrar por País')
                    ->relationship('departamento.pais', 'nombre')
                    ->searchable()
                    ->preload(),
                Tables\Filters\SelectFilter::make('departamento_id')
                    ->label('Filtrar por Departamento')
                    ->relationship('departamento', 'nombre')
                    ->searchable()
                    ->preload(),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([ // Agrupa las acciones en un menú desplegable
                    Tables\Actions\EditAction::make(),
                    Tables\Actions\DeleteAction::make(),
                ])->icon('heroicon-m-ellipsis-vertical')
                    ->color('gray')
                    ->button()
                    ->label('Opciones'),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListMunicipios::route('/'),
            'create' => Pages\CreateMunicipio::route('/create'),
            'edit' => Pages\EditMunicipio::route('/{record}/edit'),
        ];
    }
}
