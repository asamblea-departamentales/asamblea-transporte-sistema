<?php
// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA SERIES DE CARGA
// -----------------------------------------------------------------------------
// Administra las series o lotes de cargas de combustible. Cada serie
// tiene un valor, fechas de emisión y vencimiento, y un rango de
// correlativos (numeración). Puede estar asociada a un contrato
// de combustible. Permite ver, crear, editar y eliminar series,
// y llevar control del stock disponible de cargas.

namespace App\Filament\Resources;

use App\Filament\Resources\SerieCargaResource\Pages;
use App\Models\SerieCarga;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SerieCargaResource extends Resource
{
    protected static ?string $model = SerieCarga::class;

    protected static ?string $navigationGroup = 'Catálogos Globales';

    protected static ?string $navigationLabel = 'Serie de Cargas';

    protected static ?string $navigationIcon = 'heroicon-o-ticket';

    protected static ?int $navigationSort = 10;

    public static function canViewAny(): bool
    {
        return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']);
    }

    public static function canCreate(): bool
    {
        return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']);
    }

    public static function canEdit($r): bool
    {
        return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']);
    }

    public static function canDelete($r): bool
    {
        return auth()->user()->hasAnyRole(['superadmin', 'admin', 'jefe']);
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Información de la Serie')->schema([
                Forms\Components\Select::make('contrato_id')
                    ->label('Contrato')
                    ->options(
                        \App\Models\ContratoCombustible::where('activo', true)
                            ->get()
                            ->mapWithKeys(fn ($c) => [
                                $c->id => "{$c->numero_contrato} — {$c->nombre}",
                            ])
                    )
                    ->searchable()
                    ->nullable()
                    ->placeholder('Sin contrato asociado')
                    ->columnSpan(2),

                Forms\Components\TextInput::make('nombre')
                    ->label('Nombre')->required()->maxLength(100)->columnSpan(2),
                Forms\Components\TextInput::make('valor')
                    ->label('Valor de la Carga ($)')->numeric()->required()->prefix('$'),
                Forms\Components\TextInput::make('valor_compra')
                    ->label('Valor de Compra ($)')->numeric()->prefix('$'),
                Forms\Components\DatePicker::make('fecha_emision')
                    ->label('Fecha Emisión')->required(),
                Forms\Components\DatePicker::make('fecha_vencimiento')
                    ->label('Fecha Vencimiento')->required(),
                Forms\Components\DatePicker::make('fecha_recibido')
                    ->label('Fecha Recibido')->required(),
                Forms\Components\Toggle::make('activo')
                    ->label('Activo')->default(true),
            ])->columns(2),

            Forms\Components\Section::make('Correlativos')->schema([
                Forms\Components\TextInput::make('correlativo_inicio')
                    ->label('Correlativo Inicio')->numeric()->required(),
                Forms\Components\TextInput::make('correlativo_fin')
                    ->label('Correlativo Fin')->numeric()->required(),
                Forms\Components\TextInput::make('cantidad')
                    ->label('Cantidad de Cargas')->numeric()->required(),
                Forms\Components\Textarea::make('observaciones')
                    ->label('Observaciones')->columnSpan(3),
            ])->columns(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('fecha_emision', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('nombre')
                    ->label('Serie de Cargas')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->description(fn ($record) => "Rango: {$record->correlativo_inicio} - {$record->correlativo_fin}"),

                Tables\Columns\TextColumn::make('contrato.numero_contrato')
                    ->label('Contrato')
                    ->searchable()
                    ->placeholder('Sin contrato')
                    ->badge()
                    ->color('primary')
                    ->description(fn ($record) => $record->contrato?->nombre),

                Tables\Columns\TextColumn::make('valor')
                    ->label('Valor Unit.')
                    ->money('USD')
                    ->sortable()
                    ->alignCenter()
                    ->badge()
                    ->color('success'),

                Tables\Columns\TextColumn::make('cantidad')
                    ->label('Stock')
                    ->numeric()
                    ->sortable()
                    ->alignCenter()
                    ->suffix(' cargas'),

                Tables\Columns\TextColumn::make('fecha_vencimiento')
                    ->label('Vencimiento')
                    ->date('d/m/Y')
                    ->sortable()
                    ->badge()
                    ->color(fn ($record) => $record->fecha_vencimiento < now() ? 'danger' : ($record->fecha_vencimiento < now()->addMonth() ? 'warning' : 'success'))
                    ->icon(fn ($record) => $record->fecha_vencimiento < now() ? 'heroicon-m-clock' : 'heroicon-m-check-circle'),

                Tables\Columns\ToggleColumn::make('activo')
                    ->label('Circulando'),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('activo')->label('Estado'),
                Tables\Filters\Filter::make('vencidos')
                    ->label('Solo Vencidos')
                    ->query(fn ($query) => $query->where('fecha_vencimiento', '<', now())),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\EditAction::make(),
                    Tables\Actions\DeleteAction::make(),
                ])->button()->label('Gestionar')->color('gray'),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSerieCargas::route('/'),
            'create' => Pages\CreateSerieCarga::route('/create'),
            'edit' => Pages\EditSerieCarga::route('/{record}/edit'),
        ];
    }
}
