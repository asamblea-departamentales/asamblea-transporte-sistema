<?php

namespace App\Filament\Resources;

// Imports para los emails
use App\Mail\NotificacionEventMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use App\Filament\Resources\SolicitudTransporteResource\Pages;
use App\Models\SolicitudTransporte;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use App\Models\HistorialEstado;
use App\Models\BitacoraEvento;
use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;

class SolicitudTransporteResource extends Resource
{
    protected static ?string $model = SolicitudTransporte::class;

    protected static ?string $navigationGroup = 'Asignaciones';
    protected static ?string $navigationLabel = 'Solicitudes de Transporte';
    protected static ?string $navigationIcon  = 'heroicon-o-clipboard-document-check';

    public static function canViewAny(): bool
    {
        return auth()->check() && auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']);
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Resumen')
                    ->schema([
                        Forms\Components\Placeholder::make('codigo_ui')
                            ->label('Código')
                            ->content(fn (SolicitudTransporte $record) => $record->codigo ?? '-'),

                        Forms\Components\Placeholder::make('unidad_ui')
                            ->label('Unidad Solicitante')
                            ->content(fn (SolicitudTransporte $record) => $record->unidad?->nombre ?? '-'),

                        Forms\Components\Placeholder::make('solicitante_ui')
                            ->label('Solicitante')
                            ->content(fn (SolicitudTransporte $record) => $record->solicitante?->name ?? '-'),

                        Forms\Components\Placeholder::make('salida_ui')
                            ->label('Salida')
                            ->content(fn (SolicitudTransporte $record) => optional($record->fecha_salida)?->format('d/m/Y H:i') ?? '-'),

                        Forms\Components\Placeholder::make('retorno_ui')
                            ->label('Retorno (Estimado)')
                            ->content(fn (SolicitudTransporte $record) => optional($record->fecha_retorno)?->format('d/m/Y H:i') ?? '-'),

                        Forms\Components\Placeholder::make('cantidad_personas_ui')
                            ->label('Cantidad de personas')
                            ->content(fn (SolicitudTransporte $record) => (string) ($record->cantidad_personas ?? '-')),

                        Forms\Components\Placeholder::make('prioridad_ui')
                            ->label('Prioridad')
                            ->content(fn (SolicitudTransporte $record) => $record->prioridad?->value ? strtoupper($record->prioridad->value) : '-'),

                        Forms\Components\Placeholder::make('estado_ui')
                            ->label('Estado')
                            ->content(fn (SolicitudTransporte $record) => $record->estado?->value ? strtoupper($record->estado->value) : '-'),
                    ])
                    ->columns(['default' => 1, 'sm' => 2, 'xl' => 4])
                    ->compact(),

                Forms\Components\Section::make('Ruta')
                    ->schema([
                        Forms\Components\Placeholder::make('origen_ui')
                            ->label('Origen')
                            ->content(fn (SolicitudTransporte $record) => $record->origen ?? '-'),

                        Forms\Components\Placeholder::make('destino_ui')
                            ->label('Destino')
                            ->content(fn (SolicitudTransporte $record) => $record->destino ?? '-'),

                        Forms\Components\Placeholder::make('destino_adicional_ui')
                            ->label('Destinos Adicionales')
                            ->content(function (SolicitudTransporte $record) {
                                if (! $record->destino_adicional) {
                                    return 'Sin destinos adicionales';
                                }

                                $destinos = array_map('trim', explode(' - ', $record->destino_adicional));

                                $html = '<ul style="list-style-type: disc; margin-left: 20px; line-height: 1.5;">';
                                foreach ($destinos as $destino) {
                                    if (! empty($destino)) {
                                        $html .= '<li style="margin-bottom: 8px; color: #374151;">' . e($destino) . '</li>';
                                    }
                                }
                                $html .= '</ul>';

                                return new \Illuminate\Support\HtmlString($html);
                            }),
                    ])
                    ->columns(['default' => 1, 'md' => 2, 'xl' => 3])
                    ->collapsible()
                    ->collapsed()
                    ->compact(),

                Forms\Components\Section::make('Motivo de la actividad')
                    ->schema([
                        Forms\Components\Placeholder::make('motivo_ui')
                            ->label('')
                            ->content(fn (SolicitudTransporte $record) => $record->motivo_actividad ?? '-'),
                    ])
                    ->collapsible()
                    ->collapsed(false)
                    ->compact(),

                Forms\Components\Section::make('Decisión / Auditoría')
                    ->schema([
                        Forms\Components\Placeholder::make('comentario_jefe_ui')
                            ->label('Observaciones de Jefatura')
                            ->content(fn (SolicitudTransporte $record) => $record->comentario_jefe ?? '-')
                            ->columnSpanFull(),

                        Forms\Components\Placeholder::make('vehiculo_ui')
                            ->label('Vehículo Asignado')
                            ->content(fn (SolicitudTransporte $record) =>
                                $record->vehiculo
                                    ? "{$record->vehiculo->placa} - {$record->vehiculo->tipo->nombre}"
                                    : '-'
                            )
                            ->columnSpanFull(),

                        Forms\Components\Placeholder::make('motorista_ui')
                            ->label('Motorista Asignado')
                            ->content(fn (SolicitudTransporte $record) =>
                                $record->motorista
                                    ? "{$record->motorista->nombre} - {$record->motorista->dui}"
                                    : '-'
                            )
                            ->columnSpanFull(),

                        Forms\Components\Placeholder::make('autorizador_ui')
                            ->label('Autorizado por')
                            ->content(fn (SolicitudTransporte $record) => $record->autorizador?->name ?? '-'),

                        Forms\Components\Placeholder::make('decidido_en_ui')
                            ->label('Fecha de Decisión')
                            ->content(fn (SolicitudTransporte $record) =>
                                optional($record->decidido_en)?->format('d/m/Y H:i') ?? '-'
                            ),
                    ])
                    ->columns(['default' => 1, 'md' => 2])
                    ->collapsible()
                    ->collapsed()
                    ->compact(),

                Forms\Components\Section::make('Historial de estados')
                    ->schema([
                        Forms\Components\Repeater::make('historial_ui')
                            ->label('')
                            ->disabled()
                            ->dehydrated(false)
                            ->default(function (SolicitudTransporte $record) {
                                return HistorialEstado::query()
                                    ->where('entidad_tipo', 'solicitud_transporte')
                                    ->where('entidad_id', $record->id)
                                    ->orderByDesc('created_at')
                                    ->get()
                                    ->map(fn ($h) => [
                                        'fecha'      => optional($h->created_at)?->format('d/m/Y H:i') ?? '-',
                                        'de'         => $h->estado_anterior ?? '-',
                                        'a'          => $h->estado_nuevo ?? '-',
                                        'comentario' => $h->comentario ?? null,
                                    ])
                                    ->toArray();
                            })
                            ->schema([
                                Forms\Components\TextInput::make('fecha')->disabled(),
                                Forms\Components\TextInput::make('de')->label('De')->disabled(),
                                Forms\Components\TextInput::make('a')->label('A')->disabled(),
                                Forms\Components\Textarea::make('comentario')
                                    ->rows(2)
                                    ->disabled()
                                    ->columnSpanFull(),
                            ])
                            ->columns(['default' => 1, 'md' => 3])
                            ->columnSpanFull(),
                    ])
                    ->collapsible()
                    ->collapsed(false)
                    ->compact(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('fecha_salida', 'asc')
            ->contentGrid(['default' => 1, 'md' => 2, 'xl' => 3])
            ->recordUrl(fn (SolicitudTransporte $record) => static::getUrl('view', ['record' => $record]))
            ->columns([
                Tables\Columns\TextColumn::make('codigo')
                    ->label('Código')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->copyable(),

                Tables\Columns\TextColumn::make('unidad.nombre')
                    ->label('Unidad')
                    ->searchable()
                    ->sortable()
                    ->wrap(),

                Tables\Columns\TextColumn::make('solicitante.name')
                    ->label('Solicitante')
                    ->searchable()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('prioridad')
                    ->label('Prioridad')
                    ->badge()
                    ->formatStateUsing(fn (PrioridadSolicitudEnum $state): string => match ($state) {
                        PrioridadSolicitudEnum::ALTA  => 'ALTA',
                        PrioridadSolicitudEnum::MEDIA => 'MEDIA',
                        PrioridadSolicitudEnum::BAJA  => 'BAJA',
                    })
                    ->color(fn (PrioridadSolicitudEnum $state): string => match ($state) {
                        PrioridadSolicitudEnum::ALTA  => 'danger',
                        PrioridadSolicitudEnum::MEDIA => 'warning',
                        PrioridadSolicitudEnum::BAJA  => 'success',
                    }),

                Tables\Columns\TextColumn::make('tipo_vehiculo_nombre')
                    ->label('Vehículo Pedido')
                    ->placeholder('No especificado')
                    ->badge()
                    ->color('info')
                    ->icon('heroicon-m-truck')
                    ->formatStateUsing(fn (string $state): string => ucfirst($state))
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('estado')
                    ->label('Estado')
                    ->badge()
                    ->formatStateUsing(fn (EstadoSolicitudEnum $state): string => match ($state) {
                        EstadoSolicitudEnum::BORRADOR     => 'Borrador',
                        EstadoSolicitudEnum::PENDIENTE    => 'Pendiente',
                        EstadoSolicitudEnum::EN_REVISION  => 'En revisión',
                        EstadoSolicitudEnum::PRE_APROBADA => 'Pre-aprobada',
                        EstadoSolicitudEnum::APROBADA     => 'Aprobada',
                        EstadoSolicitudEnum::RECHAZADA    => 'Rechazada',
                        EstadoSolicitudEnum::PROGRAMADA   => 'Programada',
                        EstadoSolicitudEnum::EN_EJECUCION => 'En ejecución',
                        EstadoSolicitudEnum::COMPLETADA   => 'Completada',
                        EstadoSolicitudEnum::CANCELADA    => 'Cancelada',
                        default                           => $state->value,
                    })
                    ->color(fn (EstadoSolicitudEnum $state): string => match ($state) {
                        EstadoSolicitudEnum::BORRADOR     => 'gray',
                        EstadoSolicitudEnum::PENDIENTE    => 'warning',
                        EstadoSolicitudEnum::EN_REVISION  => 'info',
                        EstadoSolicitudEnum::PRE_APROBADA => 'warning',
                        EstadoSolicitudEnum::APROBADA     => 'success',
                        EstadoSolicitudEnum::RECHAZADA    => 'danger',
                        EstadoSolicitudEnum::PROGRAMADA   => 'info',
                        EstadoSolicitudEnum::EN_EJECUCION => 'primary',
                        EstadoSolicitudEnum::COMPLETADA   => 'success',
                        EstadoSolicitudEnum::CANCELADA    => 'gray',
                        default                           => 'primary',
                    })
                    ->sortable(),

                Tables\Columns\TextColumn::make('fecha_salida')
                    ->label('Fecha Salida')
                    ->date('d/m/Y')
                    ->description(fn ($record) => $record->hora_salida)
                    ->sortable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Creada')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('estado')
                    ->multiple()
                    ->options([
                        EstadoSolicitudEnum::BORRADOR->value     => 'Borrador',
                        EstadoSolicitudEnum::PENDIENTE->value    => 'Pendiente',
                        EstadoSolicitudEnum::EN_REVISION->value  => 'En revisión',
                        EstadoSolicitudEnum::APROBADA->value     => 'Aprobada',
                        EstadoSolicitudEnum::RECHAZADA->value    => 'Rechazada',
                        EstadoSolicitudEnum::PROGRAMADA->value   => 'Programada',
                        EstadoSolicitudEnum::EN_EJECUCION->value => 'En ejecución',
                        EstadoSolicitudEnum::COMPLETADA->value   => 'Completada',
                        EstadoSolicitudEnum::CANCELADA->value    => 'Cancelada',
                    ]),

                Tables\Filters\SelectFilter::make('prioridad')
                    ->options([
                        PrioridadSolicitudEnum::BAJA->value  => 'BAJA',
                        PrioridadSolicitudEnum::MEDIA->value => 'MEDIA',
                        PrioridadSolicitudEnum::ALTA->value  => 'ALTA',
                    ]),

                Tables\Filters\SelectFilter::make('unidad_solicitante_id')
                    ->label('Unidad')
                    ->relationship('unidad', 'nombre'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),

                Tables\Actions\ActionGroup::make([

                    Tables\Actions\Action::make('observacion')
                        ->label('Observación')
                        ->icon('heroicon-o-chat-bubble-left-ellipsis')
                        ->modalHeading('Agregar Observación')
                        ->modalSubmitActionLabel('Guardar Observación')
                        ->form([
                            Forms\Components\Textarea::make('comentario_jefe')
                                ->label('Observación del jefe')
                                ->rows(4)
                                ->required()
                                ->maxLength(2000),
                        ])
                        ->action(function (SolicitudTransporte $record, array $data) {
                            $estadoAnterior = $record->estado;
                            $record->comentario_jefe = $data['comentario_jefe'];

                            if ($record->estado === EstadoSolicitudEnum::PENDIENTE) {
                                $record->estado = EstadoSolicitudEnum::EN_REVISION;
                            }

                            $record->save();

                            if ($estadoAnterior !== $record->estado) {
                                HistorialEstado::create([
                                    'entidad_tipo'    => 'solicitud_transporte',
                                    'entidad_id'      => $record->id,
                                    'estado_anterior' => $estadoAnterior?->value,
                                    'estado_nuevo'    => $record->estado?->value,
                                    'user_id'         => auth()->id(),
                                    'comentario'      => $data['comentario_jefe'],
                                ]);
                            }

                            BitacoraEvento::create([
                                'entidad_tipo' => 'solicitud_transporte',
                                'entidad_id'   => $record->id,
                                'accion'       => AccionBitacoraEnum::OBSERVAR->value,
                                'user_id'      => auth()->id(),
                                'datos_extras' => ['comentario' => $data['comentario_jefe']],
                            ]);
                        })
                        ->visible(fn (SolicitudTransporte $record) =>
                            auth()->check() &&
                            auth()->user()->hasRole('operativo') &&
                            in_array($record->estado, [
                                EstadoSolicitudEnum::PENDIENTE,
                                EstadoSolicitudEnum::EN_REVISION,
                            ], true)
                        ),

                    Tables\Actions\Action::make('pre_aprobar')
                        ->label('Pre-Aprobar')
                        ->color('warning')
                        ->icon('heroicon-o-clock')
                        ->requiresConfirmation()
                        ->modalHeading('Pre-aprobar Solicitud')
                        ->action(function (SolicitudTransporte $record) {
                            $estadoAnterior = $record->estado;
                            $record->estado = EstadoSolicitudEnum::PRE_APROBADA;
                            $record->save();

                            HistorialEstado::create([
                                'entidad_tipo'    => 'solicitud_transporte',
                                'entidad_id'      => $record->id,
                                'estado_anterior' => $estadoAnterior?->value,
                                'estado_nuevo'    => $record->estado?->value,
                                'user_id'         => auth()->id(),
                                'comentario'      => 'Solicitud pre-aprobada en revisión inicial.',
                            ]);

                            BitacoraEvento::create([
                                'entidad_tipo' => 'solicitud_transporte',
                                'entidad_id'   => $record->id,
                                'accion'       => AccionBitacoraEnum::PRE_APROBAR->value,
                                'user_id'      => auth()->id(),
                            ]);
                        })
                        ->visible(fn (SolicitudTransporte $record) =>
                            auth()->check() &&
                            auth()->user()->hasRole('operativo') &&
                            $record->estado === EstadoSolicitudEnum::EN_REVISION
                        ),

                    // FIX #1: correctamente indentado dentro del ActionGroup
                    // FIX #4: ahora filtra vehículos ocupados por solapamiento de fechas
                    Tables\Actions\Action::make('asignar_transporte')
                        ->label('Asignar transporte')
                        ->icon('heroicon-o-truck')
                        ->color('info')
                        ->modalHeading('Asignar Vehículo y Motorista')
                        ->visible(fn (SolicitudTransporte $record) =>
                            auth()->check() &&
                            auth()->user()->hasRole('jefe') &&
                            $record->estado === EstadoSolicitudEnum::APROBADA
                        )
                        ->form([
                            Forms\Components\Select::make('vehiculo_id')
                                ->label('Vehículo')
                                ->options(function (SolicitudTransporte $record) {
                                    $ocupados = SolicitudTransporte::query()
                                        ->where('id', '!=', $record->id)
                                        ->whereIn('estado', [
                                            EstadoSolicitudEnum::PROGRAMADA,
                                            EstadoSolicitudEnum::APROBADA,
                                            EstadoSolicitudEnum::EN_EJECUCION,
                                        ])
                                        ->where(function ($query) use ($record) {
                                            $query->where(function ($q) use ($record) {
                                                $q->where('fecha_salida', '<=', $record->fecha_retorno)
                                                  ->where('fecha_retorno', '>=', $record->fecha_salida);
                                            });
                                        })
                                        ->pluck('vehiculo_id')
                                        ->filter()
                                        ->unique();

                                    return \App\Models\Vehiculo::where('activo', true)
                                        ->whereNotIn('id', $ocupados)
                                        ->get()
                                        ->mapWithKeys(fn ($v) => [
                                            $v->id => "{$v->placa} - {$v->tipo->nombre}"
                                        ]);
                                })
                                ->searchable()
                                ->required()
                                ->live()
                                ->afterStateUpdated(function ($state, callable $set) {
                                    $vehiculo  = \App\Models\Vehiculo::find($state);
                                    $motorista = $vehiculo?->asignacionVigenteMotorista?->motorista;
                                    $set('motorista_nombre', $motorista
                                        ? "{$motorista->nombre} — DUI: {$motorista->dui}"
                                        : 'Sin motorista asignado');
                                    $set('motorista_id', $motorista?->id);
                                }),

                            Forms\Components\Hidden::make('motorista_id'),

                            // FIX #2: advertencia visible si el vehículo no tiene motorista
                            Forms\Components\Placeholder::make('motorista_nombre')
                                ->label('Motorista asignado')
                                ->content(fn ($get) => $get('motorista_nombre') ?? 'Selecciona un vehículo')
                                ->hint(fn ($get) => ! $get('motorista_id') ? '⚠ Este vehículo no tiene motorista asignado' : null)
                                ->hintColor('danger'),
                        ])
                        ->action(function (SolicitudTransporte $record, array $data) {
                            $estadoAnterior = $record->estado;

                            $record->update([
                                'vehiculo_id'  => $data['vehiculo_id'],
                                'motorista_id' => $data['motorista_id'],
                                'estado'       => EstadoSolicitudEnum::ASIGNADA,
                            ]);

                            HistorialEstado::create([
                                'entidad_tipo'    => 'solicitud_transporte',
                                'entidad_id'      => $record->id,
                                'estado_anterior' => $estadoAnterior->value,
                                'estado_nuevo'    => EstadoSolicitudEnum::ASIGNADA->value,
                                'user_id'         => auth()->id(),
                                'comentario'      => 'Vehículo y motorista asignados.',
                            ]);

                            BitacoraEvento::create([
                                'entidad_tipo' => 'solicitud_transporte',
                                'entidad_id'   => $record->id,
                                'accion'       => AccionBitacoraEnum::ASIGNAR->value,
                                'user_id'      => auth()->id(),
                                'datos_extras' => [
                                    'vehiculo_id'  => $data['vehiculo_id'],
                                    'motorista_id' => $data['motorista_id'],
                                ],
                            ]);
                        }),

                    Tables\Actions\Action::make('aprobar')
                        ->label('Aprobar')
                        ->color('success')
                        ->icon('heroicon-o-check-circle')
                        ->modalHeading('Aprobar y Asignar Vehículo')
                        ->modalWidth('2xl')
                        ->form([
                            Forms\Components\Textarea::make('comentario_jefe')
                                ->label('Motivo de la aprobación')
                                ->rows(4)
                                ->required()
                                ->maxLength(2000)
                                ->columnSpanFull(),

                            Forms\Components\Section::make('Asignación de Vehículo y Motorista')
                                ->schema([
                                    Forms\Components\Select::make('vehiculo_id')
                                        ->label('Vehículo')
                                        ->options(function (SolicitudTransporte $record) {
                                            $ocupados = SolicitudTransporte::query()
                                                ->where('id', '!=', $record->id)
                                                ->whereIn('estado', [
                                                    EstadoSolicitudEnum::PROGRAMADA,
                                                    EstadoSolicitudEnum::APROBADA,
                                                    EstadoSolicitudEnum::EN_EJECUCION,
                                                ])
                                                ->where(function ($query) use ($record) {
                                                    $query->where(function ($q) use ($record) {
                                                        $q->where('fecha_salida', '<=', $record->fecha_retorno)
                                                          ->where('fecha_retorno', '>=', $record->fecha_salida);
                                                    });
                                                })
                                                ->pluck('vehiculo_id')
                                                ->filter()
                                                ->unique();

                                            return \App\Models\Vehiculo::where('activo', true)
                                                ->whereNotIn('id', $ocupados)
                                                ->get()
                                                ->mapWithKeys(fn ($v) => [
                                                    $v->id => "{$v->placa} - {$v->tipo->nombre}"
                                                ]);
                                        })
                                        ->searchable()
                                        ->required()
                                        ->hint(fn ($record) => "Solicitó: " . ($record->tipo_vehiculo_nombre ?? 'N/A'))
                                        ->hintColor('warning')
                                        ->live()
                                        ->afterStateUpdated(function ($state, callable $set) {
                                            if (!$state) {
                                                $set('motorista_nombre', 'Sin motorista asignado');
                                                $set('motorista_id', null);
                                                return;
                                            }
                                            $vehiculo  = \App\Models\Vehiculo::find($state);
                                            $motorista = $vehiculo?->asignacionVigenteMotorista?->motorista;
                                            $set('motorista_nombre', $motorista
                                                ? "{$motorista->nombre} — DUI: {$motorista->dui}"
                                                : 'Sin motorista asignado');
                                            $set('motorista_id', $motorista?->id);
                                        }),

                                    Forms\Components\Hidden::make('motorista_id'),

                                    // FIX #2: advertencia visible si el vehículo no tiene motorista
                                    Forms\Components\Placeholder::make('motorista_nombre')
                                        ->label('Motorista Asignado')
                                        ->content(fn ($get) => $get('motorista_nombre') ?? 'Selecciona un vehículo primero')
                                        ->hint(fn ($get) => ! $get('motorista_id') ? '⚠ Este vehículo no tiene motorista asignado' : null)
                                        ->hintColor('danger'),
                                ])
                                ->columns(2),
                        ])
                        ->action(function (SolicitudTransporte $record, array $data) {
                            $estadoAnterior = $record->estado;

                            // FIX #3: estado unificado — record y historial usan PROGRAMADA
                            $record->estado          = EstadoSolicitudEnum::PROGRAMADA;
                            $record->comentario_jefe = $data['comentario_jefe'];
                            $record->decidido_por    = auth()->id();
                            $record->decidido_en     = now();
                            $record->vehiculo_id     = $data['vehiculo_id'];
                            $record->motorista_id    = $data['motorista_id'];
                            $record->save();

                            $record->load(['vehiculo.tipo', 'motorista', 'solicitante', 'unidad']);

                            HistorialEstado::create([
                                'entidad_tipo'    => 'solicitud_transporte',
                                'entidad_id'      => $record->id,
                                'estado_anterior' => $estadoAnterior->value,
                                'estado_nuevo'    => EstadoSolicitudEnum::PROGRAMADA->value,
                                'user_id'         => auth()->id(),
                                'comentario'      => $data['comentario_jefe'],
                            ]);

                            BitacoraEvento::create([
                                'entidad_tipo' => 'solicitud_transporte',
                                'entidad_id'   => $record->id,
                                'accion'       => AccionBitacoraEnum::APROBAR->value,
                                'user_id'      => auth()->id(),
                                'datos_extras' => [
                                    'comentario'   => $data['comentario_jefe'],
                                    'vehiculo_id'  => $data['vehiculo_id'],
                                    'motorista_id' => $data['motorista_id'],
                                ],
                            ]);

                            try {
                                $payload = [
                                    'tipo'    => 'transporte',
                                    'evento'  => 'solicitud_aprobada',
                                    'mensaje' => 'Tu solicitud de transporte ha sido APROBADA y programada exitosamente.',
                                    'solicitud' => [
                                        'codigo'               => $record->codigo,
                                        'estado'               => 'aprobado',
                                        'tipo_vehiculo_nombre' => $record->vehiculo->tipo->nombre ?? 'No asignado',
                                        'cantidad_personas'    => $record->cantidad_personas,
                                        'origen'               => $record->origen,
                                        'destino'              => $record->destino,
                                        'destino_adicional'    => $record->destino_adicional,
                                        'fecha_salida'         => $record->fecha_salida,
                                        'fecha_retorno'        => $record->fecha_retorno,
                                        'motivo_actividad'     => $record->motivo_actividad,
                                        'vehiculo_placa'       => $record->vehiculo->placa ?? 'N/A',
                                        'motorista_nombre'     => $record->motorista->nombre ?? 'N/A',
                                    ],
                                    'solicitante' => [
                                        'name'  => $record->solicitante->name,
                                        'email' => $record->solicitante->email,
                                        'unidad' => [
                                            'nombre' => $record->unidad->nombre ?? 'N/A',
                                            'siglas' => $record->unidad->siglas ?? 'N/A',
                                        ],
                                    ],
                                    'timestamp' => now()->format(\DateTimeInterface::ATOM),
                                ];

                                Mail::to($record->solicitante->email)->send(
                                    new NotificacionEventMail('✅ Solicitud de Transporte APROBADA', $payload)
                                );
                            } catch (\Exception $e) {
                                Log::error('Error enviando correo de aprobación: ' . $e->getMessage());
                            }
                        })
                        ->visible(fn (SolicitudTransporte $record) =>
                            auth()->check() &&
                            auth()->user()->hasRole('jefe') &&
                            $record->estado === EstadoSolicitudEnum::PRE_APROBADA
                        ),

                    Tables\Actions\Action::make('mision_oficial')
                        ->label('Misión Oficial')
                        ->icon('heroicon-o-document-text')
                        ->color('info')
                        ->url(fn (SolicitudTransporte $record) => route('reportes.mision-oficial.pdf', [
                            'solicitud_id' => $record->id,
                        ]))
                        ->openUrlInNewTab()
                        ->visible(fn (SolicitudTransporte $record) =>
                            auth()->check() &&
                            auth()->user()->hasAnyRole(['jefe', 'ti', 'super_admin']) &&
                            in_array($record->estado, [
                                EstadoSolicitudEnum::PROGRAMADA,
                                EstadoSolicitudEnum::COMPLETADA,
                            ], true) &&
                            ! empty($record->vehiculo_id) &&
                            ! empty($record->motorista_id) &&
                            ! empty($record->decidido_por)
                        ),

                    Tables\Actions\Action::make('rechazar')
                        ->label('Rechazar')
                        ->color('danger')
                        ->icon('heroicon-o-x-circle')
                        ->form([
                            Forms\Components\Textarea::make('comentario_jefe')
                                ->label('Motivo del rechazo')
                                ->required(),
                        ])
                        ->action(function (SolicitudTransporte $record, array $data) {
                            $estadoAnterior = $record->estado;

                            $record->update([
                                'estado'          => EstadoSolicitudEnum::RECHAZADA,
                                'comentario_jefe' => $data['comentario_jefe'],
                                'decidido_por'    => auth()->id(),
                                'decidido_en'     => now(),
                            ]);

                            HistorialEstado::create([
                                'entidad_tipo'    => 'solicitud_transporte',
                                'entidad_id'      => $record->id,
                                'estado_anterior' => $estadoAnterior->value,
                                'estado_nuevo'    => EstadoSolicitudEnum::RECHAZADA->value,
                                'user_id'         => auth()->id(),
                                'comentario'      => $data['comentario_jefe'],
                            ]);
                        })
                        ->visible(fn (SolicitudTransporte $record) =>
                            auth()->check() && (
                                (
                                    auth()->user()->hasRole('operativo') &&
                                    in_array($record->estado, [
                                        EstadoSolicitudEnum::PENDIENTE,
                                        EstadoSolicitudEnum::EN_REVISION,
                                    ], true)
                                ) || (
                                    auth()->user()->hasRole('jefe') &&
                                    $record->estado === EstadoSolicitudEnum::PRE_APROBADA
                                )
                            )
                        ),

                ])
                ->label('Más')
                ->icon('heroicon-m-ellipsis-vertical'),
            ])
            ->bulkActions([]);
    }

    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery()
            ->with(['solicitante', 'unidad', 'autorizador', 'vehiculo.tipo', 'motorista']);

        $user = auth()->user();

        if ($user->hasAnyRole(['super_admin', 'ti'])) {
            return $query;
        }

        if ($user->hasAnyRole('operativo')) {
            $query->whereIn('estado', [
                EstadoSolicitudEnum::PENDIENTE->value,
                EstadoSolicitudEnum::EN_REVISION->value,
            ]);
        }

        if ($user->hasRole('jefe')) {
            $query->whereIn('estado', [
                EstadoSolicitudEnum::PRE_APROBADA->value,
                EstadoSolicitudEnum::APROBADA->value,
            ]);
        }

        if ($user->hasRole('liquidador')) {
            $query->whereIn('estado', [
                EstadoSolicitudEnum::ASIGNADA->value,
                EstadoSolicitudEnum::COMPLETADA->value,
            ]);
        }

        return $query;
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSolicitudTransportes::route('/'),
            'view'  => Pages\ViewSolicitudTransporte::route('/{record}'),
        ];
    }
}