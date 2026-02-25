<?php

namespace App\Filament\Resources;

use App\Filament\Resources\VehiculoResource\Pages;
use App\Models\Vehiculo;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

//Estilos
use Filament\Tables\Columns\Layout\Split;
use Filament\Tables\Columns\Layout\Stack;
use Filament\Tables\Columns\TextColumn\TextColumnSize;
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
            // ✅ Columna premium: imagen + nombre + subtítulo
            Split::make([
    Tables\Columns\ImageColumn::make('fotografia_url')
        ->label('')
        ->circular()
        ->size(45)
        ->defaultImageUrl(url('/images/vehiculo-default.png')),

    Stack::make([
        Tables\Columns\TextColumn::make('vehiculo_titulo')
            ->label('Vehículo')
            ->weight('bold')
            ->getStateUsing(fn (Vehiculo $record) =>
                trim(($record->marca?->nombre ?? '') . ' ' . ($record->modelo?->nombre ?? ''))
            )
            ->searchable(),

        Tables\Columns\TextColumn::make('vehiculo_subtitulo')
            ->label('')
            ->color('gray')
            ->size(TextColumnSize::Small)
            ->getStateUsing(fn (Vehiculo $record) =>
                trim(($record->tipo?->nombre ?? 'Vehículo') . ' • ' . ($record->anio ?? ''))
            ),
    ])->space(1),
])->from('md'),

            // ✅ Placa como chip mono + copy (se ve pro)
            Tables\Columns\TextColumn::make('placa')
                ->label('Placa')
                ->badge()
                ->color('gray')
                ->fontFamily('mono')
                ->weight('bold')
                ->copyable()
                ->searchable()
                ->sortable(),

            Tables\Columns\TextColumn::make('estadoCatalogo.nombre')
                ->label('Estado')
                ->badge()
                ->icon(fn (?string $state): ?string => match ($state) {
                    'Disponible' => 'heroicon-o-check-circle',
                    'Ocupado'    => 'heroicon-o-user',
                    'En Taller'  => 'heroicon-o-wrench-screwdriver',
                    'Baja'       => 'heroicon-o-minus-circle',
                    default      => 'heroicon-o-information-circle',
                })
                ->color(fn (?string $state): string => match ($state) {
                    'Disponible' => 'success',
                    'Ocupado'    => 'warning',
                    'En Taller'  => 'danger',
                    'Baja'       => 'gray',
                    default      => 'gray',
                }),

            // Mantengo tus columnas (solo ordenadas/igual que antes)
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

            Tables\Columns\TextColumn::make('asignacionVigenteMotorista.motorista.nombre')
                ->label('Motorista Asignado')
                ->placeholder('Sin motorista')
                ->searchable()
                ->wrap(),

            Tables\Columns\IconColumn::make('activo')
                ->label('Activo')
                ->boolean()
                ->sortable(),
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