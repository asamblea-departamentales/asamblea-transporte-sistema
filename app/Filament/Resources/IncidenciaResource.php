<?php

namespace App\Filament\Resources;

use App\Filament\Resources\IncidenciaResource\Pages;
use App\Models\Incidencia;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class IncidenciaResource extends Resource
{
    protected static ?string $model = Incidencia::class;

    protected static ?string $navigationGroup = 'Operación';
    protected static ?string $navigationLabel = 'Incidencias';
    protected static ?string $navigationIcon = 'heroicon-o-exclamation-triangle';
    protected static ?int $navigationSort = 5;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Información de la Incidencia')
                ->schema([

                    Forms\Components\Select::make('tipo')
                        ->options([
                            'danio' => 'Daño',
                            'accidente' => 'Accidente',
                            'faltante' => 'Faltante',
                            'falla_mecanica' => 'Falla mecánica',
                            'otro' => 'Otro',
                        ])
                        ->required(),

                    Forms\Components\Select::make('severidad')
                        ->options([
                            'baja' => 'Baja',
                            'media' => 'Media',
                            'alta' => 'Alta',
                            'critica' => 'Crítica',
                        ])
                        ->required(),

                    Forms\Components\Textarea::make('descripcion')
                        ->required()
                        ->columnSpanFull(),

                    Forms\Components\Select::make('estado')
                        ->options([
                            'abierta' => 'Abierta',
                            'en_proceso' => 'En proceso',
                            'resuelta' => 'Resuelta',
                            'cerrada' => 'Cerrada',
                        ])
                        ->default('abierta'),

                ])->columns(2),

            Forms\Components\Section::make('Responsables')
                ->schema([
                    Forms\Components\Select::make('asignado_a')
                        ->relationship('asignadoA', 'name')
                        ->searchable(),
                ]),

            Forms\Components\Section::make('Resolución')
                ->schema([
                    Forms\Components\Textarea::make('resolucion')
                        ->columnSpanFull(),

                    Forms\Components\DateTimePicker::make('fecha_resolucion'),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Fecha')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),

                Tables\Columns\TextColumn::make('tipo')
                    ->badge()
                    ->color('gray'),

                Tables\Columns\TextColumn::make('severidad')
                    ->badge()
                    ->color(fn ($state) => match ($state) {
                        'baja' => 'success',
                        'media' => 'info',
                        'alta' => 'warning',
                        'critica' => 'danger',
                    }),

                Tables\Columns\TextColumn::make('estado')
                    ->badge()
                    ->color(fn ($state) => match ($state) {
                        'abierta' => 'warning',
                        'en_proceso' => 'info',
                        'resuelta' => 'success',
                        'cerrada' => 'gray',
                    }),

                Tables\Columns\TextColumn::make('descripcion')
                    ->limit(40)
                    ->tooltip(fn ($record) => $record->descripcion),

                Tables\Columns\TextColumn::make('reportadoPor.name')
                    ->label('Reportado por'),

                Tables\Columns\TextColumn::make('asignadoA.name')
                    ->label('Asignado a'),

                Tables\Columns\TextColumn::make('entidad_tipo')
                    ->label('Módulo')
                    ->formatStateUsing(fn ($state) => match ($state) {
                        'solicitud_transporte' => '🚐 Transporte',
                        'solicitud_combustible' => '⛽ Combustible',
                        'solicitud_mantenimiento' => '🔧 Mantenimiento',
                        default => $state,
                    }),

                Tables\Columns\TextColumn::make('entidad_id')
                    ->label('Ref.')
                    ->sortable(),
            ])
            ->filters([

                Tables\Filters\SelectFilter::make('estado')
                    ->options([
                        'abierta' => 'Abierta',
                        'en_proceso' => 'En proceso',
                        'resuelta' => 'Resuelta',
                        'cerrada' => 'Cerrada',
                    ]),

                Tables\Filters\SelectFilter::make('severidad')
                    ->options([
                        'baja' => 'Baja',
                        'media' => 'Media',
                        'alta' => 'Alta',
                        'critica' => 'Crítica',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListIncidencias::route('/'),
            'create' => Pages\CreateIncidencia::route('/create'),
            'edit' => Pages\EditIncidencia::route('/{record}/edit'),
            'view' => Pages\ViewIncidencia::route('/{record}'),
        ];
    }
}