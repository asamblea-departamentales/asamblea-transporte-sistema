<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BitacoraEventoResource\Pages;
use App\Filament\Resources\BitacoraEventoResource\RelationManagers;
use App\Models\BitacoraEvento;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class BitacoraEventoResource extends Resource
{
    protected static ?string $model = BitacoraEvento::class;

    protected static ?string $navigationGroup = 'Auditoría';
    
    protected static ?string $navigationLabel = 'Bitácora de Eventos';
    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';

    protected static ?int $navigationSort = 3;

    //Restricciones de acceso a la Bitácora de Eventos
    public static function canViewAny(): bool
    {
        return auth()->user()->hasAnyRole(['jefe', 'admin']);
    }
    //restricción para crear nuevos registros en la bitácora
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

                Tables\Columns\TextColumn::make('accion')
                    ->label('Acción')
                    ->badge()
                    ->sortable(),

                Tables\Columns\TextColumn::make('entidad_tipo')
                    ->label('Entidad')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('entidad_id')
                    ->label('ID')
                    ->sortable(),

                Tables\Columns\TextColumn::make('datos_extra')
                    ->label('Extra')
                    ->limit(40)
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('accion')
                    ->options([
                        'crear' => 'crear',
                        'enviar' => 'enviar',
                        'aprobar' => 'aprobar',
                        'rechazar' => 'rechazar',
                        'cancelar' => 'cancelar',
                        'ver' => 'ver',
                    ]),
                Tables\Filters\SelectFilter::make('entidad_tipo')
                    ->options([
                        'solicitud_transporte' => 'solicitud_transporte',
                        // luego agregás otras entidades
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
            'index' => Pages\ListBitacoraEventos::route('/'),
            'view'  => Pages\ViewBitacoraEvento::route('/{record}'),
        ];
    }
}