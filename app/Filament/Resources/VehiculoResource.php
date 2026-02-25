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
            ->columns([
                // ── FILA PRINCIPAL (siempre visible) ──────────────────
                Split::make([
                    // ✅ Imagen usando accessor (URL lista). No disk().
                    Tables\Columns\ImageColumn::make('fotografia_url')
                        ->label('')
                        ->circular()
                        ->size(52)
                        ->grow(false)
                        ->defaultImageUrl(url('/images/icons/icon-96x96.png')),

                    // ✅ Texto + chips (placa/estado) + motorista abajo
                    Stack::make([
                        Tables\Columns\TextColumn::make('vehiculo_titulo')
                            ->label('')
                            ->weight('bold')
                            ->size(TextColumnSize::Large)
                            ->getStateUsing(fn (Vehiculo $record) =>
                                collect([
                                    $record->marca?->nombre,
                                    $record->modelo?->nombre,
                                ])->filter()->join(' ')
                            )
                            ->searchable(),

                        Tables\Columns\TextColumn::make('vehiculo_sub')
                            ->label('')
                            ->color('gray')
                            ->size(TextColumnSize::Small)
                            ->getStateUsing(fn (Vehiculo $record) =>
                                collect([
                                    $record->tipo?->nombre,
                                    $record->anio,
                                ])->filter()->join(' • ')
                            ),

                        // Chips: placa + estado (más limpio que meterlos como columnas separadas)
                        Split::make([
                            Tables\Columns\TextColumn::make('placa')
                                ->label('')
                                ->badge()
                                ->color('gray')
                                ->fontFamily('mono')
                                ->weight('bold')
                                ->copyable()
                                ->searchable()
                                ->sortable()
                                ->grow(false),

                            Tables\Columns\TextColumn::make('estadoCatalogo.nombre')
                                ->label('')
                                ->badge()
                                ->grow(false)
                                ->icon(fn (?string $state): ?string => match ($state) {
                                    'Disponible' => 'heroicon-o-check-circle',
                                    'Reservado'  => 'heroicon-o-clock',
                                    'Ocupado'    => 'heroicon-o-user',
                                    'En Taller'  => 'heroicon-o-wrench-screwdriver',
                                    'Baja'       => 'heroicon-o-minus-circle',
                                    default      => 'heroicon-o-information-circle',
                                })
                                ->color(fn (?string $state): string => match ($state) {
                                    'Disponible' => 'success',
                                    'Reservado'  => 'primary',
                                    'Ocupado'    => 'warning',
                                    'En Taller'  => 'danger',
                                    'Baja'       => 'gray',
                                    default      => 'gray',
                                }),
                        ])->from('sm')->columnSpanFull(),

                        Tables\Columns\TextColumn::make('asignacionVigenteMotorista.motorista.nombre')
                            ->label('')
                            ->placeholder('Sin motorista asignado')
                            ->icon('heroicon-o-user')
                            ->size(TextColumnSize::Small)
                            ->color('gray')
                            ->searchable(),
                    ])->space(2),
                ])->from('md'),

                // ── COLUMNAS OPCIONALES (toggleable) ──────────────────
                Tables\Columns\TextColumn::make('tipo.nombre')
                    ->label('Tipo')
                    ->badge()
                    ->color('info')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('marca.nombre')
                    ->label('Marca')
                    ->searchable()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('modelo.nombre')
                    ->label('Modelo')
                    ->searchable()
                    ->sortable()
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
                    ->badge()
                    ->color('warning')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('clasificacion.nombre')
                    ->label('Clasificación')
                    ->badge()
                    ->color('gray')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\IconColumn::make('activo')
                    ->label('Activo')
                    ->boolean()
                    ->sortable()
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
                Tables\Actions\ViewAction::make()->iconButton(),
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