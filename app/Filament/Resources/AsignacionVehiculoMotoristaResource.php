<?php

namespace App\Filament\Resources;

use App\Domain\Solicitudes\Services\AsignacionVehiculoMotoristaService;
use App\Filament\Resources\AsignacionVehiculoMotoristaResource\Pages;
use App\Models\AsignacionVehiculoMotorista;
use App\Models\Vehiculo;
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

    // ──────────────────────────────────────────────────────────────────────────
    // FORM  (usado solo si llegas a EditRecord, en este resource casi no se usa)
    // ──────────────────────────────────────────────────────────────────────────
    public static function form(Form $form): Form
    {
        return $form->schema([
            Select::make('vehiculo_id')
                ->label('Vehículo')
                ->options(
                    Vehiculo::with('tipo')
                        ->where('activo', true)
                        ->get()
                        ->mapWithKeys(fn ($v) => [$v->id => "{$v->placa} — {$v->tipo?->nombre}"])
                )
                ->searchable()
                ->required(),

            Select::make('motorista_id')
                ->label('Motorista')
                ->relationship(
                    name: 'motorista',
                    titleAttribute: 'nombre',
                    modifyQueryUsing: fn (Builder $q) => $q->where('activo', true),
                )
                ->searchable()
                ->preload()
                ->required(),

            DateTimePicker::make('desde')
                ->label('Desde')
                ->default(now())
                ->required(),
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // TABLE
    // ──────────────────────────────────────────────────────────────────────────
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
                    ->label('Tipo vehículo')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('motorista.nombre')
                    ->label('Motorista')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('motorista.dui')
                    ->label('DUI')
                    ->searchable(),

                // Badge inline con Filament v3
                TextColumn::make('vigente')
                    ->label('Estado')
                    ->badge()
                    ->formatStateUsing(fn (bool $state): string => $state ? 'Vigente' : 'Histórico')
                    ->color(fn (bool $state): string => $state ? 'success' : 'gray'),

                TextColumn::make('desde')
                    ->label('Desde')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),

                TextColumn::make('hasta')
                    ->label('Hasta')
                    ->dateTime('d/m/Y H:i')
                    ->placeholder('—')
                    ->sortable(),
            ])

            // ── Filtros ──────────────────────────────────────────────────────
            ->filters([
                Filter::make('solo_vigentes')
                    ->label('Solo vigentes')
                    ->query(fn (Builder $q) => $q->where('vigente', true))
                    ->toggle()
                    ->default(),   // ← arranca filtrado por defecto

                SelectFilter::make('vehiculo_id')
                    ->label('Vehículo')
                    ->options(
                        Vehiculo::with('tipo')
                            ->get()
                            ->mapWithKeys(fn ($v) => [$v->id => "{$v->placa} — {$v->tipo?->nombre}"])
                    )
                    ->searchable(),

                SelectFilter::make('motorista_id')
                    ->label('Motorista')
                    ->relationship('motorista', 'nombre')
                    ->searchable()
                    ->preload(),
            ])

            // ── Acción de fila: Desasignar ───────────────────────────────────
            ->actions([
                Action::make('desasignar')
                    ->label('Desasignar')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->visible(fn (AsignacionVehiculoMotorista $record): bool => $record->vigente)
                    ->requiresConfirmation()
                    ->modalHeading('¿Desasignar vehículo?')
                    ->modalDescription(
                        fn (AsignacionVehiculoMotorista $record): string =>
                            "Se cerrará la asignación vigente del vehículo {$record->vehiculo?->placa} " .
                            "y el motorista {$record->motorista?->nombre} quedará libre."
                    )
                    ->modalSubmitActionLabel('Sí, desasignar')
                    ->action(function (AsignacionVehiculoMotorista $record): void {
                        app(AsignacionVehiculoMotoristaService::class)
                            ->desasignar($record->vehiculo_id);

                        Notification::make()
                            ->title('Vehículo desasignado')
                            ->body("El vehículo {$record->vehiculo?->placa} ya no tiene motorista asignado.")
                            ->success()
                            ->send();
                    }),
            ])

            // ── Acción de cabecera: Nueva asignación ─────────────────────────
            ->headerActions([
    Action::make('nueva_asignacion')
        ->label('Nueva asignación')
        ->icon('heroicon-o-plus-circle')
        ->color('primary')
        ->form([
            Section::make('Vehículo y motorista')
                ->schema([
                    Select::make('vehiculo_id')
                        ->label('Vehículo')
                        ->options(
                            Vehiculo::with('tipo')
                                ->where('activo', true)
                                ->get()
                                ->mapWithKeys(fn ($v) => [
                                    $v->id => "{$v->placa} — {$v->tipo?->nombre}",
                                ])
                        )
                        ->searchable()
                        ->required()
                        ->live()
                        ->helperText('Si ya tiene motorista, la asignación anterior se cierra automáticamente.')
                        ->afterStateUpdated(function ($state, callable $set) {
                            if (! $state) {
                                $set('motorista_preview', 'Selecciona un vehículo primero');
                                $set('motorista_id_sugerido', null);
                                return;
                            }

                            $vehiculo  = Vehiculo::with('asignacionVigenteMotorista.motorista')->find($state);
                            $motorista = $vehiculo?->asignacionVigenteMotorista?->motorista;

                            $set(
                                'motorista_preview',
                                $motorista
                                    ? "{$motorista->nombre} — DUI: {$motorista->dui}"
                                    : 'Sin motorista asignado actualmente'
                            );
                            $set('motorista_id_sugerido', $motorista?->id);
                        }),

                    Placeholder::make('motorista_preview')
                        ->label('Motorista vigente actual')
                        ->content(fn ($get) => $get('motorista_preview') ?? 'Selecciona un vehículo primero'),

                    Hidden::make('motorista_id_sugerido'),

                    // ← ESTE era el que tronaba: ->relationship() en Action form
                    Select::make('motorista_id')
                        ->label('Nuevo motorista a asignar')
                        ->options(
                            \App\Models\Motorista::where('activo', true)
                                ->orderBy('nombre')
                                ->pluck('nombre', 'id')
                        )
                        ->searchable()
                        ->required()
                        ->helperText('Solo motoristas activos. Si ya tiene vehículo asignado, su asignación anterior también se cerrará.'),

                    DateTimePicker::make('desde')
                        ->label('Fecha de inicio')
                        ->default(now())
                        ->nullable()
                        ->helperText('Vacío = hora actual del servidor.'),
                ])
                ->columns(2),
        ])
        ->action(function (array $data): void {
            app(AsignacionVehiculoMotoristaService::class)->asignar(
                vehiculoId:  (int) $data['vehiculo_id'],
                motoristaId: (int) $data['motorista_id'],
                desde:       $data['desde'] ?? null,
            );

            Notification::make()
                ->title('Asignación registrada')
                ->body('El vehículo y el motorista han sido vinculados correctamente.')
                ->success()
                ->send();
        }),
])

            ->bulkActions([]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // PAGES
    // ──────────────────────────────────────────────────────────────────────────
    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAsignacionVehiculoMotoristas::route('/'),
        ];
    }

    // Eager load para evitar N+1
    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->with(['vehiculo.tipo', 'motorista']);
    }
}