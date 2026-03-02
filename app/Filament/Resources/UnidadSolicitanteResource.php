<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UnidadSolicitanteResource\Pages;
use App\Models\UnidadSolicitante;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class UnidadSolicitanteResource extends Resource
{
    protected static ?string $model = UnidadSolicitante::class;
    protected static ?string $navigationGroup = 'Catálogos Globales';
    protected static ?string $navigationLabel = 'Unidades Solicitantes';
    protected static ?string $pluralModelLabel = 'Unidades Solicitantes';
    protected static ?string $modelLabel = 'Unidad Solicitante';
    protected static ?string $navigationIcon  = 'heroicon-o-building-office-2';
    protected static ?int    $navigationSort  = 12;

    public static function canViewAny(): bool  { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canCreate(): bool   { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canEdit($r): bool   { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canDelete($r): bool { return auth()->user()->hasAnyRole(['superadmin', 'admin']); }

    public static function form(Form $form): Form
{
    return $form->schema([
        Forms\Components\Grid::make(3)->schema([
            // Panel Principal
            Forms\Components\Section::make('Detalles de la Unidad')
                ->description('Identifique la unidad administrativa y sus siglas oficiales.')
                ->icon('heroicon-o-building-office-2')
                ->columnSpan(2)
                ->schema([
                    Forms\Components\Grid::make(2)->schema([
                        Forms\Components\TextInput::make('codigo')
                            ->label('Código Interno')
                            ->required()
                            ->maxLength(20)
                            ->placeholder('010307')
                            ->prefixIcon('heroicon-m-hashtag')
                            ->extraInputAttributes(['class' => 'font-mono']),
                        Forms\Components\TextInput::make('siglas')
                            ->label('Siglas de la Unidad')
                            ->maxLength(20)
                            ->placeholder('DPTO. TRANS.')
                            ->prefixIcon('heroicon-m-variable'),
                    ]),
                    Forms\Components\TextInput::make('nombre')
                        ->label('Nombre Completo')
                        ->required()
                        ->maxLength(300)
                        ->columnSpanFull(),
                    Forms\Components\Textarea::make('descripcion')
                        ->label('Notas o Descripción')
                        ->rows(3)
                        ->columnSpanFull(),
                ]),

            // Panel Lateral de Control
            Forms\Components\Group::make()->columnSpan(1)->schema([
                Forms\Components\Section::make('Estado y Permisos')
                    ->description('Controles de acceso')
                    ->schema([
                        Forms\Components\Toggle::make('estado')
                            ->label('Unidad Activa')
                            ->default(true)
                            ->onColor('success')
                            ->onIcon('heroicon-m-check')
                            ->inline(false),
                        
    Forms\Components\Section::make('Estado y Permisos')
    ->description('Controles de acceso')
    ->schema([
        // Estado Global
        Forms\Components\Toggle::make('estado')
            ->label('Unidad Activa')
            ->default(true)
            ->onColor('success')
            ->onIcon('heroicon-m-check')
            ->inline(false),

        // En lugar de Divider, usamos un Section anidado o un simple espacio
        Forms\Components\Fieldset::make('Capacidades de Solicitud')
            ->schema([
                // Permiso: Transporte
                Forms\Components\Toggle::make('puede_solicitar_transporte')
                    ->label('Transporte')
                    ->onColor('success')
                    ->onIcon('heroicon-m-truck')
                    ->inline(false),

                // Permiso: Mantenimiento
                Forms\Components\Toggle::make('puede_solicitar_mantenimiento')
                    ->label('Mantenimiento')
                    ->onColor('warning')
                    ->onIcon('heroicon-m-wrench-screwdriver')
                    ->inline(false),

                // Permiso: Combustible
                Forms\Components\Toggle::make('puede_solicitar_combustible')
                    ->label('Combustible')
                    ->onColor('danger')
                    ->onIcon('heroicon-m-fire')
                    ->inline(false),
            ])->columns(1), // Los pone uno bajo el otro dentro del recuadro
    ]),

                    ]),
                
                Forms\Components\Section::make('Métricas')
                    ->schema([
                        Forms\Components\Placeholder::make('solicitudes_count')
                            ->label('Total Solicitudes')
                            ->content(fn ($record) => $record?->solicitudes_count ?? 0),
                    ])->hidden(fn ($record) => $record === null),
            ]),
        ]),
    ]);
}

 public static function table(Table $table): Table
{
    return $table
        ->defaultSort('nombre')
        ->columns([
            // COLUMNA 1: Identidad
            Tables\Columns\Layout\Stack::make([
                Tables\Columns\TextColumn::make('nombre')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->size('lg')
                    ->color('primary')
                    ->description(fn ($record) => $record->siglas ? "({$record->siglas})" : null),
                
                Tables\Columns\TextColumn::make('codigo')
                    ->fontFamily('mono')
                    ->color('gray')
                    ->size('xs')
                    ->prefix('CÓDIGO: '),
            ])->space(1),

            // COLUMNA 2: Actividad
            Tables\Columns\TextColumn::make('solicitudes_count')
                ->label('Actividad')
                ->counts('solicitudes')
                ->badge()
                ->color(fn ($state) => $state > 0 ? 'info' : 'gray')
                ->icon('heroicon-m-document-text')
                ->description(fn ($record) => \Illuminate\Support\Str::limit($record->descripcion, 40) ?? 'Sin descripción'),

            // COLUMNA 3: Matriz de Permisos (NUEVA)
            // Aquí mostramos los 3 iconos para saber qué puede pedir cada unidad
            Tables\Columns\Layout\Split::make([
                Tables\Columns\IconColumn::make('puede_solicitar_transporte')
                    ->label('T')
                    ->boolean()
                    ->trueIcon('heroicon-s-truck')
                    ->falseIcon('heroicon-s-minus-circle')
                    ->trueColor('success')
                    ->tooltip('Transporte'),
                Tables\Columns\IconColumn::make('puede_solicitar_mantenimiento')
                    ->label('M')
                    ->boolean()
                    ->trueIcon('heroicon-s-wrench-screwdriver')
                    ->falseIcon('heroicon-s-minus-circle')
                    ->trueColor('warning')
                    ->tooltip('Mantenimiento'),
                Tables\Columns\IconColumn::make('puede_solicitar_combustible')
                    ->label('C')
                    ->boolean()
                    ->trueIcon('heroicon-s-fire')
                    ->falseIcon('heroicon-s-minus-circle')
                    ->trueColor('danger')
                    ->tooltip('Combustible'),
            ])->extraAttributes(['class' => 'justify-center']),

            // COLUMNA 4: Estado Rápido
            Tables\Columns\ToggleColumn::make('estado')
                ->label('Activo')
                ->alignEnd(),
        ])
        ->filters([
            Tables\Filters\TernaryFilter::make('estado')->label('Unidades Activas'),
            Tables\Filters\TernaryFilter::make('puede_solicitar_transporte')->label('Transporte'),
            Tables\Filters\TernaryFilter::make('puede_solicitar_mantenimiento')->label('Mantenimiento'),
            Tables\Filters\TernaryFilter::make('puede_solicitar_combustible')->label('Combustible'),
        ])
        ->actions([
            Tables\Actions\ActionGroup::make([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make()
                    ->before(function ($record, $action) {
                        if ($record->solicitudes_count > 0) {
                            $action->cancel();
                            \Filament\Notifications\Notification::make()
                                ->title('No se puede eliminar')
                                ->body('Esta unidad tiene solicitudes registradas.')
                                ->danger()
                                ->send();
                        }
                    }),
            ])
            ->button()
            ->label('Opciones')
            ->color('gray')
        ])
        ->bulkActions([]);
}
    public static function getEloquentQuery(): \Illuminate\Database\Eloquent\Builder
    {
        return parent::getEloquentQuery()->withCount('solicitudes');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListUnidadSolicitantes::route('/'),
            'create' => Pages\CreateUnidadSolicitante::route('/create'),
            'edit'   => Pages\EditUnidadSolicitante::route('/{record}/edit'),
        ];
    }
}