<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA ACTIVIDADES ECONÓMICAS
// -----------------------------------------------------------------------------
// Este recurso administra el catálogo de actividades económicas (rubros).
// Sirve para clasificar a los proveedores según el tipo de negocio al que se
// dedican (ej: ventas, construcción, transporte). Los usuarios autorizados
// pueden crear, editar, activar/desactivar y eliminar actividades económicas.

namespace App\Filament\Resources;

use App\Filament\Resources\ActividadEconomicaResource\Pages;
use App\Models\ActividadEconomica;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ActividadEconomicaResource extends Resource
{
    protected static ?string $model = ActividadEconomica::class;
    protected static ?string $navigationGroup = 'Catálogos Globales';
    protected static ?string $navigationLabel = 'Actividades Económicas';
    protected static ?string $pluralModelLabel = 'Actividades Económicas';
    protected static ?string $modelLabel = 'Actividad Económica';
    protected static ?string $navigationIcon  = 'heroicon-o-briefcase';
    protected static ?int    $navigationSort  = 2;

    public static function canViewAny(): bool  { return auth()->user()->hasAnyRole(['super_admin', 'admin', 'ti', 'jefe']); }
    public static function canCreate(): bool   { return auth()->user()->hasAnyRole(['super_admin', 'admin', 'ti', 'jefe']); }
    public static function canEdit($r): bool   { return auth()->user()->hasAnyRole(['super_admin', 'admin', 'ti', 'jefe']); }
    public static function canDelete($r): bool { return auth()->user()->hasAnyRole(['super_admin', 'admin']); }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Información')
                ->icon('heroicon-o-briefcase')
                ->schema([
                    Forms\Components\TextInput::make('nombre')
                        ->label('Nombre')
                        ->required()
                        ->maxLength(100)
                        ->placeholder('Ej: VENTAS')
                        ->columnSpan(2),
                    Forms\Components\Toggle::make('activo')
                        ->label('Activo')
                        ->default(true)
                        ->columnSpan(2),
                ])->columns(2),
        ]);
    }

   public static function table(Table $table): Table
{
    return $table
        ->defaultSort('nombre')
        ->columns([
            // Usamos un Layout de Split para dividir la fila en dos grandes áreas
            Tables\Columns\Layout\Split::make([
                
                // ÁREA IZQUIERDA: Identificación (Principal)
                Tables\Columns\Layout\Stack::make([
                    Tables\Columns\TextColumn::make('nombre')
                        ->searchable()
                        ->sortable()
                        ->weight('bold')
                        ->size('lg')
                        ->color('primary')
                        ->icon('heroicon-m-briefcase'),
                    
                    Tables\Columns\TextColumn::make('proveedores_count')
                        ->formatStateUsing(fn ($state) => $state . ' proveedores vinculados a este rubro')
                        ->size('xs')
                        ->color('gray'),
                ])->space(1),

                // ÁREA DERECHA: Estado y Contador rápido (Secundario)
                Tables\Columns\Layout\Stack::make([
                    Tables\Columns\TextColumn::make('proveedores_count')
                        ->label('')
                        ->counts('proveedores')
                        ->badge()
                        ->color(fn ($state) => $state > 0 ? 'info' : 'gray')
                        ->alignEnd(),
                        
                    Tables\Columns\TextColumn::make('activo_label')
                        ->default(fn ($record) => $record->activo ? 'VIGENTE' : 'INACTIVO')
                        ->weight('black')
                        ->size('micro')
                        ->color(fn ($record) => $record->activo ? 'success' : 'danger')
                        ->alignEnd(),
                ])->space(1),
            ]),
            
            // PANEL COLAPSABLE: Para ver el interruptor de estado sin ensuciar la vista principal
            Tables\Columns\Layout\Panel::make([
                Tables\Columns\Layout\Split::make([
                    Tables\Columns\TextColumn::make('created_at')
                        ->label('Registrado el')
                        ->dateTime('d M, Y')
                        ->color('gray')
                        ->size('xs')
                        ->prefix('Fecha de creación: '),
                        
                    Tables\Columns\ToggleColumn::make('activo')
                        ->label('¿Habilitar rubro?')
                        ->alignEnd(),
                ]),
            ])->collapsible(), // Esto añade una flechita para expandir la fila
        ])
        ->filters([
            Tables\Filters\TernaryFilter::make('activo')->label('Estado'),
        ])
        ->actions([
            Tables\Actions\ActionGroup::make([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->icon('heroicon-m-ellipsis-vertical')
            ->tooltip('Opciones')
            ->color('gray')
        ]);
}
    public static function getEloquentQuery(): \Illuminate\Database\Eloquent\Builder
    {
        return parent::getEloquentQuery()->withCount('proveedores');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListActividadEconomicas::route('/'),
            'create' => Pages\CreateActividadEconomica::route('/create'),
            'edit'   => Pages\EditActividadEconomica::route('/{record}/edit'),
        ];
    }
}