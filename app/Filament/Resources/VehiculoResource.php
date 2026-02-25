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

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('placa', 'asc')
            ->recordUrl(fn (Vehiculo $record) => static::getUrl('view', ['record' => $record]))
            // Añadimos un poco de padding extra a las filas para que "respiren"
            ->contentGrid([
                'md' => 1,
                'xl' => 1,
            ])
            ->columns([
                Split::make([
                    // 1. Fotografía con borde y sombra sutil
                    Tables\Columns\ImageColumn::make('fotografia_url')
                        ->label('')
                        ->circular()
                        ->size(60)
                        ->grow(false)
                        ->extraImgAttributes(['class' => 'ring-2 ring-gray-100 shadow-sm'])
                        ->defaultImageUrl(url('/images/icons/icon-96x96.png')),

                    // 2. Información Principal (Marca, Modelo, Tipo)
                    Stack::make([
                        Tables\Columns\TextColumn::make('vehiculo_titulo')
                            ->weight('extrabold')
                            ->size(TextColumnSize::Large)
                            ->color('gray.950') // Texto principal más oscuro
                            ->getStateUsing(fn (Vehiculo $record) => 
                                "{$record->marca?->nombre} {$record->modelo?->nombre}"
                            )
                            ->searchable(['marca.nombre', 'modelo.nombre']),

                        Tables\Columns\TextColumn::make('vehiculo_sub')
                            ->color('gray.500')
                            ->size(TextColumnSize::Small)
                            ->getStateUsing(fn (Vehiculo $record) => 
                                strtoupper("{$record->tipo?->nombre} • {$record->anio}")
                            ),
                    ])->space(1)->grow(true),

                    // 3. Identificadores (Placa y Estado) - Agrupados lateralmente
                    Stack::make([
                        Split::make([
                            Tables\Columns\TextColumn::make('placa')
                                ->badge()
                                ->color('gray')
                                ->fontFamily('mono')
                                ->extraAttributes(['class' => 'ring-1 ring-gray-200']) // Efecto de placa real
                                ->copyable(),

                            Tables\Columns\TextColumn::make('estadoCatalogo.nombre')
                                ->badge()
                                ->icon(fn (?string $state): ?string => match ($state) {
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
                        ])->space(2),

                        // 4. Motorista asignado con estilo discreto abajo
                        Tables\Columns\TextColumn::make('asignacionVigenteMotorista.motorista.nombre')
                            ->icon('heroicon-m-user-circle')
                            ->size(TextColumnSize::ExtraSmall)
                            ->color('gray.400')
                            ->label('Conductor')
                            ->placeholder('Sin conductor asignado'),
                    ])->space(2)->alignEnd(),

                ])->verticalAlignment('center')->contentPadding(4),
                
                // Columnas ocultas para filtros y búsqueda técnica
                Tables\Columns\TextColumn::make('marca.nombre')->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('modelo.nombre')->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('veh_estado_catalogo_id')
                    ->label('Estado Actual')
                    ->relationship('estadoCatalogo', 'nombre')
                    ->preload(),
                Tables\Filters\TernaryFilter::make('activo')->label('Solo Activos'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make()
                    ->label('Ver Ficha')
                    ->button() // Cambiamos de iconButton a Button para que se vea más importante
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