<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA LIQUIDACIÓN DE COMBUSTIBLE
// -----------------------------------------------------------------------------
// Este recurso permite al liquidador revisar y cerrar las solicitudes de
// combustible que ya fueron completadas. Aquí se valida si el monto gastado
// coincide con los comprobantes presentados, y se genera el resultado de la
// liquidación (coincide o tiene discrepancia). También se puede descargar
// un reporte en PDF de cada liquidación.

// app/Filament/Resources/LiquidacionCombustibleResource.php

namespace App\Filament\Resources;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Services\SolicitudCombustibleService;
use App\Filament\Resources\LiquidacionCombustibleResource\Pages;
use App\Models\SolicitudCombustible;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class LiquidacionCombustibleResource extends Resource
{
    protected static ?string $model = SolicitudCombustible::class;

    protected static bool $shouldRegisterNavigation = false;

    protected static ?string $navigationGroup = 'Liquidación';
    protected static ?string $navigationLabel = 'Panel de Liquidación';
    protected static ?string $navigationIcon = 'heroicon-o-check-badge';

    public static function canViewAny(): bool
    {
        return auth()->user()?->hasAnyRole(['liquidador', 'jefe', 'operativo']);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->whereIn('estado', [
                EstadoSolicitudEnum::COMPLETADA,
                EstadoSolicitudEnum::LIQUIDADA,
            ])
            ->with(['vehiculo', 'solicitante', 'liquidacion']);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([

                Tables\Columns\TextColumn::make('codigo')
                    ->label('Solicitud')
                    ->weight('bold'),

                Tables\Columns\TextColumn::make('vehiculo.placa')
                    ->label('Vehículo'),

                Tables\Columns\TextColumn::make('valor_total')
                    ->label('Monto')
                    ->money('USD'),

                Tables\Columns\IconColumn::make('comprobantes')
                    ->label('Comp.')
                    ->getStateUsing(fn ($record) => !empty($record->comprobantes))
                    ->boolean(),

                Tables\Columns\TextColumn::make('liquidacion.resultado')
                    ->label('Resultado')
                    ->badge()
                    ->color(fn ($state) => match ($state) {
                        'coincide' => 'success',
                        'discrepancia' => 'danger',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('estado')->badge(),
            ])
            ->actions([

                Tables\Actions\ViewAction::make(),

                Tables\Actions\Action::make('liquidar')
                    ->label('Liquidar')
                    ->color('success')
                    ->form([
                        Forms\Components\TextInput::make('monto_validado')->required(),
                        Forms\Components\Select::make('resultado')->options([
                            'coincide' => 'Coincide',
                            'discrepancia' => 'Discrepancia',
                        ])->required(),
                        Forms\Components\Textarea::make('observaciones'),
                    ])
                    ->action(function ($record, $data) {
                        app(SolicitudCombustibleService::class)
                            ->liquidar($record, auth()->id(), $data);
                    })
                    ->visible(fn ($record) =>
                        !$record->liquidacion &&
                        !empty($record->comprobantes)
                    ),

                Tables\Actions\Action::make('pdf')
                    ->label('PDF')
                    ->url(fn ($record) => route('liquidacion.pdf', $record))
                    ->openUrlInNewTab(),

            ]);
    }

    public static function form(\Filament\Forms\Form $form): \Filament\Forms\Form
    {
        return $form->schema([

            Forms\Components\Section::make('Resumen')
                ->schema([
                    Forms\Components\Placeholder::make('codigo')
                        ->content(fn ($record) => $record->codigo),

                    Forms\Components\Placeholder::make('monto')
                        ->content(fn ($record) => '$' . number_format($record->valor_total, 2)),
                ]),

            Forms\Components\Section::make('Resultado')
                ->schema([
                    Forms\Components\Placeholder::make('resultado')
                        ->content(fn ($record) => $record->liquidacion?->resultado ?? 'Pendiente'),

                    Forms\Components\Placeholder::make('observaciones')
                        ->content(fn ($record) => $record->liquidacion?->observaciones ?? '-'),
                ]),
        ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListLiquidacionCombustibles::route('/'),
            'view'  => Pages\ViewLiquidacionCombustible::route('/{record}'),
        ];
    }
}