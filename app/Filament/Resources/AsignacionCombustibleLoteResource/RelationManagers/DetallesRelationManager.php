<?php

namespace App\Filament\Resources\AsignacionCombustibleLoteResource\RelationManagers;

use App\Domain\Solicitudes\Enums\EstadoLoteEnum;
use App\Domain\Solicitudes\Services\Lotes\LoteCombustibleService;
use App\Filament\Resources\AsignacionCombustibleLoteResource;
use App\Models\Vehiculo;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;

class DetallesRelationManager extends RelationManager
{
    protected static string $relationship = 'detalles';

    protected static ?string $title = 'Vehículos Asignados';

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('vehiculo_id')
                ->label('Vehículo')
                ->relationship('vehiculo', 'placa')
                ->searchable()
                ->required()
                ->live()
                ->disableOptionWhen(fn ($value) => $this->getOwnerRecord()
                    ->detalles()
                    ->where('vehiculo_id', $value)
                    ->exists()
                )
                ->afterStateUpdated(function ($state, callable $set) {
                    $vehiculo = Vehiculo::find($state);
                    if ($vehiculo) {
                        $set('placa_cache', $vehiculo->placa);
                    }
                }),
            Forms\Components\TextInput::make('placa_cache')
                ->label('Placa')
                ->disabled()
                ->dehydrated(true)
                ->required()
                ->maxLength(20),
            Forms\Components\TextInput::make('numero_ticket')
                ->label('N° Ticket')
                ->required()
                ->maxLength(50),
            Forms\Components\TextInput::make('monto_asignado')
                ->label('Monto ($)')
                ->numeric()
                ->required()
                ->prefix('$')
                ->minValue(0),
            Forms\Components\Select::make('solicitud_combustible_id')
                ->label('Solicitud (opcional)')
                ->relationship('solicitudCombustible', 'codigo')
                ->searchable()
                ->nullable(),
        ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('placa_cache')
            ->columns([
                Tables\Columns\TextColumn::make('vehiculo.placa')
                    ->label('Placa')
                    ->weight('bold'),
                Tables\Columns\TextColumn::make('numero_ticket')
                    ->label('Ticket')
                    ->searchable(),
                Tables\Columns\TextColumn::make('monto_asignado')
                    ->label('Monto')
                    ->money('USD', true)
                    ->sortable(),
                Tables\Columns\TextColumn::make('solicitudCombustible.codigo')
                    ->label('Solicitud')
                    ->placeholder('—'),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Agregado')
                    ->dateTime('d/m/Y H:i')
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->headerActions([
                Tables\Actions\CreateAction::make()
                    ->label('Agregar Vehículo')
                    ->icon('heroicon-o-plus')
                    ->using(function (array $data) {
                        $detalle = app(LoteCombustibleService::class)
                            ->agregarVehiculo($this->getOwnerRecord()->id, $data);
                        Notification::make()
                            ->title('Vehículo agregado')
                            ->success()
                            ->send();

                        return $detalle;
                    })
                    ->successRedirectUrl(
                        fn () => AsignacionCombustibleLoteResource::getUrl('index')
                    )
                    ->visible(fn () => $this->getOwnerRecord()->estado === EstadoLoteEnum::BORRADOR),
            ])
            ->actions([
                Tables\Actions\DeleteAction::make()
                    ->action(function ($record) {
                        try {
                            app(LoteCombustibleService::class)
                                ->eliminarVehiculo($record->id);
                            Notification::make()
                                ->title('Vehículo eliminado')
                                ->success()
                                ->send();
                        } catch (\DomainException $e) {
                            Notification::make()
                                ->title($e->getMessage())
                                ->danger()
                                ->send();
                        }
                    })
                    ->visible(fn ($record) => $record->lote->estado === EstadoLoteEnum::BORRADOR),
            ])
            ->bulkActions([]);
    }
}
