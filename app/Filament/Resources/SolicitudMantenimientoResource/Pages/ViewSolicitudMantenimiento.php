<?php

namespace App\Filament\Resources\SolicitudMantenimientoResource\Pages;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Services\SolicitudMantenimientoService;
use App\Filament\Resources\SolicitudMantenimientoResource;
use App\Models\BitacoraEvento;
use App\Models\HistorialEstado;
use App\Models\SolicitudMantenimiento;
use Filament\Actions;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;

class ViewSolicitudMantenimiento extends ViewRecord
{
    protected static string $resource = SolicitudMantenimientoResource::class;

    protected function getHeaderActions(): array
    {
        return [

            // ── PRE-APROBAR ──────────────────────────────────────────
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
                        'entidad_tipo' => 'solicitud_mantenimiento',
                        'entidad_id' => $record->id,
                        'estado_anterior' => $estadoAnterior?->value,
                        'estado_nuevo' => $record->estado?->value,
                        'user_id' => auth()->id(),
                        'comentario' => 'Solicitud pre-aprobada.',
                    ]);

                    BitacoraEvento::create([
                        'entidad_tipo' => 'solicitud_mantenimiento',
                        'entidad_id' => $record->id,
                        'accion' => 'PRE_APROBAR',
                        'user_id' => auth()->id(),
                    ]);

