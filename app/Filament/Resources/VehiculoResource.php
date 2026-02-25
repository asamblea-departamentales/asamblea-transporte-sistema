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
                            Split::make([
                                // Foto a la izquierda
                                Tables\Columns\ImageColumn::make('fotografia')
                                    ->label('')
                                    ->disk('public')
                                    ->size(110)
                                    ->extraImgAttributes([
                                        'class' => 'object-cover rounded-xl shadow-md ring-1 ring-gray-200 dark:ring-gray-700 group-hover:scale-105 transition-transform duration-300',
                                    ])
                                    ->grow(false)
                                    ->defaultImageUrl(url('/images/icons/icon-96x96.png')),

                                // Contenido principal
                                Stack::make([
                                    Tables\Columns\TextColumn::make('vehiculo_titulo')
                                        ->weight(FontWeight::ExtraBold)
                                        ->size('xl') // strings como 'xl' funcionan en v3
                                        ->color('primary')
                                        ->getStateUsing(fn (Vehiculo $record) =>
                                            collect([$record->marca?->nombre, $record->modelo?->nombre])
                                                ->filter()->join(' ')
                                        ),

                                    Tables\Columns\TextColumn::make('vehiculo_sub')
                                        ->color('gray.600 dark:gray.300')
                                        ->size(TextColumnSize::Medium)
                                        ->getStateUsing(fn (Vehiculo $record) =>
                                            collect([$record->tipo?->nombre, $record->anio])
                                                ->filter()->join(' • ')
                                        ),

                                    Split::make([
                                        Tables\Columns\TextColumn::make('color.nombre')
                                            ->label('Color')
                                            ->badge()
                                            ->color('gray')
                                            ->icon('heroicon-m-color-swatch') // ← cambiado a m-
                                            ->size(TextColumnSize::Small),

                                        Tables\Columns\TextColumn::make('capacidad_personas')
                                            ->label('Capacidad')
                                            ->badge()
                                            ->color('blue')
                                            ->icon('heroicon-m-user-group') // ← cambiado a m-
                                            ->formatStateUsing(fn ($state) => $state ? "$state personas" : null)
                                            ->size(TextColumnSize::Small),
                                    ])->from('sm'),

                                ])->grow(),

                                // Derecha
                                Stack::make([
                                    Tables\Columns\TextColumn::make('placa')
                                        ->badge()
                                        ->color('primary')
                                        ->fontFamily('mono')
                                        ->weight(FontWeight::ExtraBold)
                                        ->size('xl')
                                        ->extraAttributes(['class' => 'px-6 py-3 text-center'])
                                        ->copyable()
                                        ->searchable()
                                        ->sortable(),

                                    Tables\Columns\TextColumn::make('estadoCatalogo.nombre')
                                        ->badge()
                                        ->icon(fn (?string $state): string => match ($state) {
                                            'Disponible' => 'heroicon-m-check-circle', // ← m-
                                            'Reservado' => 'heroicon-m-clock', // ← m-
                                            'Ocupado' => 'heroicon-m-x-circle', // ← m- (x-circle en lugar de minus)
                                            'En Taller' => 'heroicon-m-wrench-screwdriver', // ← m-
                                            default => 'heroicon-m-information-circle', // ← m-
                                        })
                                        ->color(fn (?string $state): string => match ($state) {
                                            'Disponible' => 'success',
                                            'Reservado' => 'info',
                                            'Ocupado' => 'warning',
                                            'En Taller' => 'danger',
                                            default => 'gray',
                                        })
                                        ->size(TextColumnSize::Medium),

                                    Tables\Columns\TextColumn::make('asignacionVigenteMotorista.motorista.nombre')
                                        ->icon('heroicon-m-user-circle') // ← cambiado a m-
                                        ->color('gray.700 dark:gray.300')
                                        ->size(TextColumnSize::Small)
                                        ->placeholder('Sin conductor')
                                        ->searchable()
                                        ->visibleFrom('md'),
                                ])->alignEnd(),
                            ])->from('md'),
                        ])
                        // Card styling
                        ->extraAttributes([
                            'class' => 'group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden cursor-pointer p-6',
                        ]),
                    ]),

                // Columnas toggleable (todas intactas)
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
            'view' => Pages\ViewVehiculo::route('/{record}'),
        ];
    }
}