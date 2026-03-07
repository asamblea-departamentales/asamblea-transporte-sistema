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
            })
            ->visible(fn (SolicitudMantenimiento $record) =>
                auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                $record->estado === EstadoSolicitudEnum::PRE_APROBADA
            ),

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
            })
            ->visible(fn (SolicitudMantenimiento $record) =>
                in_array($record->estado, [
                    EstadoSolicitudEnum::PENDIENTE,
                    EstadoSolicitudEnum::EN_REVISION,
                    EstadoSolicitudEnum::PRE_APROBADA,
                ], true)
            ),

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

        Actions\ActionGroup::make([
            Actions\Action::make('observacion')
                ->label('Observación')
                ->icon('heroicon-o-chat-bubble-left-ellipsis')
                ->color('gray')
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

            Actions\Action::make('cancelar')
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
        ])
            ->label('Más acciones')
            ->icon('heroicon-o-ellipsis-horizontal')
            ->button()
            ->color('gray'),
    ];
}

    protected function canCreate(): bool
    {
        return false;
    }
}