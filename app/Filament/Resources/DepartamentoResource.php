<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA DEPARTAMENTOS GEOGRÁFICOS
// -----------------------------------------------------------------------------
// Este recurso administra el catálogo de departamentos geográficos
// (ej: San Salvador, La Libertad, Santa Ana). Cada departamento pertenece a
// un país. Sirve para clasificar ubicaciones en el sistema de transporte.
// Los usuarios autorizados pueden crear, editar y activar/desactivar departamentos.

namespace App\Filament\Resources;

use App\Filament\Resources\DepartamentoResource\Pages;
use App\Models\Departamento;
use App\Models\Pais;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class DepartamentoResource extends Resource
{
    protected static ?string $model = Departamento::class;
    protected static ?string $navigationGroup = 'Catálogos Globales';
    protected static ?string $navigationLabel = 'Departamentos';
    protected static ?string $navigationIcon  = 'heroicon-o-map';
    protected static ?int    $navigationSort  = 4;

    public static function canViewAny(): bool  { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canCreate(): bool   { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canEdit($r): bool   { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canDelete($r): bool { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'jefe']); }

    public static function form(Form $form): Form
{
    return $form->schema([
        Forms\Components\Grid::make(3) // Dividimos en 3 columnas
            ->schema([
                Forms\Components\Section::make('Ubicación Geográfica')
                    ->description('Asocie el departamento a un país registrado.')
                    ->columnSpan(2) // Ocupa 2/3
                    ->schema([
                        Forms\Components\Select::make('pais_id')
                            ->relationship('pais', 'nombre') // Más limpio que el pluck manual
                            ->searchable()
                            ->preload()
                            ->required()
                            ->prefixIcon('heroicon-m-globe-americas'),
                        Forms\Components\TextInput::make('nombre')
                            ->label('Nombre del Departamento')
                            ->required()
                            ->maxLength(100)
                            ->placeholder('Ej: San Salvador')
                            ->prefixIcon('heroicon-m-map-pin'),
                    ])->columns(2),

                Forms\Components\Section::make('Estado y Visibilidad')
                    ->columnSpan(1) // Ocupa 1/3
                    ->schema([
                        Forms\Components\Toggle::make('activo')
                            ->label('¿Está disponible?')
                            ->helperText('Si se desactiva, no podrá usarse en nuevas solicitudes.')
                            ->default(true)
                            ->onColor('success')
                            ->offColor('danger'),
                        
                        // Un Placeholder decorativo o informativo
                        Forms\Components\Placeholder::make('created_at')
                            ->label('Registro creado')
                            ->content(fn ($record): string => $record?->created_at ? $record->created_at->diffForHumans() : '-'),
                    ]),
            ]),
    ]);
}

    public static function table(Table $table): Table
{
    return $table
        ->contentGrid([ // Esto transforma la lista en "Cards"
            'md' => 2,
            'xl' => 3,
        ])
        ->defaultSort('nombre')
        ->columns([
            Tables\Columns\Layout\Stack::make([ // Apilamos la info dentro de la Card
                Tables\Columns\TextColumn::make('nombre')
                    ->label('Departamento')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->size('lg')
                    ->icon('heroicon-m-map'),

                Tables\Columns\TextColumn::make('pais.nombre')
                    ->label('País')
                    ->color('gray')
                    ->formatStateUsing(fn ($state) => "País: {$state}")
                    ->icon('heroicon-m-globe-alt'),

                Tables\Columns\Layout\Split::make([ // Línea inferior con métricas
                    Tables\Columns\TextColumn::make('municipios_count')
                        ->counts('municipios')
                        ->badge()
                        ->color('info')
                        ->formatStateUsing(fn ($state) => "{$state} Municipios"),
                    
                    Tables\Columns\IconColumn::make('activo')
                        ->boolean()
                        ->alignEnd(),
                ]),
            ])->space(3),
        ])
        ->filters([
            Tables\Filters\SelectFilter::make('pais_id')
                ->relationship('pais', 'nombre')
                ->preload(),
            Tables\Filters\TernaryFilter::make('activo')->label('Estado'),
        ])
        ->actions([
            Tables\Actions\EditAction::make()->iconButton()->color('warning'),
            Tables\Actions\DeleteAction::make()->iconButton(),
        ])
        ->actionsColumnLabel('Acciones');
}

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListDepartamentos::route('/'),
            'create' => Pages\CreateDepartamento::route('/create'),
            'edit'   => Pages\EditDepartamento::route('/{record}/edit'),
        ];
    }
}