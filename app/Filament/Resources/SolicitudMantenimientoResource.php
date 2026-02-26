<?php

namespace App\Filament\Resources;

// Imports para emails
use App\Mail\NotificacionEventMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use App\Filament\Resources\SolicitudMantenimientoResource\Pages;
use App\Models\SolicitudMantenimiento;
use App\Models\Vehiculo;
use App\Models\HistorialEstado;
use App\Models\BitacoraEvento;
use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class SolicitudMantenimientoResource extends Resource
{
    protected static ?string $model           = SolicitudMantenimiento::class;
    protected static ?string $navigationGroup = 'Aprobaciones';
    protected static ?string $navigationLabel = 'Solicitudes de Mantenimiento';
    protected static ?string $navigationIcon  = 'heroicon-o-wrench-screwdriver';
    protected static ?string $modelLabel      = 'Solicitud de Mantenimiento';
    protected static ?string $pluralModelLabel = 'Solicitudes de Mantenimiento';
    protected static ?int    $navigationSort  = 2;

    public static function canViewAny(): bool
    {
        return auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'solicitante']);
    }

    public static function canCreate(): bool        { return false; }
    public static function canEdit($record): bool   { return false; }
    public static function canDelete($record): bool { return false; }

    // ── FORM ────────────────────────────────────────────────

    public static function form(Form $form): Form
{
    return $form->schema([

        Forms\Components\Section::make('Resumen')
            ->schema([
                Forms\Components\Placeholder::make('codigo_ui')
                    ->label('Código')
                    ->content(fn (SolicitudMantenimiento $record) => $record->codigo ?? '-'),

                Forms\Components\Placeholder::make('solicitante_ui')
                    ->label('Solicitante')
                    ->content(fn (SolicitudMantenimiento $record) => $record->solicitante?->name ?? '-'),

                Forms\Components\Placeholder::make('vehiculo_ui')
                    ->label('Vehículo')
                    ->content(fn (SolicitudMantenimiento $record) =>
                        $record->vehiculo
                            ? "{$record->vehiculo->placa} — {$record->vehiculo->marca?->nombre} {$record->vehiculo->modelo?->nombre}"
                            : '-'
                    ),

                Forms\Components\Placeholder::make('tipo_mantenimiento_ui')
                    ->label('Tipo de Mantenimiento')
                    ->content(fn (SolicitudMantenimiento $record) => $record->tipoMantenimiento?->nombre ?? '-'),

                Forms\Components\Placeholder::make('tipo_solicitud_ui')
                    ->label('Tipo de Solicitud')
                    ->content(fn (SolicitudMantenimiento $record) => match ($record->tipo_solicitud) {
                        'taller'  => 'Taller',
                        'llantas' => 'Llantas',
                        default   => '-',
                    }),

                Forms\Components\Placeholder::make('prioridad_ui')
                    ->label('Prioridad')
                    ->content(fn (SolicitudMantenimiento $record) =>
                        $record->prioridad?->value ? strtoupper($record->prioridad->value) : '-'
                    ),

                Forms\Components\Placeholder::make('fecha_sugerida_ui')
                    ->label('Fecha Sugerida')
                    ->content(fn (SolicitudMantenimiento $record) =>
                        optional($record->fecha_sugerida)?->format('d/m/Y') ?? '-'
                    ),

                Forms\Components\Placeholder::make('estado_ui')
                    ->label('Estado')
                    ->content(fn (SolicitudMantenimiento $record) =>
                        $record->estado?->value ? strtoupper($record->estado->value) : '-'
                    ),
            ])
            ->columns(['default' => 1, 'sm' => 2, 'xl' => 4])
            ->compact(),

        Forms\Components\Section::make('Detalle del Servicio')
            ->schema([
                Forms\Components\Placeholder::make('detalle_ui')
                    ->label('')
                    ->content(fn (SolicitudMantenimiento $record) => $record->detalle ?? '-'),
            ])
            ->collapsible()
            ->collapsed(false)
            ->compact(),

        Forms\Components\Section::make('Costos')
            ->schema([
                Forms\Components\Placeholder::make('costo_estimado_ui')
                    ->label('Costo Estimado')
                    ->content(fn (SolicitudMantenimiento $record) =>
                        $record->costo_estimado ? '$' . number_format($record->costo_estimado, 2) : '-'
                    ),

                Forms\Components\Placeholder::make('costo_real_ui')
                    ->label('Costo Real')
                    ->content(fn (SolicitudMantenimiento $record) =>
                        $record->costo_real ? '$' . number_format($record->costo_real, 2) : 'Pendiente'
                    ),

                Forms\Components\Placeholder::make('fecha_realizada_ui')
                    ->label('Fecha Realizada')
                    ->content(fn (SolicitudMantenimiento $record) =>
                        optional($record->fecha_realizada)?->format('d/m/Y') ?? 'Pendiente'
                    ),
            ])
            ->columns(['default' => 1, 'md' => 3])
            ->collapsible()
            ->collapsed()
            ->compact(),

        Forms\Components\Section::make('Adjuntos')
            ->schema([
                Forms\Components\Placeholder::make('adjuntos_ui')
                    ->label('')
                    ->content(function (SolicitudMantenimiento $record) {
                        if (empty($record->adjuntos)) {
                            return 'Sin adjuntos registrados.';
                        }
                        $links = collect($record->adjuntos)->map(function ($path) {
                            $url  = asset('storage/' . $path);
                            $name = basename($path);
                            return "<a href='{$url}' target='_blank' class='text-primary-600 underline'>{$name}</a>";
                        })->join('<br>');
                        return new \Illuminate\Support\HtmlString($links);
                    }),
            ])
            ->collapsible()
            ->collapsed()
            ->compact(),

        Forms\Components\Section::make('Decisión / Auditoría')
            ->schema([
                Forms\Components\Placeholder::make('aprobador_ui')
                    ->label('Aprobado / Rechazado por')
                    ->content(fn (SolicitudMantenimiento $record) => $record->aprobador?->name ?? '-'),

                Forms\Components\Placeholder::make('fecha_aprobacion_ui')
                    ->label('Fecha de Decisión')
                    ->content(fn (SolicitudMantenimiento $record) =>
                        optional($record->fecha_aprobacion)?->format('d/m/Y H:i') ?? '-'
                    ),

                Forms\Components\Placeholder::make('motivo_rechazo_ui')
                    ->label('Motivo de Rechazo')
                    ->content(fn (SolicitudMantenimiento $record) => $record->motivo_rechazo ?? '-')
                    ->columnSpanFull(),

                Forms\Components\Placeholder::make('observaciones_ui')
                    ->label('Observaciones')
                    ->content(fn (SolicitudMantenimiento $record) => $record->observaciones ?? '-')
                    ->columnSpanFull(),
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
                    ->default(function (SolicitudMantenimiento $record) {
                        return HistorialEstado::query()
                            ->where('entidad_tipo', 'solicitud_mantenimiento')
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

    // ── TABLE ───────────────────────────────────────────────

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->contentGrid([
                'default' => 1,
                'md'      => 2,
                'xl'      => 3,
            ])
            ->recordUrl(fn (SolicitudMantenimiento $record) => static::getUrl('view', ['record' => $record]))
            ->columns([
                Tables\Columns\TextColumn::make('codigo')
                    ->label('Código')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->fontFamily('mono')
                    ->copyable(),

                Tables\Columns\TextColumn::make('vehiculo.placa')
                    ->label('Vehículo')
                    ->description(fn ($record) =>
                        trim("{$record->vehiculo?->marca?->nombre} {$record->vehiculo?->modelo?->nombre}")
                    )
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('tipoMantenimiento.nombre')
                    ->label('Tipo')
                    ->badge()
                    ->color('info'),

                Tables\Columns\TextColumn::make('tipo_solicitud')
                    ->label('Solicitud')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'taller'  => 'warning',
                        'llantas' => 'info',
                        default   => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'taller'  => 'Taller',
                        'llantas' => 'Llantas',
                        default   => $state,
                    }),

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

                Tables\Columns\TextColumn::make('fecha_sugerida')
                    ->label('Fecha Sugerida')
                    ->date('d/m/Y')
                    ->sortable(),

                Tables\Columns\TextColumn::make('solicitante.name')
                    ->label('Solicitante')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('costo_estimado')
                    ->label('Estimado')
                    ->money('USD')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('costo_real')
                    ->label('Costo Real')
                    ->money('USD')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('estado')
                    ->label('Estado')
                    ->badge()
                    ->formatStateUsing(fn (EstadoSolicitudEnum $state): string => match ($state) {
                        EstadoSolicitudEnum::BORRADOR     => 'Borrador',
                        EstadoSolicitudEnum::PENDIENTE    => 'Pendiente',
                        EstadoSolicitudEnum::EN_REVISION  => 'En Revisión',
                        EstadoSolicitudEnum::PRE_APROBADA => 'Pre-Aprobada',
                        EstadoSolicitudEnum::APROBADA     => 'Aprobada',
                        EstadoSolicitudEnum::RECHAZADA    => 'Rechazada',
                        EstadoSolicitudEnum::EN_EJECUCION => 'En Ejecución',
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
                        EstadoSolicitudEnum::EN_EJECUCION => 'primary',
                        EstadoSolicitudEnum::COMPLETADA   => 'success',
                        EstadoSolicitudEnum::CANCELADA    => 'gray',
                        default                           => 'gray',
                    })
                    ->sortable(),

                Tables\Columns\IconColumn::make('tiene_adjuntos')
                    ->label('Adjuntos')
                    ->boolean()
                    ->getStateUsing(fn ($record) => $record->tieneAdjuntos())
                    ->trueIcon('heroicon-o-paper-clip')
                    ->falseIcon('heroicon-o-minus')
                    ->trueColor('success')
                    ->falseColor('gray'),

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
                        EstadoSolicitudEnum::EN_REVISION->value  => 'En Revisión',
                        EstadoSolicitudEnum::APROBADA->value     => 'Aprobada',
                        EstadoSolicitudEnum::RECHAZADA->value    => 'Rechazada',
                        EstadoSolicitudEnum::EN_EJECUCION->value => 'En Ejecución',
                        EstadoSolicitudEnum::COMPLETADA->value   => 'Completada',
                        EstadoSolicitudEnum::CANCELADA->value    => 'Cancelada',
                    ]),

                Tables\Filters\SelectFilter::make('prioridad')
                    ->options([
                        PrioridadSolicitudEnum::BAJA->value  => 'Baja',
                        PrioridadSolicitudEnum::MEDIA->value => 'Media',
                        PrioridadSolicitudEnum::ALTA->value  => 'Alta',
                    ]),

                Tables\Filters\SelectFilter::make('tipo_solicitud')
                    ->label('Tipo')
                    ->options([
                        'taller'  => 'Taller',
                        'llantas' => 'Llantas',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),

                Tables\Actions\ActionGroup::make([

                    // Observación
                    Tables\Actions\Action::make('observacion')
                        ->label('Observación')
                        ->icon('heroicon-o-chat-bubble-left-ellipsis')
                        ->modalHeading('Agregar Observación')
                        ->modalSubmitActionLabel('Guardar Observación')
                        ->form([
                            Forms\Components\Textarea::make('observaciones')
                                ->label('Observación')
                                ->rows(4)
                                ->required()
                                ->maxLength(2000),
                        ])
                        ->action(function (SolicitudMantenimiento $record, array $data) {
                            $estadoAnterior = $record->estado;
                            $record->observaciones = $data['observaciones'];
                            if ($record->estado === EstadoSolicitudEnum::PENDIENTE) {
                                $record->estado = EstadoSolicitudEnum::EN_REVISION;
                            }
                            $record->save();

                            if ($estadoAnterior !== $record->estado) {
                                HistorialEstado::create([
                                    'entidad_tipo'    => 'solicitud_mantenimiento',
                                    'entidad_id'      => $record->id,
                                    'estado_anterior' => $estadoAnterior?->value,
                                    'estado_nuevo'    => $record->estado?->value,
                                    'user_id'         => auth()->id(),
                                    'comentario'      => $data['observaciones'],
                                ]);
                            }

                            BitacoraEvento::create([
                                'entidad_tipo' => 'solicitud_mantenimiento',
                                'entidad_id'   => $record->id,
                                'accion'       => AccionBitacoraEnum::OBSERVAR->value,
                                'user_id'      => auth()->id(),
                                'datos_extras' => ['comentario' => $data['observaciones']],
                            ]);
                        })
                        ->visible(fn (SolicitudMantenimiento $record) =>
                            auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                            in_array($record->estado, [
                                EstadoSolicitudEnum::PENDIENTE,
                                EstadoSolicitudEnum::EN_REVISION,
                            ], true)
                        ),

                    // Pre-Aprobar
                    Tables\Actions\Action::make('pre_aprobar')
                        ->label('Pre-Aprobar')
                        ->color('warning')
                        ->icon('heroicon-o-clock')
                        ->requiresConfirmation()
                        ->modalHeading('Pre-aprobar Solicitud de Mantenimiento')
                        ->action(function (SolicitudMantenimiento $record) {
                            $estadoAnterior = $record->estado;
                            $record->estado = EstadoSolicitudEnum::PRE_APROBADA;
                            $record->save();

                            HistorialEstado::create([
                                'entidad_tipo'    => 'solicitud_mantenimiento',
                                'entidad_id'      => $record->id,
                                'estado_anterior' => $estadoAnterior?->value,
                                'estado_nuevo'    => $record->estado?->value,
                                'user_id'         => auth()->id(),
                                'comentario'      => 'Solicitud pre-aprobada.',
                            ]);

                            BitacoraEvento::create([
                                'entidad_tipo' => 'solicitud_mantenimiento',
                                'entidad_id'   => $record->id,
                                'accion'       => 'PRE_APROBAR',
                                'user_id'      => auth()->id(),
                            ]);
                        })
                        ->visible(fn (SolicitudMantenimiento $record) =>
                            auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                            in_array($record->estado, [
                                EstadoSolicitudEnum::PENDIENTE,
                                EstadoSolicitudEnum::EN_REVISION,
                            ], true)
                        ),

                    // Aprobar
                    Tables\Actions\Action::make('aprobar')
                        ->label('Aprobar')
                        ->color('success')
                        ->icon('heroicon-o-check-circle')
                        ->modalHeading('Aprobar Solicitud de Mantenimiento')
                        ->form([
                            Forms\Components\Textarea::make('observaciones')
                                ->label('Observaciones de aprobación')
                                ->rows(3)
                                ->required()
                                ->maxLength(2000)
                                ->columnSpanFull(),
                        ])
                        ->action(function (SolicitudMantenimiento $record, array $data) {
                            $estadoAnterior = $record->estado;

                            $record->update([
                                'estado'           => EstadoSolicitudEnum::APROBADA,
                                'observaciones'    => $data['observaciones'],
                                'aprobador_id'     => auth()->id(),
                                'fecha_aprobacion' => now(),
                            ]);

                            HistorialEstado::create([
                                'entidad_tipo'    => 'solicitud_mantenimiento',
                                'entidad_id'      => $record->id,
                                'estado_anterior' => $estadoAnterior?->value,
                                'estado_nuevo'    => EstadoSolicitudEnum::APROBADA->value,
                                'user_id'         => auth()->id(),
                                'comentario'      => $data['observaciones'],
                            ]);

                            BitacoraEvento::create([
                                'entidad_tipo' => 'solicitud_mantenimiento',
                                'entidad_id'   => $record->id,
                                'accion'       => AccionBitacoraEnum::APROBAR->value,
                                'user_id'      => auth()->id(),
                                'datos_extras' => ['observaciones' => $data['observaciones']],
                            ]);

                            try {
                                $payload = [
                                    'tipo'    => 'mantenimiento',
                                    'evento'  => 'solicitud_aprobada',
                                    'mensaje' => 'Tu solicitud de mantenimiento ha sido APROBADA.',
                                    'solicitud' => [
                                        'codigo'            => $record->codigo,
                                        'estado'            => 'aprobada',
                                        'tipo_mantenimiento'=> $record->tipoMantenimiento?->nombre,
                                        'tipo_solicitud'    => $record->tipo_solicitud,
                                        'vehiculo_placa'    => $record->vehiculo?->placa,
                                        'fecha_sugerida'    => optional($record->fecha_sugerida)?->format('d/m/Y'),
                                        'detalle'           => $record->detalle,
                                    ],
                                    'solicitante' => [
                                        'name'  => $record->solicitante?->name,
                                        'email' => $record->solicitante?->email,
                                    ],
                                    'timestamp' => now()->format(\DateTimeInterface::ATOM),
                                ];

                                Mail::to($record->solicitante->email)->send(
                                    new NotificacionEventMail('✅ Solicitud de Mantenimiento APROBADA', $payload)
                                );
                            } catch (\Exception $e) {
                                Log::error('Error enviando correo de aprobación mantenimiento: ' . $e->getMessage());
                            }
                        })
                        ->visible(fn (SolicitudMantenimiento $record) =>
                            auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                            $record->estado === EstadoSolicitudEnum::PRE_APROBADA
                        ),

                    // Rechazar
                    Tables\Actions\Action::make('rechazar')
                        ->label('Rechazar')
                        ->color('danger')
                        ->icon('heroicon-o-x-circle')
                        ->form([
                            Forms\Components\Textarea::make('motivo_rechazo')
                                ->label('Motivo del rechazo')
                                ->rows(3)
                                ->required(),
                        ])
                        ->action(function (SolicitudMantenimiento $record, array $data) {
                            $estadoAnterior = $record->estado;

                            $record->update([
                                'estado'           => EstadoSolicitudEnum::RECHAZADA,
                                'motivo_rechazo'   => $data['motivo_rechazo'],
                                'aprobador_id'     => auth()->id(),
                                'fecha_aprobacion' => now(),
                            ]);

                            HistorialEstado::create([
                                'entidad_tipo'    => 'solicitud_mantenimiento',
                                'entidad_id'      => $record->id,
                                'estado_anterior' => $estadoAnterior?->value,
                                'estado_nuevo'    => EstadoSolicitudEnum::RECHAZADA->value,
                                'user_id'         => auth()->id(),
                                'comentario'      => $data['motivo_rechazo'],
                            ]);

                            BitacoraEvento::create([
                                'entidad_tipo' => 'solicitud_mantenimiento',
                                'entidad_id'   => $record->id,
                                'accion'       => AccionBitacoraEnum::RECHAZAR->value,
                                'user_id'      => auth()->id(),
                                'datos_extras' => ['motivo' => $data['motivo_rechazo']],
                            ]);

                            try {
                                $payload = [
                                    'tipo'    => 'mantenimiento',
                                    'evento'  => 'solicitud_rechazada',
                                    'mensaje' => 'Tu solicitud de mantenimiento ha sido RECHAZADA.',
                                    'solicitud' => [
                                        'codigo'         => $record->codigo,
                                        'estado'         => 'rechazada',
                                        'vehiculo_placa' => $record->vehiculo?->placa,
                                        'motivo_rechazo' => $data['motivo_rechazo'],
                                    ],
                                    'solicitante' => [
                                        'name'  => $record->solicitante?->name,
                                        'email' => $record->solicitante?->email,
                                    ],
                                    'timestamp' => now()->format(\DateTimeInterface::ATOM),
                                ];

                                Mail::to($record->solicitante->email)->send(
                                    new NotificacionEventMail('❌ Solicitud de Mantenimiento RECHAZADA', $payload)
                                );
                            } catch (\Exception $e) {
                                Log::error('Error enviando correo de rechazo mantenimiento: ' . $e->getMessage());
                            }
                        })
                        ->visible(fn (SolicitudMantenimiento $record) =>
                            auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                            in_array($record->estado, [
                                EstadoSolicitudEnum::PENDIENTE,
                                EstadoSolicitudEnum::EN_REVISION,
                                EstadoSolicitudEnum::PRE_APROBADA,
                            ], true)
                        ),

                    // Iniciar ejecución
                    Tables\Actions\Action::make('en_ejecucion')
                        ->label('Iniciar Ejecución')
                        ->color('warning')
                        ->icon('heroicon-o-play-circle')
                        ->requiresConfirmation()
                        ->modalHeading('¿Marcar como En Ejecución?')
                        ->action(function (SolicitudMantenimiento $record) {
                            $estadoAnterior = $record->estado;

                            $record->update(['estado' => EstadoSolicitudEnum::EN_EJECUCION]);

                            HistorialEstado::create([
                                'entidad_tipo'    => 'solicitud_mantenimiento',
                                'entidad_id'      => $record->id,
                                'estado_anterior' => $estadoAnterior?->value,
                                'estado_nuevo'    => EstadoSolicitudEnum::EN_EJECUCION->value,
                                'user_id'         => auth()->id(),
                                'comentario'      => 'Mantenimiento iniciado.',
                            ]);

                            BitacoraEvento::create([
                                'entidad_tipo' => 'solicitud_mantenimiento',
                                'entidad_id'   => $record->id,
                                'accion'       => 'EN_EJECUCION',
                                'user_id'      => auth()->id(),
                            ]);
                        })
                        ->visible(fn (SolicitudMantenimiento $record) =>
                            auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                            $record->estado === EstadoSolicitudEnum::APROBADA
                        ),

                    // Completar (requiere adjuntos)
                    Tables\Actions\Action::make('completar')
                        ->label('Completar')
                        ->color('success')
                        ->icon('heroicon-o-check-badge')
                        ->modalHeading('Completar Solicitud de Mantenimiento')
                        ->modalDescription('Asegúrate de haber subido la factura antes de completar.')
                        ->form([
                            Forms\Components\DatePicker::make('fecha_realizada')
                                ->label('Fecha Realizada')
                                ->required()
                                ->default(now()),

                            Forms\Components\TextInput::make('costo_real')
                                ->label('Costo Real')
                                ->numeric()
                                ->prefix('$')
                                ->required(),

                            Forms\Components\FileUpload::make('adjuntos')
                                ->label('Adjuntos (Facturas, Fotos)')
                                ->multiple()
                                ->disk('public')
                                ->directory('mantenimiento/adjuntos')
                                ->acceptedFileTypes(['image/jpeg', 'image/png', 'application/pdf'])
                                ->maxSize(5120)
                                ->columnSpanFull(),
                        ])
                        ->action(function (SolicitudMantenimiento $record, array $data) {
                            // Validar que se subieron adjuntos
                            if (empty($data['adjuntos']) && !$record->tieneAdjuntos()) {
                                \Filament\Notifications\Notification::make()
                                    ->title('No se puede completar')
                                    ->body('Debes subir al menos una factura o foto antes de completar.')
                                    ->danger()
                                    ->send();
                                return;
                            }

                            $estadoAnterior = $record->estado;

                            $adjuntosExistentes = $record->adjuntos ?? [];
                            $nuevosAdjuntos     = $data['adjuntos'] ?? [];
                            $todosAdjuntos      = array_merge($adjuntosExistentes, $nuevosAdjuntos);

                            $record->update([
                                'estado'          => EstadoSolicitudEnum::COMPLETADA,
                                'fecha_realizada' => $data['fecha_realizada'],
                                'costo_real'      => $data['costo_real'],
                                'adjuntos'        => $todosAdjuntos,
                            ]);

                            HistorialEstado::create([
                                'entidad_tipo'    => 'solicitud_mantenimiento',
                                'entidad_id'      => $record->id,
                                'estado_anterior' => $estadoAnterior?->value,
                                'estado_nuevo'    => EstadoSolicitudEnum::COMPLETADA->value,
                                'user_id'         => auth()->id(),
                                'comentario'      => 'Mantenimiento completado. Costo real: $' . number_format($data['costo_real'], 2),
                            ]);

                            BitacoraEvento::create([
                                'entidad_tipo' => 'solicitud_mantenimiento',
                                'entidad_id'   => $record->id,
                                'accion'       => AccionBitacoraEnum::COMPLETAR->value,
                                'user_id'      => auth()->id(),
                                'datos_extras' => [
                                    'costo_real'      => $data['costo_real'],
                                    'fecha_realizada' => $data['fecha_realizada'],
                                ],
                            ]);

                            try {
                                $payload = [
                                    'tipo'    => 'mantenimiento',
                                    'evento'  => 'solicitud_completada',
                                    'mensaje' => 'Tu solicitud de mantenimiento ha sido COMPLETADA.',
                                    'solicitud' => [
                                        'codigo'          => $record->codigo,
                                        'estado'          => 'completada',
                                        'vehiculo_placa'  => $record->vehiculo?->placa,
                                        'fecha_realizada' => optional($record->fecha_realizada)?->format('d/m/Y'),
                                        'costo_real'      => '$' . number_format($data['costo_real'], 2),
                                    ],
                                    'solicitante' => [
                                        'name'  => $record->solicitante?->name,
                                        'email' => $record->solicitante?->email,
                                    ],
                                    'timestamp' => now()->format(\DateTimeInterface::ATOM),
                                ];

                                Mail::to($record->solicitante->email)->send(
                                    new NotificacionEventMail('✅ Solicitud de Mantenimiento COMPLETADA', $payload)
                                );
                            } catch (\Exception $e) {
                                Log::error('Error enviando correo de completado mantenimiento: ' . $e->getMessage());
                            }
                        })
                        ->visible(fn (SolicitudMantenimiento $record) =>
                            auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                            $record->estado === EstadoSolicitudEnum::EN_EJECUCION
                        ),

                    // Cancelar
                    Tables\Actions\Action::make('cancelar')
                        ->label('Cancelar')
                        ->color('gray')
                        ->icon('heroicon-o-trash')
                        ->requiresConfirmation()
                        ->modalHeading('¿Cancelar esta solicitud?')
                        ->action(function (SolicitudMantenimiento $record) {
                            $estadoAnterior = $record->estado;

                            $record->update(['estado' => EstadoSolicitudEnum::CANCELADA]);

                            HistorialEstado::create([
                                'entidad_tipo'    => 'solicitud_mantenimiento',
                                'entidad_id'      => $record->id,
                                'estado_anterior' => $estadoAnterior?->value,
                                'estado_nuevo'    => EstadoSolicitudEnum::CANCELADA->value,
                                'user_id'         => auth()->id(),
                                'comentario'      => 'Solicitud cancelada.',
                            ]);

                            BitacoraEvento::create([
                                'entidad_tipo' => 'solicitud_mantenimiento',
                                'entidad_id'   => $record->id,
                                'accion'       => AccionBitacoraEnum::CANCELAR->value,
                                'user_id'      => auth()->id(),
                            ]);
                        })
                        ->visible(fn (SolicitudMantenimiento $record) =>
                            in_array($record->estado, [
                                EstadoSolicitudEnum::BORRADOR,
                                EstadoSolicitudEnum::PENDIENTE,
                            ], true)
                        ),

                ])
                ->label('Más')
                ->icon('heroicon-m-ellipsis-vertical'),
            ])
            ->bulkActions([]);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->with([
                'vehiculo.marca',
                'vehiculo.modelo',
                'tipoMantenimiento',
                'solicitante',
                'aprobador',
            ]);

           if (auth()->check() && auth()->user()->hasRole('solicitante')) {
                $query->where('solicitante_id', auth()->id());
        }

        return $query;     
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListSolicitudMantenimientos::route('/'),
          //  'create' => Pages\CreateSolicitudMantenimiento::route('/create'),
            'view'   => Pages\ViewSolicitudMantenimiento::route('/{record}'),
        ];
    }
}