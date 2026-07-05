<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA HISTORIAL DE ESTADOS
// -----------------------------------------------------------------------------
// Este recurso muestra el historial de cambios de estado de las solicitudes.
// Por ejemplo, cuándo una solicitud pasó de "pendiente" a "aprobada" y quién
// lo hizo. Solo los jefes y administradores pueden ver esta información.
// No se pueden crear ni editar registros aquí; solo se consultan.

namespace App\Filament\Resources;

use App\Filament\Resources\HistorialEstadoResource\Pages;
use App\Models\HistorialEstado;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class HistorialEstadoResource extends Resource
{
    protected static ?string $model = HistorialEstado::class;

    protected static ?string $navigationGroup = 'Auditoría';

    protected static ?string $navigationLabel = 'Historial de Estados';

    protected static ?string $navigationIcon = 'heroicon-o-clock';

    protected static ?int $navigationSort = 4;

    // Restricciones de acceso al Historial de Estados
    public static function canViewAny(): bool
    {
        return auth()->user()->hasAnyRole(['jefe', 'admin', 'super_admin', 'super-admin', 'superadmin']);
    }

    // restricción para crear nuevos registros en el historial
    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('entidad_tipo')->disabled(),
            Forms\Components\TextInput::make('entidad_id')->disabled(),
            Forms\Components\TextInput::make('estado_anterior')->disabled(),
            Forms\Components\TextInput::make('estado_nuevo')->disabled(),
            Forms\Components\Textarea::make('comentario')->disabled(),
            Forms\Components\DateTimePicker::make('created_at')->disabled(),
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

                Tables\Columns\TextColumn::make('usuario.name')
                    ->label('Usuario')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('entidad_tipo')
                    ->label('Entidad')
                    ->sortable(),

                Tables\Columns\TextColumn::make('entidad_id')
                    ->label('ID')
                    ->sortable(),

                Tables\Columns\TextColumn::make('estado_anterior')
                    ->label('Antes')
                    ->badge(),

                Tables\Columns\TextColumn::make('estado_nuevo')
                    ->label('Después')
                    ->badge(),

                Tables\Columns\TextColumn::make('comentario')
                    ->label('Comentario')
                    ->limit(50)
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('entidad_tipo')
                    ->options([
                        'solicitud_transporte' => 'solicitud_transporte',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListHistorialEstados::route('/'),
            'view' => Pages\ViewHistorialEstado::route('/{record}'),
        ];
    }
}
