<?php

namespace App\Filament\Resources\SolicitudMantenimientoResource\Pages;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Filament\Resources\SolicitudMantenimientoResource;
use App\Mail\NotificacionEventMail;
use App\Models\BitacoraEvento;
use App\Models\HistorialEstado;
use App\Models\SolicitudMantenimiento;
use Filament\Actions;
use Filament\Forms;
use Filament\Resources\Pages\ViewRecord;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ViewSolicitudMantenimiento extends ViewRecord
{
    protected static string $resource = SolicitudMantenimientoResource::class;

    protected function getHeaderActions(): array
    {
        return [

            // OBSERVACIÓN
            Actions\Action::make('observacion')
                ->button()
                ->size('lg')
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

            // PRE-APROBAR
            Actions\Action::make('pre_aprobar')
                ->button()
                ->size('lg')
                ->label('Pre-Aprobar')
                ->color('warning')
                ->icon('heroicon-o-clock')
                ->requiresConfirmation()
                ->modalHeading('Pre-aprobar Solicitud de Mantenimiento')
                ->modalDescription('¿Desea marcar esta solicitud como pre-aprobada?')
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

            // APROBAR
            Actions\Action::make('aprobar')
                ->button()
                ->size('lg')
                ->label('Aprobar')
                ->color('success')
                ->icon('heroicon-o-check-circle')
                ->modalHeading('Aprobar Solicitud de Mantenimiento')
                ->modalSubmitActionLabel('Aprobar')
                ->form([
                    Forms\Components\Textarea::make('observaciones')
                        ->label('Observaciones de aprobación')
                        ->rows(4)
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
                        $record->load(['vehiculo', 'tipoMantenimiento', 'solicitante']);

                        $payload = [
                            'tipo'    => 'mantenimiento',
                            'evento'  => 'solicitud_aprobada',
                            'mensaje' => 'Tu solicitud de mantenimiento ha sido APROBADA.',
                            'solicitud' => [
                                'codigo'             => $record->codigo,
                                'estado'             => 'aprobada',
                                'tipo_mantenimiento' => $record->tipoMantenimiento?->nombre,
                                'tipo_solicitud'     => $record->tipo_solicitud,
                                'vehiculo_placa'     => $record->vehiculo?->placa,
                                'fecha_sugerida'     => optional($record->fecha_sugerida)?->format('d/m/Y'),
                                'detalle'            => $record->detalle,
                                'observaciones'      => $data['observaciones'],
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
                        Log::error('Error enviando correo aprobación mantenimiento: ' . $e->getMessage());
                    }
                })
                ->visible(fn (SolicitudMantenimiento $record) =>
                    auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    $record->estado === EstadoSolicitudEnum::PRE_APROBADA
                ),

            // RECHAZAR
            Actions\Action::make('rechazar')
                ->button()
                ->size('lg')
                ->label('Rechazar')
                ->color('danger')
                ->icon('heroicon-o-x-circle')
                ->modalHeading('Rechazar Solicitud de Mantenimiento')
                ->modalSubmitActionLabel('Rechazar')
                ->form([
                    Forms\Components\Textarea::make('motivo_rechazo')
                        ->label('Motivo del rechazo')
                        ->rows(4)
                        ->required()
                        ->maxLength(2000),
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
                        $record->load(['vehiculo', 'solicitante']);

                        $payload = [
                            'tipo'    => 'mantenimiento',
                            'evento'  => 'solicitud_rechazada',
                            'mensaje' => 'Tu solicitud de mantenimiento ha sido RECHAZADA.',
                            'solicitud' => [
                                'codigo'         => $record->codigo,
                                'estado'         => 'rechazada',
                                'vehiculo_placa' => $record->vehiculo?->placa,
                                'detalle'        => $record->detalle,
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
                        Log::error('Error enviando correo rechazo mantenimiento: ' . $e->getMessage());
                    }
                })
                ->visible(fn (SolicitudMantenimiento $record) =>
                    in_array($record->estado, [
                        EstadoSolicitudEnum::PENDIENTE,
                        EstadoSolicitudEnum::EN_REVISION,
                        EstadoSolicitudEnum::PRE_APROBADA,
                    ], true)
                ),

            // INICIAR EJECUCIÓN
            Actions\Action::make('en_ejecucion')
                ->button()
                ->size('lg')
                ->label('Iniciar Ejecución')
                ->color('warning')
                ->icon('heroicon-o-play-circle')
                ->requiresConfirmation()
                ->modalHeading('¿Marcar como En Ejecución?')
                ->modalDescription('Confirma que el mantenimiento ha iniciado.')
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

            // CANCELAR
            Actions\Action::make('cancelar')
                ->button()
                ->size('lg')
                ->label('Cancelar')
                ->color('gray')
                ->icon('heroicon-o-trash')
                ->requiresConfirmation()
                ->modalHeading('¿Cancelar esta solicitud?')
                ->modalDescription('Esta acción no se puede deshacer.')
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
        ];
    }

    protected function canCreate(): bool
    {
        return false;
    }
}