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
use Filament\Support\Enums\TextColumnSize;
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
                'md' => 2,
                'xl' => 3,
            ]) // ← Esto hace que se vea como cards en pantallas medianas/grandes
            ->columns([
                // Usamos un Grid de 1 columna para que cada "fila" sea una card completa
                Grid::make()
                    ->columns(1)
                    ->schema([

                        // Card principal con borde, padding, shadow sutil y hover
                        \Filament\Tables\Columns\Layout\Panel::make() // o simplemente usa un Stack con extra styling si prefieres
                            ->extraAttributes([
                                'class' => 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden',
                            ])
                            ->schema([

                                Split::make([
                                    // Foto a la izquierda (más grande y con ring sutil)
                                    Tables\Columns\ImageColumn::make('fotografia')
                                        ->label('')
                                        ->disk('public')
                                        ->circular()
                                        ->size(80)                      // un poco más grande para destacar
                                        ->grow(false)
                                        ->extraImgAttributes(['class' => 'ring-2 ring-gray-200 dark:ring-gray-600'])
                                        ->defaultImageUrl(url('/images/icons/icon-96x96.png')),

                                    // Contenido principal
                                    Stack::make([

                                        // Título (Marca + Modelo)
                                        Tables\Columns\TextColumn::make('vehiculo_titulo')
                                            ->weight(FontWeight::Bold)
                                            ->size(TextColumnSize::Medium)
                                            ->getStateUsing(fn (Vehiculo $record) =>
                                                collect([$record->marca?->nombre, $record->modelo?->nombre])
                                                    ->filter()->join(' ')
                                            ),

                                        // Subtítulo (Tipo • Año)
                                        Tables\Columns\TextColumn::make('vehiculo_sub')
                                            ->color('gray')
                                            ->size(TextColumnSize::Small)
                                            ->getStateUsing(fn (Vehiculo $record) =>
                                                collect([$record->tipo?->nombre, $record->anio])
                                                    ->filter()->join(' • ')
                                            ),

                                        // Info extra en gris claro
                                        Tables\Columns\TextColumn::make('color.nombre')
                                            ->label('Color')
                                            ->formatStateUsing(fn ($state) => $state ? "Color: $state" : null)
                                            ->color('gray')
                                            ->size(TextColumnSize::ExtraSmall)
                                            ->visibleFrom('md'),

                                    ])->space(1),

                                    // Columna derecha (alineada a la derecha)
                                    Stack::make([

                                        // Placa como badge grande
                                        Tables\Columns\TextColumn::make('placa')
                                            ->badge()
                                            ->color('gray')
                                            ->fontFamily('mono')
                                            ->weight(FontWeight::Bold)
                                            ->size(TextColumnSize::Medium)
                                            ->copyable()
                                            ->searchable()
                                            ->sortable(),

                                        // Estado con icono y color
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
                                            })
                                            ->size(TextColumnSize::Small),

                                        // Motorista (si existe)
                                        Tables\Columns\TextColumn::make('asignacionVigenteMotorista.motorista.nombre')
                                            ->icon('heroicon-m-user-circle')
                                            ->color('gray')
                                            ->size(TextColumnSize::Small)
                                            ->placeholder('Sin conductor asignado')
                                            ->searchable()
                                            ->visibleFrom('md'),

                                    ])->space(2)->alignEnd(),

                                ])->space(4),

                            ]),

                    ]),
                // Columnas ocultas (para filtros y búsqueda)
                Tables\Columns\TextColumn::make('tipo.nombre')->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('marca.nombre')->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('modelo.nombre')->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('anio')->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('color.nombre')->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('capacidad_personas')->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('tipoCombustible.nombre')->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('clasificacion.nombre')->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\IconColumn::make('activo')->boolean()->toggleable(isToggledHiddenByDefault: true),
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