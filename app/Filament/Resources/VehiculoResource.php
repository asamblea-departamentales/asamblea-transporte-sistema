<?php

namespace App\Filament\Resources;

use App\Filament\Resources\VehiculoResource\Pages;
use App\Models\Vehiculo;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Columns\Layout\Grid;
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
                'sm' => 1,
                'md' => 2,
                'xl' => 3,
                '2xl' => 4,
            ])
            ->striped(false)
            ->columns([
                Grid::make()
                    ->columns(1)
                    ->schema([
                        Stack::make([
                            // Foto con overlay hover
                            Tables\Columns\ImageColumn::make('fotografia_url')
                                ->label('')
                                ->size(140)
                                ->extraImgAttributes([
                                    'class' => 'object-cover w-full h-40 rounded-t-2xl transition-all duration-500 group-hover:scale-110 group-hover:brightness-90',
                                ])
                                ->grow(false)
                                ->defaultImageUrl(url('/images/icons/icon-96x96.png')),

                            // Contenido principal con mejor jerarquía
                            Stack::make([
                                Split::make([
                                    // Izquierda: título + subtítulo
                                    Stack::make([
                                        Tables\Columns\TextColumn::make('vehiculo_titulo')
                                            ->weight(FontWeight::Black)
                                            ->size('2xl') // Más grande y bold
                                            ->color('primary')
                                            ->extraAttributes(['class' => 'leading-tight'])
                                            ->getStateUsing(fn (Vehiculo $record) =>
                                                collect([$record->marca?->nombre, $record->modelo?->nombre])
                                                    ->filter()->join(' ')
                                            ),

                                        Tables\Columns\TextColumn::make('vehiculo_sub')
                                            ->color('gray.600 dark:gray.400')
                                            ->size(TextColumnSize::Large)
                                            ->extraAttributes(['class' => 'mt-1'])
                                            ->getStateUsing(fn (Vehiculo $record) =>
                                                collect([$record->tipo?->nombre, $record->anio])
                                                    ->filter()->join(' • ')
                                            ),
                                    ])->grow(),

                                    // Derecha: placa + estado + motorista
                                    Stack::make([
                                        Tables\Columns\TextColumn::make('placa')
                                            ->badge()
                                            ->color('primary')
                                            ->fontFamily('mono')
                                            ->weight(FontWeight::ExtraBold)
                                            ->size('2xl') // Placa más impactante
                                            ->extraAttributes([
                                                'class' => 'px-6 py-3 text-center border-2 border-primary-200 dark:border-primary-800 rounded-lg shadow-sm group-hover:shadow-lg group-hover:border-primary-400 transition-all duration-300',
                                            ])
                                            ->copyable()
                                            ->searchable()
                                            ->sortable(),

                                        Tables\Columns\TextColumn::make('estadoCatalogo.nombre')
                                            ->badge()
                                            ->size(TextColumnSize::Large)
                                            ->icon(fn (?string $state): string => match ($state) {
                                                'Disponible' => 'heroicon-o-check-circle',
                                                'Reservado'  => 'heroicon-o-clock',
                                                'Ocupado'    => 'heroicon-o-user',
                                                'En Taller'  => 'heroicon-o-wrench-screwdriver',
                                                'Baja'       => 'heroicon-o-minus-circle',
                                                default      => 'heroicon-o-information-circle',
                                            })
                                            ->color(fn (?string $state): string => match ($state) {
                                                'Disponible' => 'success',
                                                'Reservado'  => 'info',
                                                'Ocupado'    => 'warning',
                                                'En Taller'  => 'danger',
                                                'Baja'       => 'gray',
                                                default      => 'gray',
                                            })
                                            ->extraAttributes(['class' => 'mt-2']),

                                        Tables\Columns\TextColumn::make('asignacionVigenteMotorista.motorista.nombre')
                                            ->icon('heroicon-o-user')
                                            ->color('gray.600 dark:gray.400')
                                            ->size(TextColumnSize::Medium)
                                            ->placeholder('Sin conductor')
                                            ->searchable()
                                            ->visibleFrom('md'),
                                    ])->alignEnd()->space(3),
                                ])->from('lg')->grow(),

                                // Detalles extras (color + capacidad) en fila horizontal
                                Split::make([
                                    Tables\Columns\TextColumn::make('color.nombre')
                                        ->label('Color')
                                        ->badge()
                                        ->color('gray')
                                        ->icon('heroicon-o-swatch')
                                        ->size(TextColumnSize::Small),

                                    Tables\Columns\TextColumn::make('capacidad_personas')
                                        ->label('Capacidad')
                                        ->badge()
                                        ->color('info')
                                        ->icon('heroicon-o-user-group')
                                        ->formatStateUsing(fn ($state) => $state ? "$state personas" : null)
                                        ->size(TextColumnSize::Small),
                                ])->from('md')->space(4),

                            ])->space(4)->extraAttributes(['class' => 'p-6 pt-4']),

                            // Footer sutil
                            Tables\Columns\TextColumn::make('ver_ficha_hint')
                                ->state('Ver ficha completa →')
                                ->color('primary')
                                ->size(TextColumnSize::Small)
                                ->extraAttributes(['class' => 'text-right italic opacity-50 group-hover:opacity-100 transition-opacity duration-300 pr-6 pb-4'])
                                ->visibleFrom('md'),
                        ])
                        // Card completa - diseño premium
                        ->extraAttributes([
                            'class' => 'group relative bg-white dark:bg-gray-850 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-400 ease-out cursor-pointer',
                        ]),
                    ]),

                // Todas las columnas toggleable intactas (no toqué nada aquí)
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