                    Notification::make()
                        ->title('Solicitud pre-aprobada')
                        ->success()
                        ->send();
                })
                ->visible(fn (SolicitudMantenimiento $record) => auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    in_array($record->estado->value, [
                        EstadoSolicitudEnum::PENDIENTE->value,
                        EstadoSolicitudEnum::EN_REVISION->value,
                    ], true)
                ),

            // ── APROBAR ──────────────────────────────────────────────
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
                        'estado' => EstadoSolicitudEnum::APROBADA,
                        'observaciones' => $data['observaciones'],
                        'aprobador_id' => auth()->id(),
                        'fecha_aprobacion' => now(),
                    ]);

                    HistorialEstado::create([
                        'entidad_tipo' => 'solicitud_mantenimiento',
                        'entidad_id' => $record->id,
                        'estado_anterior' => $estadoAnterior?->value,
                        'estado_nuevo' => EstadoSolicitudEnum::APROBADA->value,
                        'user_id' => auth()->id(),
                        'comentario' => $data['observaciones'],
                    ]);

                    BitacoraEvento::create([
                        'entidad_tipo' => 'solicitud_mantenimiento',
                        'entidad_id' => $record->id,
                        'accion' => AccionBitacoraEnum::APROBAR->value,
                        'user_id' => auth()->id(),
                        'datos_extras' => ['observaciones' => $data['observaciones']],
                    ]);

                    Notification::make()
                        ->title('Solicitud aprobada')
                        ->success()
                        ->send();

                    $this->sendAprobadoEmail($record);
                })
                ->visible(fn (SolicitudMantenimiento $record) => auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    $record->estado === EstadoSolicitudEnum::PRE_APROBADA
                ),

            // ── RECHAZAR ─────────────────────────────────────────────
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
                        'estado' => EstadoSolicitudEnum::RECHAZADA,
                        'motivo_rechazo' => $data['motivo_rechazo'],
                        'aprobador_id' => auth()->id(),
                        'fecha_aprobacion' => now(),
                    ]);

                    HistorialEstado::create([
                        'entidad_tipo' => 'solicitud_mantenimiento',
                        'entidad_id' => $record->id,
                        'estado_anterior' => $estadoAnterior?->value,
                        'estado_nuevo' => EstadoSolicitudEnum::RECHAZADA->value,
                        'user_id' => auth()->id(),
                        'comentario' => $data['motivo_rechazo'],
                    ]);

                    BitacoraEvento::create([
                        'entidad_tipo' => 'solicitud_mantenimiento',
                        'entidad_id' => $record->id,
                        'accion' => AccionBitacoraEnum::RECHAZAR->value,
                        'user_id' => auth()->id(),
                        'datos_extras' => ['motivo' => $data['motivo_rechazo']],
                    ]);

                    Notification::make()
                        ->title('Solicitud rechazada')
                        ->danger()
                        ->send();

                    $this->sendRechazadoEmail($record);
                })
                ->visible(fn (SolicitudMantenimiento $record) => in_array($record->estado, [
                    EstadoSolicitudEnum::PENDIENTE,
                    EstadoSolicitudEnum::EN_REVISION,
                    EstadoSolicitudEnum::PRE_APROBADA,
                ], true)
                ),

            Actions\Action::make('orden_trabajo')
                ->button()
                ->size('lg')
                ->label('Generar Orden de Trabajo')
                ->color('gray')
                ->icon('heroicon-o-document-text')
                ->url(fn (SolicitudMantenimiento $record) => route('reportes.orden-trabajo.pdf', ['solicitud_id' => $record->id]))
                ->openUrlInNewTab()
                ->visible(fn (SolicitudMantenimiento $record) => auth()->check() &&
                    auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    $record->vehiculo_id !== null &&
                    in_array($record->estado->value, [
                        EstadoSolicitudEnum::APROBADA->value,
                        EstadoSolicitudEnum::EN_EJECUCION->value,
                        EstadoSolicitudEnum::COMPLETADA->value,
                    ])
                ),

            // ── EVALUAR ──────────────────────────────────────────────
            Actions\Action::make('evaluar')
                ->button()
                ->size('lg')
                ->label('Evaluar')
                ->color('info')
                ->icon('heroicon-o-check-badge')
                ->modalHeading('Evaluar Mantenimiento')
                ->modalSubmitActionLabel('Guardar evaluación')
                ->form([
                    Forms\Components\Select::make('estado')
                        ->label('Resultado')
                        ->options([
                            'conforme' => '✔ Conforme',
                            'observaciones' => '⚠ Con observaciones',
                            'no_conforme' => '❌ No conforme',
                        ])
                        ->required(),
                    Forms\Components\Textarea::make('comentario')
                        ->label('Comentario')
                        ->rows(3),
                ])
                ->action(function (SolicitudMantenimiento $record, array $data) {
                    app(SolicitudMantenimientoService::class)->evaluar(
                        $record,
                        auth()->id(),
                        $data['estado'],
                        $data['comentario'] ?? null,
                    );

                    Notification::make()
                        ->title('Evaluación registrada')
                        ->success()
                        ->send();
                })
                ->visible(fn (SolicitudMantenimiento $record) => $record->estado === EstadoSolicitudEnum::COMPLETADA &&
                    ! $record->evaluacion_estado
                ),

            // ── MÁS ACCIONES ─────────────────────────────────────────
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
                                'entidad_tipo' => 'solicitud_mantenimiento',
                                'entidad_id' => $record->id,
                                'estado_anterior' => $estadoAnterior?->value,
                                'estado_nuevo' => $record->estado?->value,
                                'user_id' => auth()->id(),
                                'comentario' => $data['observaciones'],
                            ]);
                        }

                        BitacoraEvento::create([
                            'entidad_tipo' => 'solicitud_mantenimiento',
                            'entidad_id' => $record->id,
                            'accion' => AccionBitacoraEnum::OBSERVAR->value,
                            'user_id' => auth()->id(),
                            'datos_extras' => ['comentario' => $data['observaciones']],
                        ]);

                        Notification::make()
                            ->title('Observación registrada')
                            ->success()
                            ->send();
                    })
                    ->visible(fn (SolicitudMantenimiento $record) => auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                                            in_array($record->estado->value, [
                                                EstadoSolicitudEnum::PENDIENTE->value,
                                                EstadoSolicitudEnum::EN_REVISION->value,
                                            ], true)
                    ),
                Actions\Action::make('cancelar')
                    ->label('Cancelar Solicitud')
                    ->color('danger')
                    ->icon('heroicon-o-trash')
                    ->requiresConfirmation()
                    ->modalHeading('¿Cancelar esta solicitud?')
                    ->modalDescription('Esta acción no se puede deshacer.')
                    ->action(function (SolicitudMantenimiento $record) {
                        $estadoAnterior = $record->estado;

                        $record->update(['estado' => EstadoSolicitudEnum::CANCELADA]);

                        HistorialEstado::create([
                            'entidad_tipo' => 'solicitud_mantenimiento',
                            'entidad_id' => $record->id,
                            'estado_anterior' => $estadoAnterior?->value,
                            'estado_nuevo' => EstadoSolicitudEnum::CANCELADA->value,
                            'user_id' => auth()->id(),
                            'comentario' => 'Solicitud cancelada.',
                        ]);

                        BitacoraEvento::create([
                            'entidad_tipo' => 'solicitud_mantenimiento',
                            'entidad_id' => $record->id,
                            'accion' => AccionBitacoraEnum::CANCELAR->value,
                            'user_id' => auth()->id(),
                        ]);

                        Notification::make()
                            ->title('Solicitud cancelada')
                            ->danger()
                            ->send();
                    })
                    ->visible(fn (SolicitudMantenimiento $record) => in_array($record->estado->value, [
                        EstadoSolicitudEnum::BORRADOR->value,
                        EstadoSolicitudEnum::PENDIENTE->value,
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

    private function sendAprobadoEmail(SolicitudMantenimiento $solicitud): void
    {
        try {
            $solicitud->load(['vehiculo', 'tipoMantenimiento', 'solicitante', 'solicitante.unidad']);

            $payload = [
                'tipo' => 'mantenimiento',
                'evento' => 'solicitud_aprobada',
                'mensaje' => 'Tu solicitud de mantenimiento ha sido APROBADA.',
                'solicitud' => [
                    'codigo' => $solicitud->codigo,
                    'estado' => $solicitud->estado->value,
                    'vehiculo' => $solicitud->vehiculo?->placa ?? 'N/A',
                    'tipo_mantenimiento' => $solicitud->tipoMantenimiento?->nombre ?? 'N/A',
                    'prioridad' => $solicitud->prioridad->value,
                    'detalle' => $solicitud->detalle,
                    'fecha_sugerida' => $solicitud->fecha_sugerida,
                    'costo_estimado' => $solicitud->costo_estimado,
                    'observaciones' => $solicitud->observaciones,
                ],
                'solicitante' => [
                    'name' => $solicitud->solicitante?->name,
                    'email' => $solicitud->solicitante?->email,
                    'unidad' => [
                        'nombre' => $solicitud->solicitante?->unidad?->nombre ?? 'N/A',
                        'siglas' => $solicitud->solicitante?->unidad?->siglas ?? 'N/A',
                    ],
                ],
                'timestamp' => now()->format(\DateTimeInterface::ATOM),
            ];

            Mail::to($solicitud->solicitante?->email)->send(
                new NotificacionEventMail('✅ Solicitud de Mantenimiento APROBADA', $payload)
            );
        } catch (\Exception $e) {
            Log::error('Error enviando correo de aprobación mantenimiento: '.$e->getMessage());
        }
    }

    private function sendRechazadoEmail(SolicitudMantenimiento $solicitud): void
    {
        try {
            $solicitud->load(['vehiculo', 'tipoMantenimiento', 'solicitante', 'solicitante.unidad']);

            $payload = [
                'tipo' => 'mantenimiento',
                'evento' => 'solicitud_rechazada',
                'mensaje' => 'Tu solicitud de mantenimiento ha sido RECHAZADA.',
                'solicitud' => [
                    'codigo' => $solicitud->codigo,
                    'estado' => $solicitud->estado->value,
                    'vehiculo' => $solicitud->vehiculo?->placa ?? 'N/A',
                    'tipo_mantenimiento' => $solicitud->tipoMantenimiento?->nombre ?? 'N/A',
                    'prioridad' => $solicitud->prioridad->value,
                    'detalle' => $solicitud->detalle,
                    'fecha_sugerida' => $solicitud->fecha_sugerida,
                    'costo_estimado' => $solicitud->costo_estimado,
                    'motivo_rechazo' => $solicitud->motivo_rechazo,
                ],
                'solicitante' => [
                    'name' => $solicitud->solicitante?->name,
                    'email' => $solicitud->solicitante?->email,
                    'unidad' => [
                        'nombre' => $solicitud->solicitante?->unidad?->nombre ?? 'N/A',
                        'siglas' => $solicitud->solicitante?->unidad?->siglas ?? 'N/A',
                    ],
                ],
                'timestamp' => now()->format(\DateTimeInterface::ATOM),
            ];

            Mail::to($solicitud->solicitante?->email)->send(
                new NotificacionEventMail('❌ Solicitud de Mantenimiento RECHAZADA', $payload)
            );
        } catch (\Exception $e) {
            Log::error('Error enviando correo de rechazo mantenimiento: '.$e->getMessage());
        }
    }
}
