<?php

namespace App\Filament\Resources\AsignacionCombustibleLoteResource\RelationManagers;

use App\Domain\Solicitudes\Enums\EstadoLoteEnum;
use App\Domain\Solicitudes\Services\Lotes\LoteCombustibleService;
use App\Filament\Resources\AsignacionCombustibleLoteResource;
use App\Models\ContratoCombustible;
use App\Models\SerieCarga;
use App\Models\VehTipoCombustible;
use App\Models\Vehiculo;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Columns\SelectColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\TextInputColumn;
use Filament\Tables\Table;

class DetallesRelationManager extends RelationManager
{
    protected static string $relationship = 'detalles';

    protected static ?string $title = 'Vehículos Asignados';

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers de rol
    // ─────────────────────────────────────────────────────────────────────────

    private function esJefe(): bool
    {
        return auth()->check() && auth()->user()->hasAnyRole(['jefe', 'admin', 'super_admin']);
    }

    private function esOperativo(): bool
    {
        return auth()->check() && auth()->user()->hasAnyRole(['operativo', 'admin', 'super_admin']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Form — modal "Agregar vehículo manual" (solo BORRADOR, solo jefe)
    // ─────────────────────────────────────────────────────────────────────────

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

    // ─────────────────────────────────────────────────────────────────────────
    // Auto-marcar como asignado cuando el operativo completa todos los campos
    // ─────────────────────────────────────────────────────────────────────────

    private function marcarAsignadoSiCompleto($record): void
    {
        $record->refresh();

        if ($record->estaCompleto() && $record->estado_asignacion !== 'asignado') {
            $record->update([
                'estado_asignacion' => 'asignado',
                'asignado_por'      => auth()->id(),
                'fecha_asignacion'  => now(),
            ]);
            app(\App\Domain\Solicitudes\Services\AuditoriaService::class)
            ->registrar(
                accion: \App\Domain\Solicitudes\Enums\AccionBitacoraEnum::ACTUALIZACION,
                modelo: 'AsignacionCombustibleLoteDetalle',
                datos: [
                    'detalle_id' => $record->id,
                    'placa' => $record->placa_cache,
                    'galones' => $record->cantidad_galones,
                    'tipo_combustible_id' => $record->tipo_combustible_id,
                ]
    );

            Notification::make()
                ->title('Carga registrada')
                ->body("Placa {$record->placa_cache} marcada como asignada.")
                ->success()
                ->send();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Table
    // ─────────────────────────────────────────────────────────────────────────

    public function table(Table $table): Table
    {
        $lote           = $this->getOwnerRecord();
        $esBorrador     = $lote->estado === EstadoLoteEnum::BORRADOR;
        $esEnProceso    = $lote->estado === EstadoLoteEnum::EN_PROCESO;

        // Jefe edita monto solo en BORRADOR
        $jefeEdita      = $this->esJefe() && $esBorrador;

        // Operativo edita campos de carga solo en EN_PROCESO
        $operativoEdita = $this->esOperativo() && $esEnProceso;

        return $table
            ->recordTitleAttribute('placa_cache')
            ->columns([

                // ── Columnas siempre visibles ─────────────────────────────────

                TextColumn::make('placa_cache')
                    ->label('Placa')
                    ->weight('bold')
                    ->searchable(),

                TextColumn::make('numero_ticket')
                    ->label('Ticket')
                    ->searchable(),

                TextColumn::make('solicitudCombustible.codigo')
                    ->label('Solicitud')
                    ->placeholder('—'),

                // ── Monto: inline editable por jefe en BORRADOR ──────────────
                // Spread de array para alternar entre TextInputColumn y TextColumn

                ...($jefeEdita ? [
                    TextInputColumn::make('monto_asignado')
                        ->label('Monto ($)')
                        ->type('number')
                        ->rules(['numeric', 'min:0'])
                        ->extraAttributes(['style' => 'min-width:110px'])
                        ->afterStateUpdated(function () {
                            Notification::make()
                                ->title('Monto actualizado')
                                ->success()
                                ->send();
                        }),
                ] : [
                    TextColumn::make('monto_asignado')
                        ->label('Monto ($)')
                        ->money('USD', true)
                        ->sortable()
                        ->summarize(
                    Tables\Columns\Summarizers\Sum::make()
                        ->money('USD', true)
                ),
                ]),

                // ── Campos operativos: inline editables por operativo en EN_PROCESO ──

                ...($operativoEdita ? [
                    SelectColumn::make('numero_serie')
                        ->label('N° Serie')
                        ->options(
                            fn () => SerieCarga::where('activo', true)
                                ->orderBy('nombre')
                                ->pluck('nombre', 'nombre')
                        )
                        ->afterStateUpdated(fn ($record) => $this->marcarAsignadoSiCompleto($record)),

                    SelectColumn::make('numero_contrato')
                        ->label('N° Contrato')
                        ->options(
                            fn () => ContratoCombustible::where('activo', true)
                                ->orderBy('numero_contrato')
                                ->pluck('numero_contrato', 'numero_contrato')
                        )
                        ->afterStateUpdated(fn ($record) => $this->marcarAsignadoSiCompleto($record)),

                    SelectColumn::make('tipo_combustible_id')
                        ->label('Tipo Combustible')
                        ->options(
                            fn () => VehTipoCombustible::where('activo', true)
                                ->orderBy('nombre')
                                ->pluck('nombre', 'id')
                        )
                        ->afterStateUpdated(fn ($record) => $this->marcarAsignadoSiCompleto($record)),

                    TextInputColumn::make('cantidad_galones')
                        ->label('Galones')
                        ->type('number')
                        ->rules(['numeric', 'min:0'])
                        ->extraAttributes(['style' => 'min-width:90px'])
                        ->afterStateUpdated(fn ($record) => $this->marcarAsignadoSiCompleto($record)),

                    TextInputColumn::make('observaciones_operativas')
                        ->label('Observaciones')
                        ->extraAttributes(['style' => 'min-width:200px']),

                ] : [
                    TextColumn::make('numero_serie')
                        ->label('N° Serie')
                        ->placeholder('—'),

                    TextColumn::make('numero_contrato')
                        ->label('N° Contrato')
                        ->placeholder('—'),

                    TextColumn::make('tipoCombustible.nombre')
                        ->label('Tipo Combustible')
                        ->placeholder('—'),

                    TextColumn::make('cantidad_galones')
                        ->label('Galones')
                        ->numeric(2)
                        ->placeholder('—')
                        ->summarize(
                        Tables\Columns\Summarizers\Sum::make()
                    ),
                    
                     TextColumn::make('observaciones_operativas')
                        ->label('Observaciones')
                        ->placeholder('—')
                        ->limit(40),   
                ]),

                // ── Estado asignación ─────────────────────────────────────────

                TextColumn::make('estado_asignacion')
                    ->label('Estado')
                    ->badge()
                    ->color(fn ($state) => match ($state) {
                        'pendiente' => 'warning',
                        'asignado'  => 'success',
                        default     => 'gray',
                    })
                    ->formatStateUsing(fn ($state) => ucfirst($state ?? 'pendiente')),

                // ── Trazabilidad (toggleable) ─────────────────────────────────

                TextColumn::make('asignadoPor.name')
                    ->label('Asignado por')
                    ->placeholder('—')
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('fecha_asignacion')
                    ->label('Fecha asignación')
                    ->dateTime('d/m/Y H:i')
                    ->placeholder('—')
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('created_at')
                    ->label('Agregado')
                    ->dateTime('d/m/Y H:i')
                    ->toggleable(isToggledHiddenByDefault: true),
                    
            ])

            // ── Header actions ────────────────────────────────────────────────
            ->headerActions([

                // Importar solicitudes del día — solo jefe en BORRADOR
                Tables\Actions\Action::make('importarSolicitudes')
                    ->label('Importar solicitudes del día')
                    ->icon('heroicon-o-arrow-down-tray')
                    ->color('info')
                    ->requiresConfirmation()
                    ->modalHeading('Importar solicitudes aprobadas')
                    ->modalDescription(
                        'Se importarán todas las solicitudes de combustible aprobadas '.
                        'para la fecha de este lote que aún no estén en el listado.'
                    )
                    ->action(function () {
                        try {
                            $result = app(LoteCombustibleService::class)
                                ->importarSolicitudes($this->getOwnerRecord()->id, auth()->id());

                            if ($result['imported'] === 0) {
                                Notification::make()
                                    ->title('Sin solicitudes nuevas')
                                    ->body('No hay solicitudes aprobadas pendientes de importar para esta fecha.')
                                    ->warning()
                                    ->send();
                            } else {
                                $body = "Se importaron {$result['imported']} solicitud(es).";
                                if ($result['skipped'] > 0) {
                                    $body .= " {$result['skipped']} omitida(s) por vehículo duplicado.";
                                }
                                Notification::make()
                                    ->title('Importación completada')
                                    ->body($body)
                                    ->success()
                                    ->send();
                            }
                        } catch (\DomainException $e) {
                            Notification::make()
                                ->title('Error al importar')
                                ->body($e->getMessage())
                                ->danger()
                                ->send();
                        }
                    })
                    ->visible(
                        fn () => $this->esJefe()
                            && $this->getOwnerRecord()->estado === EstadoLoteEnum::BORRADOR
                    ),

                // Agregar vehículo manual — solo jefe en BORRADOR
                Tables\Actions\CreateAction::make()
                    ->label('Agregar vehículo')
                    ->icon('heroicon-o-plus')
                    ->using(function (array $data) {
                        try {
                            $detalle = app(LoteCombustibleService::class)
                                ->agregarVehiculo($this->getOwnerRecord()->id, $data);

                            Notification::make()
                                ->title('Vehículo agregado')
                                ->success()
                                ->send();

                            return $detalle;
                        } catch (\DomainException $e) {
                            Notification::make()
                                ->title($e->getMessage())
                                ->danger()
                                ->send();
                        }
                    })
                    ->visible(
                        fn () => $this->esJefe()
                            && $this->getOwnerRecord()->estado === EstadoLoteEnum::BORRADOR
                    ),
            ])

            // ── Row actions ───────────────────────────────────────────────────
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
                    ->visible(
                        fn ($record) => $this->esJefe()
                            && $record->lote->estado === EstadoLoteEnum::BORRADOR
                    ),
            ])
            ->bulkActions([]);
    }
}