<?php

namespace App\Filament\Resources;

use App\Filament\Resources\VehiculoResource\Pages;
use App\Models\Vehiculo;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

//Para la fotografia
use Filament\Infolists\Components\ImageEntry;

class VehiculoResource extends Resource
{
    protected static ?string $model = Vehiculo::class;

    protected static ?string $navigationGroup = 'Catálogos';    protected static ?string $navigationLabel = 'Vehículos';
    protected static ?string $navigationIcon = 'heroicon-o-truck';
    protected static ?int $navigationSort = 1;

    public static function canViewAny(): bool
    {
        return auth()->user()->hasAnyRole(['admin', 'ti', 'jefe']);
    }

    public static function canCreate(): bool { return false; }
    public static function canEdit($record): bool { return false; }
    public static function canDelete($record): bool { return false; }

    public static function form(Form $form): Form
    {
        return $form->schema([]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('placa', 'asc')
            ->contentGrid([
                'default' => 1,
                'md'      => 2,
                'xl'      => 3,
            ])
            ->recordUrl(fn (Vehiculo $record) => static::getUrl('view', ['record' => $record]))
            ->columns([
                Tables\Columns\TextColumn::make('placa')
                    ->label('Placa')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->copyable(),

                Tables\Columns\TextColumn::make('tipo.nombre')
                    ->label('Tipo')
                    ->badge()
                    ->color('info')
                    ->sortable(),

                Tables\Columns\TextColumn::make('marca.nombre')
                    ->label('Marca')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('modelo.nombre')
                    ->label('Modelo')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('anio')
                    ->label('Año')
                    ->sortable(),

                Tables\Columns\TextColumn::make('color.nombre')
                    ->label('Color')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('capacidad_personas')
                    ->label('Capacidad')
                    ->suffix(' personas')
                    ->sortable(),

                Tables\Columns\TextColumn::make('tipoCombustible.nombre')
                    ->label('Combustible')
                    ->badge()
                    ->color('warning')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('clasificacion.nombre')
                    ->label('Clasificación')
                    ->badge()
                    ->color('gray')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('asignacionVigenteMotorista.motorista.nombre')
                    ->label('Motorista Asignado')
                    ->placeholder('Sin motorista')
                    ->searchable()
                    ->wrap(),

                Tables\Columns\IconColumn::make('activo')
                    ->label('Activo')
                    ->boolean()
                    ->sortable(),

                Tables\Columns\TextColumn::make('estadoCatalogo.nombre')
                    ->label('Estado')
                    ->badge()
                    ->color(fn (?string $state): string => match ($state) {
                        'Disponible' => 'success',
                        'Ocupado'    => 'warning',
                        'En Taller'  => 'danger',
                        'Baja'       => 'gray',
                        default      => 'gray',
                    }),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('tipo_vehiculo_id')
                    ->label('Tipo')
                    ->relationship('tipo', 'nombre'),

                Tables\Filters\SelectFilter::make('veh_marca_id')
                    ->label('Marca')
                    ->relationship('marca', 'nombre'),

                Tables\Filters\SelectFilter::make('veh_estado_catalogo_id')
                    ->label('Estado')
                    ->relationship('estadoCatalogo', 'nombre'),

                Tables\Filters\TernaryFilter::make('activo')
                    ->label('Activo'),
            ])
            ->bulkActions([]);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->with([
                'tipo',
                'marca',
                'modelo',
                'color',
                'tipoCombustible',
                'clasificacion',
                'estadoCatalogo',
                'asignacionVigenteMotorista.motorista',
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListVehiculos::route('/'),
            'view'  => Pages\ViewVehiculo::route('/{record}'),
        ];
    }
}