<?php

namespace App\Filament\Resources;

use App\Filament\Resources\HistorialEstadoResource\Pages;
use App\Filament\Resources\HistorialEstadoResource\RelationManagers;
use App\Models\HistorialEstado;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class HistorialEstadoResource extends Resource
{
    protected static ?string $model = HistorialEstado::class;

    protected static ?string $navigationGroup = 'Auditoría';

    protected static ?string $navigationLabel = 'Historial de Estados'; 

    protected static ?string $navigationIcon = 'heroicon-o-clock';

    protected static ?int $navigationSort = 4;


    //Restricciones de acceso al Historial de Estados
    public static function canViewAny(): bool
    {
        return auth()->user()->hasAnyRole(['jefe', 'admin']);
    }
    //restricción para crear nuevos registros en el historial
    public static function canCreate(): bool
    {
        return false;
    }
    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                //Como solo es para ver, no necesitamos formulario
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
            'view'  => Pages\ViewHistorialEstado::route('/{record}'),
        ];
    }
}
