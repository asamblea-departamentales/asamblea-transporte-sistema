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
use Filament\Support\Enums\FontWeight;
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
        return auth()->check() && auth()->user()->hasAnyRole(['admin', 'ti', 'jefe']);
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
            ->contentGrid([
                'sm'  => 1,
                'md'  => 2,
                'xl'  => 3,
                '2xl' => 4,
            ])
            ->columns([
                Stack::make([
                    // Foto de portada centrada tipo gallery
                    Tables\Columns\ImageColumn::make('fotografia')
                        ->label('')
                        ->disk('public')
                        ->height(160)
                        ->width(200)
                        ->extraImgAttributes([
                            'class' => 'object-contain mx-auto rounded-t-2xl',
                        ])
                        ->extraAttributes([
                            'class' => 'flex justify-center items-center w-full bg-gray-50 dark:bg-gray-900',
                        ])
                        ->grow(false)
                        ->defaultImageUrl(url('/images/icons/icon-96x96.png')),

                    // Contenido de la tarjeta debajo de la foto
                    Stack::make([

                        // Marca + Modelo
                        Tables\Columns\TextColumn::make('vehiculo_titulo')
                            ->weight(FontWeight::Bold)
                            ->size(TextColumnSize::Large)
                            ->getStateUsing(fn (Vehiculo $record) =>
                                collect([$record->marca?->nombre, $record->modelo?->nombre])
                                    ->filter()->join(' ')
                            ),

                        // Tipo + Año
                        Tables\Columns\TextColumn::make('vehiculo_sub')
                            ->color('gray')
                            ->size(TextColumnSize::Small)
                            ->getStateUsing(fn (Vehiculo $record) =>
                                collect([$record->tipo?->nombre, $record->anio])
                                    ->filter()->join(' • ')
                            ),

                        // Placa + Estado
                        Split::make([
                            Tables\Columns\TextColumn::make('placa')
                                ->badge()
                                ->color('gray')
                                ->fontFamily('mono')
                                ->weight(FontWeight::Bold)
                                ->copyable()
                                ->searchable()
                                ->sortable()
                                ->grow(false),

                            Tables\Columns\TextColumn::make('estadoCatalogo.nombre')
                                ->badge()
                                ->grow(false)
                                ->icon(fn (?string $state): string => match ($state) {
                                    'Disponible' => 'heroicon-o-check-circle',
                                    'Reservado'  => 'heroicon-o-clock',
                                    'En Taller'  => 'heroicon-o-wrench-screwdriver',
                                    'Baja'       => 'heroicon-o-minus-circle',
                                    default      => 'heroicon-o-information-circle',
                                })
                                ->color(fn (?string $state): string => match ($state) {
                                    'Disponible' => 'success',
                                    'Reservado'  => 'info',
                                    'En Taller'  => 'danger',
                                    'Baja'       => 'gray',
                                    default      => 'gray',
                                }),
                        ]),

                        // Color + Capacidad
                        Split::make([
                            Tables\Columns\TextColumn::make('color.nombre')
                                ->badge()
                                ->color('gray')
                                ->icon('heroicon-o-paint-brush')
                                ->size(TextColumnSize::Small)
                                ->grow(false),

                            Tables\Columns\TextColumn::make('capacidad_personas')
                                ->badge()
                                ->color('info')
                                ->icon('heroicon-o-users')
                                ->formatStateUsing(fn ($state) => $state ? "{$state} personas" : null)
                                ->size(TextColumnSize::Small)
                                ->grow(false),
                        ]),

                        // Motorista
                        Tables\Columns\TextColumn::make('asignacionVigenteMotorista.motorista.nombre')
                            ->icon('heroicon-o-user')
                            ->color('gray')
                            ->size(TextColumnSize::Small)
                            ->placeholder('Sin conductor')
                            ->searchable(),

                    ])->space(2)->extraAttributes(['class' => 'p-4 space-y-2']),

                ])->extraAttributes([
                    'class' => 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 
                                dark:border-gray-700 shadow hover:shadow-lg 
                                hover:-translate-y-1 transition-all duration-300 
                                cursor-pointer overflow-hidden h-full flex flex-col',
                ]),

                // ── Columnas ocultas para búsqueda/filtros ──
                Tables\Columns\TextColumn::make('tipo.nombre')
                    ->label('Tipo')->badge()->color('info')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('marca.nombre')
                    ->label('Marca')->searchable()->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('modelo.nombre')
                    ->label('Modelo')->searchable()->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('anio')
                    ->label('Año')->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('color.nombre')
                    ->label('Color')->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('capacidad_personas')
                    ->label('Capacidad')->suffix(' personas')->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('tipoCombustible.nombre')
                    ->label('Combustible')->badge()->color('warning')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('clasificacion.nombre')
                    ->label('Clasificación')->badge()->color('gray')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\IconColumn::make('activo')
                    ->label('Activo')->boolean()->sortable()
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
                    ->icon('heroicon-o-eye'),
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
