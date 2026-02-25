<?php

namespace App\Filament\Resources;

use App\Filament\Resources\VehiculoResource\Pages;
use App\Models\Vehiculo;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Columns\Layout\Split;
use Filament\Tables\Columns\Layout\Stack;
use Filament\Tables\Columns\TextColumn\TextColumnSize;
use Illuminate\Database\Eloquent\Builder;

class VehiculoResource extends Resource
{
    protected static ?string $model = Vehiculo::class;
    protected static ?string $navigationGroup = 'Flota';
    protected static ?string $navigationLabel = 'Vehículos';
    protected static ?string $navigationIcon  = 'heroicon-o-truck';
    protected static ?int    $navigationSort  = 1;

    public static function canViewAny(): bool
    {
        return auth()->user()->hasAnyRole(['admin', 'ti', 'jefe']);
    }

    public static function canCreate(): bool        { return false; }
    public static function canEdit($record): bool   { return false; }
    public static function canDelete($record): bool { return false; }

    public static function form(Form $form): Form
    {
        return $form->schema([]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('placa', 'asc')
            ->recordUrl(fn (Vehiculo $record) => static::getUrl('view', ['record' => $record]))
            ->columns([
                Split::make([
                    // Foto circular
                    Tables\Columns\ImageColumn::make('fotografia')
                        ->label('')
                        ->disk('public')
                        ->circular()
                        ->size(60)
                        ->grow(false)
                        ->defaultImageUrl(url('/images/icons/icon-96x96.png')),

                    // Marca + Modelo + Tipo + Año
                    Stack::make([
                        Tables\Columns\TextColumn::make('vehiculo_titulo')
                            ->weight('bold')
                            ->size(TextColumnSize::Medium)
                            ->getStateUsing(fn (Vehiculo $record) =>
                                collect([$record->marca?->nombre, $record->modelo?->nombre])
                                    ->filter()->join(' ')
                            ),

                        Tables\Columns\TextColumn::make('vehiculo_sub')
                            ->color('gray')
                            ->size(TextColumnSize::Small)
                            ->getStateUsing(fn (Vehiculo $record) =>
                                collect([$record->tipo?->nombre, $record->anio])
                                    ->filter()->join(' • ')
                            ),
                    ])->space(1)->grow(true),

                    // Placa + Estado
                    Stack::make([
                        Tables\Columns\TextColumn::make('placa')
                            ->badge()
                            ->color('gray')
                            ->fontFamily('mono')
                            ->weight('bold')
                            ->copyable()
                            ->searchable()
                            ->sortable(),

                        Tables\Columns\TextColumn::make('estadoCatalogo.nombre')
                            ->badge()
                            ->icon(fn (?string $state): string => match ($state) {
                                'Disponible' => 'heroicon-m-check-circle',
                                'Reservado'  => 'heroicon-m-clock',
                                'Ocupado'    => 'heroicon-m-minus-circle',
                                'En Taller'  => 'heroicon-m-wrench-screwdriver',
                                default      => 'heroicon-m-information-circle',
                            })
                            ->color(fn (?string $state): string => match ($state) {
                                'Disponible' => 'success',
                                'Reservado'  => 'info',
                                'Ocupado'    => 'warning',
                                'En Taller'  => 'danger',
                                default      => 'gray',
                            }),
                    ])->space(2)->grow(false)->alignEnd(),

                    // Motorista
                    Stack::make([
                        Tables\Columns\TextColumn::make('asignacionVigenteMotorista.motorista.nombre')
                            ->icon('heroicon-m-user-circle')
                            ->size(TextColumnSize::Small)
                            ->color('gray')
                            ->placeholder('Sin conductor')
                            ->searchable(),
                    ])->grow(false)->alignEnd(),
                ]),

                // Columnas ocultas toggleable
                Tables\Columns\TextColumn::make('tipo.nombre')
                    ->label('Tipo')
                    ->badge()->color('info')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('marca.nombre')
                    ->label('Marca')
                    ->searchable()->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('modelo.nombre')
                    ->label('Modelo')
                    ->searchable()->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('anio')
                    ->label('Año')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('color.nombre')
                    ->label('Color')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('capacidad_personas')
                    ->label('Capacidad')
                    ->suffix(' personas')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('tipoCombustible.nombre')
                    ->label('Combustible')
                    ->badge()->color('warning')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('clasificacion.nombre')
                    ->label('Clasificación')
                    ->badge()->color('gray')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\IconColumn::make('activo')
                    ->label('Activo')
                    ->boolean()->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
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
            ->actions([
                Tables\Actions\ViewAction::make()
                    ->label('Ver Ficha')
                    ->button()
                    ->size('sm')
                    ->color('gray')
                    ->icon('heroicon-m-eye'),
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