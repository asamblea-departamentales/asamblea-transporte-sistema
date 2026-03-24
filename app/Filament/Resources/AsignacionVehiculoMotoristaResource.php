<?php

namespace App\Filament\Resources;

use App\Domain\Solicitudes\Services\AsignacionVehiculoMotoristaService;
use App\Filament\Resources\AsignacionVehiculoMotoristaResource\Pages;
use App\Models\AsignacionVehiculoMotorista;
use App\Models\Vehiculo;
use App\Models\Motorista;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Actions\Action;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class AsignacionVehiculoMotoristaResource extends Resource
{
    protected static ?string $model = AsignacionVehiculoMotorista::class;
    protected static ?string $navigationIcon     = 'heroicon-o-link';
    protected static ?string $navigationLabel    = 'Asignaciones';
    protected static ?string $modelLabel         = 'Asignación';
    protected static ?string $pluralModelLabel   = 'Asignaciones Vehículo → Motorista';
    protected static ?string $navigationGroup    = 'Flota';
    protected static ?int    $navigationSort     = 3;

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('desde', 'desc')
            ->columns([
                TextColumn::make('vehiculo.placa')
                    ->label('Placa')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),

                TextColumn::make('vehiculo.tipo.nombre')
                    ->label('Tipo vehículo'),

                TextColumn::make('motorista.nombre')
                    ->label('Motorista')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('vigente')
                    ->label('Estado')
                    ->badge()
                    ->formatStateUsing(fn (bool $state): string => $state ? 'Vigente' : 'Histórico')
                    ->color(fn (bool $state): string => $state ? 'success' : 'gray'),

                TextColumn::make('desde')
                    ->label('Desde')
                    ->dateTime('d/m/Y H:i'),

                TextColumn::make('hasta')
                    ->label('Hasta')
                    ->placeholder('—'),
            ])
            ->filters([
                Filter::make('solo_vigentes')
                    ->label('Solo vigentes')
                    ->query(fn (Builder $q) => $q->where('vigente', true))
                    ->toggle()
                    ->default(),
            ])
            ->actions([
                Action::make('desasignar')
                    ->label('Desasignar')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->visible(fn (AsignacionVehiculoMotorista $record): bool => $record->vigente)
                    ->requiresConfirmation()
                    ->action(function (AsignacionVehiculoMotorista $record): void {
                        app(AsignacionVehiculoMotoristaService::class)->desasignar($record->vehiculo_id);
                        Notification::make()->title('Vehículo desasignado')->success()->send();
                    }),
            ])
            ->headerActions([
                Action::make('nueva_asignacion')
                    ->label('Nueva asignación')
                    ->icon('heroicon-o-plus-circle')
                    ->color('primary')
                    ->modalWidth('xl')
                    ->form([
                        Section::make('Vehículo y motorista')
                            ->schema([
                                // 1. SELECCIÓN DE VEHÍCULO
                                Select::make('vehiculo_id')
                                    ->label('Vehículo')
                                    ->options(
                                        Vehiculo::where('activo', true)
                                            ->with('tipo')
                                            ->get()
                                            ->mapWithKeys(fn ($v) => [$v->id => "{$v->placa} — {$v->tipo?->nombre}"])
                                    )
                                    ->searchable()
                                    ->required()
                                    ->live()
                                    ->afterStateUpdated(function ($state, callable $set) {
                                        if (! $state) {
                                            $set('motorista_preview', 'Selecciona un vehículo');
                                            return;
                                        }

                                        $vehiculo = Vehiculo::with(['asignacionVigenteMotorista.motorista.estadoActual'])->find($state);
                                        $motorista = $vehiculo?->asignacionVigenteMotorista?->motorista;
                                        $estado = $motorista?->estadoActual;

                                        if ($motorista) {
                                            $esApto = (bool) ($estado?->activo ?? true);
                                            $label = "{$motorista->nombre} — DUI: {$motorista->dui}";
                                            
                                            // 🔥 ALERTA: Si el motorista actual (ej. Carlos) está INACTIVO
                                            if (!$esApto) {
                                                $set('motorista_preview', "⚠️ {$label} (BLOQUEADO: " . ($estado?->motivo ?? 'INACTIVO') . ")");
                                            } else {
                                                $set('motorista_preview', "✅ {$label}");
                                            }
                                        } else {
                                            $set('motorista_preview', 'Sin motorista asignado actualmente');
                                        }
                                    }),

                                Placeholder::make('motorista_preview')
                                    ->label('Motorista vigente actual')
                                    ->content(fn ($get) => $get('motorista_preview') ?? 'Selecciona un vehículo primero'),

                                // 2. SELECCIÓN DE NUEVO MOTORISTA (FILTRADO)
                                Select::make('motorista_id')
                                    ->label('Nuevo motorista a asignar')
                                    ->options(
                                        Motorista::query()
                                            ->where('activo', true)
                                            ->whereHas('estadoActual', fn ($q) => $q->where('activo', true)) // ✅ FILTRO CRÍTICO
                                            ->orderBy('nombre')
                                            ->pluck('nombre', 'id')
                                    )
                                    ->searchable()
                                    ->required()
                                    ->helperText('Solo aparecen motoristas disponibles (sin permisos/incapacidades).'),

                                DateTimePicker::make('desde')
                                    ->label('Fecha de inicio')
                                    ->default(now())
                                    ->required(),
                            ])->columns(1),
                    ])
                    ->action(function (array $data): void {
                        // 🛡️ ÚLTIMA VALIDACIÓN ANTES DE GUARDAR
                        $motorista = Motorista::with('estadoActual')->find($data['motorista_id']);
                        
                        if ($motorista && !($motorista->estadoActual?->activo ?? true)) {
                            Notification::make()
                                ->title('Error de asignación')
                                ->body("El motorista {$motorista->nombre} no está disponible actualmente.")
                                ->danger()
                                ->send();
                            return;
                        }

                        app(AsignacionVehiculoMotoristaService::class)->asignar(
                            vehiculoId:  (int) $data['vehiculo_id'],
                            motoristaId: (int) $data['motorista_id'],
                            desde:       $data['desde'] ?? null,
                        );

                        Notification::make()
                            ->title('Asignación registrada')
                            ->success()
                            ->send();
                    }),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAsignacionVehiculoMotoristas::route('/'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with(['vehiculo.tipo', 'motorista']);
    }
}