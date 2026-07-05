<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA RECEPCIÓN / ENTREGA DE VEHÍCULOS
// -----------------------------------------------------------------------------
// Registra cuándo un vehículo es entregado a un motorista o recibido
// de vuelta. Lleva control del kilometraje, nivel de combustible,
// herramientas verificadas y condición del vehículo (interior/exterior).
// Sirve para mantener un historial claro de quién tuvo el vehículo
// y en qué estado se entregó y recibió. Genera un PDF de cada movimiento.

namespace App\Filament\Resources;

use App\Filament\Resources\RecepcionEntregaVehiculoResource\Pages;
use App\Models\Motorista;
use App\Models\RecepcionEntregaVehiculo;
use App\Models\Vehiculo;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class RecepcionEntregaVehiculoResource extends Resource
{
    protected static ?string $model = RecepcionEntregaVehiculo::class;

    protected static ?string $navigationGroup = 'Gestión de Vehículos';

    protected static ?string $navigationLabel = 'Recepción / Entrega Vehículos';

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-check';

    protected static ?string $modelLabel = 'Recepción / Entrega';

    protected static ?string $pluralModelLabel = 'Recepciones / Entregas';

    protected static ?int $navigationSort = 20;

    public static function canViewAny(): bool
    {
        return auth()->user()?->hasAnyRole(['admin', 'ti', 'jefe', 'super_admin', 'operativo']) ?? false;
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Datos generales')
                ->schema([
                    Forms\Components\Select::make('tipo_movimiento')
                        ->label('Tipo de movimiento')
                        ->options([
                            'entrega' => 'Entrega',
                            'recepcion' => 'Recepción',
                        ])
                        ->required()
                        ->native(false),

                    Forms\Components\DateTimePicker::make('fecha_hora')
                        ->label('Fecha y hora')
                        ->required()
                        ->seconds(false)
                        ->native(false)
                        ->default(now()),

                    Forms\Components\Select::make('vehiculo_id')
                        ->label('Vehículo')
                        ->options(fn () => Vehiculo::orderBy('placa')->pluck('placa', 'id'))
                        ->searchable()
                        ->required()
                        ->native(false),

                    Forms\Components\Select::make('motorista_id')
                        ->label('Motorista')
                        ->options(fn () => Motorista::orderBy('nombre')->pluck('nombre', 'id'))
                        ->searchable()
                        ->native(false),

                    Forms\Components\Hidden::make('user_id')
                        ->default(fn () => auth()->id()),

                    // En RecepcionEntregaVehiculoResource.php — dentro del form()

                    Forms\Components\Select::make('solicitud_transporte_id')
                        ->label('Solicitud de Transporte')
                        ->relationship(
                            name: 'solicitud',
                            titleAttribute: 'codigo',
                            modifyQueryUsing: fn ($query) => $query
                                ->whereIn('estado', [
                                    \App\Domain\Solicitudes\Enums\EstadoSolicitudEnum::APROBADA,
                                    \App\Domain\Solicitudes\Enums\EstadoSolicitudEnum::ASIGNADA,
                                    \App\Domain\Solicitudes\Enums\EstadoSolicitudEnum::PROGRAMADA,
                                ])
                                ->orderByDesc('fecha_salida')
                        )
                        ->searchable()
                        ->preload()
                        ->nullable()
                        ->helperText('Opcional. Vincula esta entrega/recepción a una solicitud activa.'),
                ])
                ->columns(2),

            Forms\Components\Section::make('Control operativo')
                ->schema([
                    Forms\Components\TextInput::make('kilometraje')
                        ->label('Kilometraje')
                        ->numeric()
                        ->minValue(0),

                    Forms\Components\Select::make('nivel_combustible')
                        ->label('Nivel de combustible')
                        ->options(\App\Domain\Solicitudes\Enums\NivelCombustibleEnum::options())
                        ->native(false)
                        ->helperText('0% = Vacío | 25% = ¼ | 50% = ½ | 75% = ¾ | 100% = Lleno')
                        ->afterStateUpdated(function (callable $set, $state) {
                            // Si el nivel es bajo (< 50%), sugerir desmarcar reserva
                        }),

                    Forms\Components\Toggle::make('tiene_reserva')
                        ->label('🛢️ Tiene reserva de combustible')
                        ->helperText('Marque si el vehículo cuenta con combustible suficiente de un viaje anterior y no requiere asignación nueva.')
                        ->inline(false),

                    Forms\Components\CheckboxList::make('herramientas_verificadas')
                        ->label('Herramientas y accesorios verificados')
                        ->options(\App\Models\RecepcionEntregaVehiculo::opcionesHerramientas())
                        ->default(array_keys(\App\Models\RecepcionEntregaVehiculo::opcionesHerramientas()))
                        ->columns(3)
                        ->bulkToggleable()
                        ->gridDirection('column')
                        ->columnSpanFull(),
                ])
                ->columns(2),

            Forms\Components\Section::make('Condición del vehículo')
                ->schema([
                    Forms\Components\Textarea::make('estado_exterior')
                        ->label('Estado exterior')
                        ->rows(3),

                    Forms\Components\Textarea::make('estado_interior')
                        ->label('Estado interior')
                        ->rows(3),
                ])
                ->columns(2),

            Forms\Components\Section::make('Responsables y observaciones')
                ->schema([
                    Forms\Components\TextInput::make('entregado_por')
                        ->label('Entregado por')
                        ->maxLength(255),

                    Forms\Components\TextInput::make('recibido_por')
                        ->label('Recibido por')
                        ->maxLength(255),

                    Forms\Components\Textarea::make('observaciones')
                        ->label('Observaciones')
                        ->rows(4)
                        ->columnSpanFull(),

                    Forms\Components\FileUpload::make('adjuntos')
                        ->label('Adjuntos')
                        ->multiple()
                        ->disk('public')
                        ->directory('recepciones-entregas')
                        ->columnSpanFull(),
                ])
                ->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('fecha_hora', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('tipo_movimiento')
                    ->label('Tipo')
                    ->badge()
                    ->formatStateUsing(fn ($state) => match ($state) {
                        'entrega' => 'Entrega',
                        'recepcion' => 'Recepción',
                        default => ucfirst((string) $state),
                    })
                    ->colors([
                        'warning' => 'entrega',
                        'success' => 'recepcion',
                    ]),

                Tables\Columns\TextColumn::make('fecha_hora')
                    ->label('Fecha y hora')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),

                Tables\Columns\TextColumn::make('vehiculo.placa')
                    ->label('Placa')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('motorista.nombre')
                    ->label('Motorista')
                    ->toggleable(),

                Tables\Columns\TextColumn::make('kilometraje')
                    ->label('Kilometraje')
                    ->numeric()
                    ->sortable(),

                Tables\Columns\TextColumn::make('nivel_combustible')
                    ->label('Combustible')
                    ->formatStateUsing(fn ($state) => $state !== null ? "{$state}%" : '—')
                    ->badge()
                    ->color(fn ($state) => match (true) {
                        $state === null => 'gray',
                        $state <= 25 => 'danger',
                        $state <= 50 => 'warning',
                        $state <= 75 => 'info',
                        default => 'success',
                    }),

                Tables\Columns\IconColumn::make('tiene_reserva')
                    ->label('Reserva')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('gray')
                    ->tooltip(fn ($state) => $state ? 'Tiene reserva activa' : 'Sin reserva'),

                Tables\Columns\TextColumn::make('herramientas_verificadas')
                    ->label('Herramientas')
                    ->formatStateUsing(function ($state) {
                        if (! is_array($state) || empty($state)) {
                            return '—';
                        }
                        $opciones = \App\Models\RecepcionEntregaVehiculo::opcionesHerramientas();

                        return collect($state)->map(fn ($k) => $opciones[$k] ?? $k)->implode(', ');
                    })
                    ->badge()
                    ->color(fn ($state) => is_array($state) && count($state) === 9 ? 'success' : 'warning'),

                Tables\Columns\TextColumn::make('usuario.name')
                    ->label('Registrado por')
                    ->toggleable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('tipo_movimiento')
                    ->label('Tipo')
                    ->options([
                        'entrega' => 'Entrega',
                        'recepcion' => 'Recepción',
                    ]),

                Tables\Filters\SelectFilter::make('vehiculo_id')
                    ->label('Vehículo')
                    ->options(fn () => Vehiculo::orderBy('placa')->pluck('placa', 'id')),

                Tables\Filters\SelectFilter::make('motorista_id')
                    ->label('Motorista')
                    ->options(fn () => Motorista::orderBy('nombre')->pluck('nombre', 'id')),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),

                Tables\Actions\Action::make('pdf')
                    ->label('PDF')
                    ->icon('heroicon-o-printer')
                    ->url(fn (RecepcionEntregaVehiculo $record) => route('reportes.recepcion-entrega.pdf', [
                        'movimiento_id' => $record->id,
                    ]))
                    ->openUrlInNewTab(),

                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListRecepcionEntregaVehiculos::route('/'),
            'create' => Pages\CreateRecepcionEntregaVehiculo::route('/create'),
            // 'view' => Pages\ViewRecepcionEntregaVehiculo::route('/{record}'),
            'edit' => Pages\EditRecepcionEntregaVehiculo::route('/{record}/edit'),
        ];
    }
}
