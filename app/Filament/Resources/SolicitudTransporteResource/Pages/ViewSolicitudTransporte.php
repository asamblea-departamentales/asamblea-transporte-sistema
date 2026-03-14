<?php

namespace App\Filament\Resources\SolicitudTransporteResource\Pages;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Filament\Resources\SolicitudTransporteResource;
use App\Mail\NotificacionEventMail;
use App\Models\BitacoraEvento;
use App\Models\HistorialEstado;
use App\Models\SolicitudTransporte;
use Filament\Actions;
use Filament\Forms;
use Filament\Resources\Pages\ViewRecord;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ViewSolicitudTransporte extends ViewRecord
{
    protected static string $resource = SolicitudTransporteResource::class;

    protected function getHeaderActions(): array
    {
        return [

            // ── OBSERVACIÓN ───────────────────────────────────────────────
            Actions\Action::make('observacion')
                ->button()
                ->size('lg')
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
                    auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    in_array($record->estado, [
                        EstadoSolicitudEnum::PENDIENTE,
                        EstadoSolicitudEnum::EN_REVISION,
                    ], true)
                ),

            // ── PRE-APROBAR ───────────────────────────────────────────────
            Actions\Action::make('pre_aprobar')
                ->button()
                ->size('lg')
                ->label('Pre-Aprobar')
                ->color('warning')
                ->icon('heroicon-o-clock')
                ->requiresConfirmation()
                ->modalHeading('Pre-aprobar Solicitud')
                ->modalDescription('¿Desea marcar esta solicitud como pre-aprobada?')
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

                    // FIX #3: Usar Enum en lugar de string literal
                    BitacoraEvento::create([
                        'entidad_tipo' => 'solicitud_transporte',
                        'entidad_id'   => $record->id,
                        'accion'       => AccionBitacoraEnum::PRE_APROBAR->value,
                        'user_id'      => auth()->id(),
                    ]);
                })
                ->visible(fn (SolicitudTransporte $record) =>
                    auth()->check() &&
                    auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    in_array($record->estado, [
                        EstadoSolicitudEnum::PENDIENTE,
                        EstadoSolicitudEnum::EN_REVISION,
                    ], true)
                ),

            // ── APROBAR / PROGRAMAR ───────────────────────────────────────
            Actions\Action::make('aprobar')
                ->button()
                ->size('lg')
                ->label('Programar y Aprobar')
                ->color('success')
                ->icon('heroicon-o-check-circle')
                ->modalHeading('Programar Solicitud')
                ->modalSubmitActionLabel('Programar')
                ->modalWidth('2xl')
                ->form([
                    Forms\Components\Textarea::make('comentario_jefe')
                        ->label('Motivo de la programación')
                        ->rows(4)
                        ->required()
                        ->maxLength(2000)
                        ->columnSpanFull(),

                    Forms\Components\Section::make('Asignación de Vehículo y Motorista')
                        ->schema([
                            Forms\Components\Select::make('vehiculo_id')
                                ->label('Vehículo a Asignar')
                                ->options(function () {
                                    // FIX #4: filtra vehículos ocupados por solapamiento de fechas
                                    $record = $this->record;

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
                                        ->with('tipo')
                                        ->get()
                                        ->mapWithKeys(fn ($v) => [
                                            $v->id => "{$v->placa} - {$v->tipo->nombre}"
                                        ]);
                                })
                                ->hint('Solicitó: ' . ($this->record->tipo_vehiculo_nombre ?? 'N/A'))
                                ->hintColor('warning')
                                ->searchable()
                                ->required()
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

                            // FIX #6: hint de advertencia si el vehículo no tiene motorista
                            Forms\Components\Placeholder::make('motorista_nombre')
                                ->label('Motorista Asignado')
                                ->content(fn ($get) => $get('motorista_nombre') ?? 'Selecciona un vehículo primero')
                                ->hint(fn ($get) => ! $get('motorista_id') ? '⚠ Este vehículo no tiene motorista asignado' : null)
                                ->hintColor('danger'),
                        ])
                        ->columns(['default' => 1, 'md' => 2]),
                ])
                ->action(function (SolicitudTransporte $record, array $data) {
                    $estadoAnterior = $record->estado;

                    // FIX #2: estado unificado — guarda PROGRAMADA igual que el resource
                    $record->estado          = EstadoSolicitudEnum::PROGRAMADA;
                    $record->vehiculo_id     = $data['vehiculo_id'];
                    $record->motorista_id    = $data['motorista_id'];
                    $record->comentario_jefe = $data['comentario_jefe'];
                    $record->decidido_por    = auth()->id();
                    $record->decidido_en     = now();
                    $record->save();

                    HistorialEstado::create([
                        'entidad_tipo'    => 'solicitud_transporte',
                        'entidad_id'      => $record->id,
                        'estado_anterior' => $estadoAnterior?->value,
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
                        $record->load(['vehiculo.tipo', 'motorista', 'solicitante', 'unidad']);

                        $payload = [
                            'tipo'    => 'transporte',
                            'evento'  => 'solicitud_aprobada',
                            'mensaje' => 'Tu solicitud de transporte ha sido APROBADA y programada exitosamente.',
                            'solicitud' => [
                                'codigo'               => $record->codigo,
                                'estado'               => 'aprobada',
                                'tipo_vehiculo_nombre' => $record->vehiculo?->tipo?->nombre ?? 'No asignado',
                                'cantidad_personas'    => $record->cantidad_personas,
                                'origen'               => $record->origen,
                                'destino'              => $record->destino,
                                'destino_adicional'    => $record->destino_adicional,
                                'fecha_salida'         => $record->fecha_salida,
                                'fecha_retorno'        => $record->fecha_retorno,
                                'motivo_actividad'     => $record->motivo_actividad,
                                'vehiculo_placa'       => $record->vehiculo?->placa ?? 'N/A',
                                'motorista_nombre'     => $record->motorista?->nombre ?? 'N/A',
                            ],
                            'solicitante' => [
                                'name'  => $record->solicitante->name,
                                'email' => $record->solicitante->email,
                                'unidad' => [
                                    'nombre' => $record->unidad?->nombre ?? 'N/A',
                                    'siglas' => $record->unidad?->siglas ?? 'N/A',
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
                    auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    $record->estado === EstadoSolicitudEnum::PRE_APROBADA
                ),

            // ── ASIGNAR TRANSPORTE ────────────────────────────────────────
            // FIX #1: action agregado — aparece cuando la solicitud ya está APROBADA
            Actions\Action::make('asignar_transporte')
                ->button()
                ->size('lg')
                ->label('Asignar Transporte')
                ->color('info')
                ->icon('heroicon-o-truck')
                ->modalHeading('Asignar Vehículo y Motorista')
                ->modalSubmitActionLabel('Asignar')
                ->form([
                    Forms\Components\Select::make('vehiculo_id')
                        ->label('Vehículo')
                        ->options(function () {
                            // Mismo filtro de solapamiento que en 'aprobar'
                            $record = $this->record;

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
                                ->with('tipo')
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
                })
                ->visible(fn (SolicitudTransporte $record) =>
                    auth()->check() &&
                    auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    $record->estado === EstadoSolicitudEnum::APROBADA
                ),

            // ── RECHAZAR ──────────────────────────────────────────────────
            Actions\Action::make('rechazar')
                ->button()
                ->size('lg')
                ->label('Rechazar')
                ->color('danger')
                ->icon('heroicon-o-x-circle')
                ->modalHeading('Rechazar Solicitud')
                ->modalSubmitActionLabel('Rechazar')
                ->form([
                    Forms\Components\Textarea::make('comentario_jefe')
                        ->label('Motivo del rechazo')
                        ->rows(4)
                        ->required()
                        ->maxLength(2000),
                ])
                ->action(function (SolicitudTransporte $record, array $data) {
                    $estadoAnterior = $record->estado;

                    $record->estado          = EstadoSolicitudEnum::RECHAZADA;
                    $record->comentario_jefe = $data['comentario_jefe'];
                    $record->decidido_por    = auth()->id();
                    $record->decidido_en     = now();
                    $record->save();

                    HistorialEstado::create([
                        'entidad_tipo'    => 'solicitud_transporte',
                        'entidad_id'      => $record->id,
                        'estado_anterior' => $estadoAnterior?->value,
                        'estado_nuevo'    => $record->estado?->value,
                        'user_id'         => auth()->id(),
                        'comentario'      => $data['comentario_jefe'],
                    ]);

                    BitacoraEvento::create([
                        'entidad_tipo' => 'solicitud_transporte',
                        'entidad_id'   => $record->id,
                        'accion'       => AccionBitacoraEnum::RECHAZAR->value,
                        'user_id'      => auth()->id(),
                        'datos_extras' => ['comentario' => $data['comentario_jefe']],
                    ]);

                    try {
                        $record->load(['solicitante', 'unidad']);

                        $payload = [
                            'tipo'    => 'transporte',
                            'evento'  => 'solicitud_rechazada',
                            'mensaje' => 'Tu solicitud de transporte ha sido RECHAZADA.',
                            'solicitud' => [
                                'codigo'           => $record->codigo,
                                'estado'           => 'rechazada',
                                'origen'           => $record->origen,
                                'destino'          => $record->destino,
                                'fecha_salida'     => $record->fecha_salida,
                                'motivo_actividad' => $record->motivo_actividad,
                                'comentario_jefe'  => $data['comentario_jefe'],
                            ],
                            'solicitante' => [
                                'name'  => $record->solicitante->name,
                                'email' => $record->solicitante->email,
                                'unidad' => [
                                    'nombre' => $record->unidad?->nombre ?? 'N/A',
                                    'siglas' => $record->unidad?->siglas ?? 'N/A',
                                ],
                            ],
                            'timestamp' => now()->format(\DateTimeInterface::ATOM),
                        ];

                        Mail::to($record->solicitante->email)->send(
                            new NotificacionEventMail('❌ Solicitud de Transporte RECHAZADA', $payload)
                        );
                    } catch (\Exception $e) {
                        Log::error('Error enviando correo de rechazo: ' . $e->getMessage());
                    }
                })
                // FIX #5: verificar rol además de estado
                ->visible(fn (SolicitudTransporte $record) =>
                    auth()->check() &&
                    auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    in_array($record->estado, [
                        EstadoSolicitudEnum::PENDIENTE,
                        EstadoSolicitudEnum::EN_REVISION,
                        EstadoSolicitudEnum::PRE_APROBADA,
                    ], true)
                ),

        ];
    }

    protected function canCreate(): bool
    {
        return false;
    }
}