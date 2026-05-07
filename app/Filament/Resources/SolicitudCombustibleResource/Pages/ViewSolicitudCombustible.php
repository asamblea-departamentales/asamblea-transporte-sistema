<?php

namespace App\Filament\Resources\SolicitudCombustibleResource\Pages;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Services\SolicitudCombustibleService;
use App\Filament\Resources\SolicitudCombustibleResource;
use App\Models\BitacoraEvento;
use App\Models\ContratoCombustible;
use App\Models\HistorialEstado;
use App\Models\SolicitudCombustible;
use Filament\Actions;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;

class ViewSolicitudCombustible extends ViewRecord
{
    protected static string $resource = SolicitudCombustibleResource::class;

    protected function afterFill(): void
    {
        app(\App\Domain\Solicitudes\Services\SolicitudCombustibleService::class)
            ->registrarEvento(
                $this->record,
                \App\Domain\Solicitudes\Enums\AccionBitacoraEnum::VER->value,
                auth()->id()
            );
    }

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
                ->modalHeading('Pre-aprobar Solicitud de Combustible')
                ->action(function (SolicitudCombustible $record) {
                    $estadoAnterior = $record->estado;

                    $record->estado = EstadoSolicitudEnum::PRE_APROBADA;
                    $record->save();

                    HistorialEstado::create([
                        'entidad_tipo' => 'solicitud_combustible',
                        'entidad_id' => $record->id,
                        'estado_anterior' => $estadoAnterior?->value,
                        'estado_nuevo' => $record->estado?->value,
                        'user_id' => auth()->id(),
                        'comentario' => 'Solicitud pre-aprobada.',
                    ]);

                    BitacoraEvento::create([
                        'entidad_tipo' => 'solicitud_combustible',
                        'entidad_id' => $record->id,
                        'accion' => 'PRE_APROBAR',
                        'user_id' => auth()->id(),
                    ]);
                })
                ->visible(fn (SolicitudCombustible $record) => auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    in_array($record->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)
                ),

            Actions\Action::make('aprobar')
                ->button()
                ->size('lg')
                ->label('Aprobar')
                ->color('success')
                ->icon('heroicon-o-check-circle')
                ->modalHeading('Aprobar Solicitud de Combustible')
                ->modalSubmitActionLabel('Aprobar')
                ->form([
                    Forms\Components\Textarea::make('observaciones')
                        ->label('Observaciones de aprobación')
                        ->rows(4)
                        ->required()
                        ->maxLength(2000)
                        ->columnSpanFull(),
                ])
                ->action(function (SolicitudCombustible $record, array $data) {
                    $estadoAnterior = $record->estado;

                    $record->update([
                        'estado' => EstadoSolicitudEnum::APROBADA,
                        'observaciones' => $data['observaciones'],
                        'aprobador_id' => auth()->id(),
                        'fecha_aprobacion' => now(),
                    ]);

                    HistorialEstado::create([
                        'entidad_tipo' => 'solicitud_combustible',
                        'entidad_id' => $record->id,
                        'estado_anterior' => $estadoAnterior?->value,
                        'estado_nuevo' => EstadoSolicitudEnum::APROBADA->value,
                        'user_id' => auth()->id(),
                        'comentario' => $data['observaciones'],
                    ]);

                    BitacoraEvento::create([
                        'entidad_tipo' => 'solicitud_combustible',
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
                ->visible(fn (SolicitudCombustible $record) => auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    $record->estado === EstadoSolicitudEnum::PRE_APROBADA
                ),

            // ── NUEVA ACCIÓN: ASIGNAR VALES ─────────────────────────
            Actions\Action::make('asignar_vales')
                ->button()
                ->size('lg')
                ->label('Asignar Cargas')
                ->color('primary')
                ->icon('heroicon-o-ticket')
                ->modalHeading('Asignar Cargas de Combustible')
                ->modalDescription('Selecciona el contrato, la serie y la cantidad de cargas a asignar.')
                ->modalWidth('xl')
                ->form([
                    Forms\Components\Select::make('contrato_id')
                        ->label('Contrato')
                        ->options(
                            ContratoCombustible::where('activo', true)
                                ->get()
                                ->mapWithKeys(fn ($c) => [
                                    $c->id => "{$c->numero_contrato} — {$c->nombre} (Disponible: $".number_format($c->monto_disponible, 2).')',
                                ])
                        )
                        ->required()
                        ->searchable()
                        ->live()
                        ->afterStateUpdated(fn ($set) => $set('serie_vale_id', null)),

                    Forms\Components\Select::make('serie_vale_id')
                        ->label('Serie de Cargas')
                        ->options(fn ($get) => SerieCarga::where('contrato_id', $get('contrato_id'))
                            ->where('activo', true)
                            ->get()
                            ->mapWithKeys(fn ($s) => [
                                $s->id => "{$s->nombre} — $".number_format($s->valor, 2).
                                          " | Rango: {$s->correlativo_inicio}-{$s->correlativo_fin}".
                                          ' | Siguiente: '.($s->correlativo_actual ?: $s->correlativo_inicio),
                            ])
                        )
                        ->required()
                        ->searchable()
                        ->live()
                        ->disabled(fn ($get) => ! $get('contrato_id'))
                        ->helperText('Primero selecciona un contrato.'),

                    Forms\Components\TextInput::make('cantidad_vales')
                        ->label('Cantidad de Cargas')
                        ->numeric()
                        ->required()
                        ->minValue(1)
                        ->live(debounce: 500)
                        ->helperText(function ($get) {
                            $serieId = $get('serie_vale_id');
                            $cantidad = (int) ($get('cantidad_vales') ?? 0);

                            if (! $serieId || $cantidad <= 0) {
                                return null;
                            }

                            $serie = SerieCarga::find($serieId);
                            if (! $serie) {
                                return null;
                            }

                            $inicio = $serie->correlativo_actual ?: $serie->correlativo_inicio;
                            $fin = $inicio + $cantidad - 1;
                            $monto = $cantidad * (float) $serie->valor;

                            return "Rango: {$inicio} – {$fin} | Monto total: $".number_format($monto, 2);
                        }),

                    Forms\Components\Placeholder::make('resumen_asignacion')
                        ->label('Resumen')
                        ->content(function ($get) {
                            $serieId = $get('serie_vale_id');
                            $cantidad = (int) ($get('cantidad_vales') ?? 0);

                            if (! $serieId || $cantidad <= 0) {
                                return new \Illuminate\Support\HtmlString(
                                    '<span class="text-gray-400 text-sm">Selecciona una serie y cantidad para ver el resumen.</span>'
                                );
                            }

                            $serie = SerieCarga::find($serieId);
                            if (! $serie) {
                                return '-';
                            }

                            $inicio = $serie->correlativo_actual ?: $serie->correlativo_inicio;
                            $fin = $inicio + $cantidad - 1;
                            $monto = $cantidad * (float) $serie->valor;
                            $disponibles = $serie->correlativo_fin - $inicio + 1;

                            $alerta = $fin > $serie->correlativo_fin
                                ? '<span class="text-red-600 font-bold">⚠ Sin suficientes cargas en esta serie.</span>'
                                : '<span class="text-green-600">✓ Cargas disponibles suficientes.</span>';

                            return new \Illuminate\Support\HtmlString("
                                <div class='text-sm space-y-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3'>
                                    <div class='flex justify-between'>
                                        <span class='text-gray-500'>Serie:</span>
                                        <span class='font-medium'>{$serie->nombre}</span>
                                    </div>
                                    <div class='flex justify-between'>
                                        <span class='text-gray-500'>Valor por carga:</span>
                                        <span class='font-medium'>\$".number_format($serie->valor, 2)."</span>
                                    </div>
                                    <div class='flex justify-between'>
                                        <span class='text-gray-500'>Correlativo asignado:</span>
                                        <span class='font-mono font-medium'>{$inicio} → {$fin}</span>
                                    </div>
                                    <div class='flex justify-between border-t border-gray-200 dark:border-gray-600 pt-1 mt-1'>
                                        <span class='text-gray-500'>Monto total:</span>
                                        <span class='font-bold text-primary-600'>\$".number_format($monto, 2)."</span>
                                    </div>
                                    <div class='flex justify-between'>
                                        <span class='text-gray-500'>Cargas disponibles en serie:</span>
                                        <span>{$disponibles}</span>
                                    </div>
                                    <div class='mt-1'>{$alerta}</div>
                                </div>
                            ");
                        }),
                ])
                ->action(function (SolicitudCombustible $record, array $data) {
                    try {
                        app(SolicitudCombustibleService::class)->asignarVales(
                            $record,
                            auth()->id(),
                            [
                                'contrato_id' => $data['contrato_id'],
                                'serie_vale_id' => $data['serie_vale_id'],
                                'cantidad_vales' => $data['cantidad_vales'],
                            ]
                        );

                        Notification::make()
                            ->title('Cargas asignadas correctamente')
                            ->body("Se asignaron {$data['cantidad_vales']} cargas a la solicitud {$record->codigo}.")
                            ->success()
                            ->send();

                    } catch (\DomainException $e) {
                        Notification::make()
                            ->title('No se pudo asignar')
                            ->body($e->getMessage())
                            ->danger()
                            ->send();
                    }
                })
                ->visible(fn (SolicitudCombustible $record) => auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    $record->estado === EstadoSolicitudEnum::APROBADA
                ),

            Actions\Action::make('enviar_liquidador')
                ->label('Enviar a liquidador')
                ->color('primary')
                ->icon('heroicon-o-arrow-right')
                ->requiresConfirmation()
                ->modalHeading('Enviar a liquidador')
                ->modalDescription('La solicitud será enviada para proceso de liquidación. Asegúrese de haber cargado los comprobantes.')

                // Validación UX
                ->disabled(fn (SolicitudCombustible $record) => ! $record->tieneComprobantes())
                ->tooltip(fn (SolicitudCombustible $record) => ! $record->tieneComprobantes() ? 'Debe cargar comprobantes antes de enviar' : 'Enviar a revisión'
                )

                ->action(function (SolicitudCombustible $record, Actions\StaticAction $action) {
                    try {
                        app(SolicitudCombustibleService::class)
                            ->enviarALiquidador($record, auth()->id());

                        Notification::make()
                            ->title('Enviada a liquidador')
                            ->success()
                            ->send();

                    } catch (\DomainException $e) {
                        Notification::make()
                            ->title('Error al enviar')
                            ->body($e->getMessage())
                            ->danger()
                            ->send();

                        $action->halt();
                    }
                })
                ->visible(fn (SolicitudCombustible $record) => auth()->user()?->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    in_array($record->estado, [
                        EstadoSolicitudEnum::APROBADA,
                        EstadoSolicitudEnum::COMPLETADA,
                        EstadoSolicitudEnum::ASIGNADA,
                    ], true)
                ),

            Actions\Action::make('rechazar')
                ->button()
                ->size('lg')
                ->label('Rechazar')
                ->color('danger')
                ->icon('heroicon-o-x-circle')
                ->modalHeading('Rechazar Solicitud de Combustible')
                ->modalSubmitActionLabel('Rechazar')
                ->form([
                    Forms\Components\Textarea::make('motivo_rechazo')
                        ->label('Motivo del rechazo')
                        ->rows(4)
                        ->required()
                        ->maxLength(2000),
                ])
                ->action(function (SolicitudCombustible $record, array $data) {
                    $estadoAnterior = $record->estado;

                    $record->update([
                        'estado' => EstadoSolicitudEnum::RECHAZADA,
                        'motivo_rechazo' => $data['motivo_rechazo'],
                        'aprobador_id' => auth()->id(),
                        'fecha_aprobacion' => now(),
                    ]);

                    HistorialEstado::create([
                        'entidad_tipo' => 'solicitud_combustible',
                        'entidad_id' => $record->id,
                        'estado_anterior' => $estadoAnterior?->value,
                        'estado_nuevo' => EstadoSolicitudEnum::RECHAZADA->value,
                        'user_id' => auth()->id(),
                        'comentario' => $data['motivo_rechazo'],
                    ]);

                    BitacoraEvento::create([
                        'entidad_tipo' => 'solicitud_combustible',
                        'entidad_id' => $record->id,
                        'accion' => AccionBitacoraEnum::RECHAZAR->value,
                        'user_id' => auth()->id(),
                        'datos_extras' => ['motivo' => $data['motivo_rechazo']],
                    ]);

                    $this->sendRechazadoEmail($record);
                })
                ->visible(fn (SolicitudCombustible $record) => auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    in_array($record->estado, [
                        EstadoSolicitudEnum::PENDIENTE,
                        EstadoSolicitudEnum::EN_REVISION,
                        EstadoSolicitudEnum::PRE_APROBADA,
                    ], true)
                ),

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
                ->action(function (SolicitudCombustible $record, array $data) {
                    $estadoAnterior = $record->estado;

                    $record->observaciones = $data['observaciones'];

                    if ($record->estado === EstadoSolicitudEnum::PENDIENTE) {
                        $record->estado = EstadoSolicitudEnum::EN_REVISION;
                    }

                    $record->save();

                    if ($estadoAnterior !== $record->estado) {
                        HistorialEstado::create([
                            'entidad_tipo' => 'solicitud_combustible',
                            'entidad_id' => $record->id,
                            'estado_anterior' => $estadoAnterior?->value,
                            'estado_nuevo' => $record->estado?->value,
                            'user_id' => auth()->id(),
                            'comentario' => $data['observaciones'],
                        ]);
                    }

                    BitacoraEvento::create([
                        'entidad_tipo' => 'solicitud_combustible',
                        'entidad_id' => $record->id,
                        'accion' => AccionBitacoraEnum::OBSERVAR->value,
                        'user_id' => auth()->id(),
                        'datos_extras' => ['comentario' => $data['observaciones']],
                    ]);
                })
                ->visible(fn (SolicitudCombustible $record) => auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    in_array($record->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)
                ),
        ];
    }

    protected function canCreate(): bool
    {
        return false;
    }

    private function sendAprobadoEmail(SolicitudCombustible $solicitud): void
    {
        try {
            $solicitud->load(['vehiculo', 'motorista', 'solicitante', 'solicitante.unidad']);

            $payload = [
                'tipo' => 'combustible',
                'evento' => 'solicitud_aprobada',
                'mensaje' => 'Tu solicitud de combustible ha sido APROBADA.',
                'solicitud' => [
                    'codigo' => $solicitud->codigo,
                    'estado' => $solicitud->estado->value,
                    'vehiculo' => $solicitud->vehiculo?->placa ?? 'N/A',
                    'motorista' => $solicitud->motorista?->nombre ?? 'N/A',
                    'cantidad_combustible' => $solicitud->cantidad_galones,
                    'valor_total' => $solicitud->valor_total,
                    'fecha_solicitud' => $solicitud->fecha_solicitud,
                    'destino_actividad' => $solicitud->destino_actividad,
                    'forma_pago' => $solicitud->forma_pago,
                    'numero_vale_ticket' => $solicitud->numero_vale_ticket,
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
                new NotificacionEventMail('✅ Solicitud de Combustible APROBADA', $payload)
            );
        } catch (\Exception $e) {
            Log::error('Error enviando correo de aprobación combustible: '.$e->getMessage());
        }
    }

    private function sendRechazadoEmail(SolicitudCombustible $solicitud): void
    {
        try {
            $solicitud->load(['vehiculo', 'motorista', 'solicitante', 'solicitante.unidad']);

            $payload = [
                'tipo' => 'combustible',
                'evento' => 'solicitud_rechazada',
                'mensaje' => 'Tu solicitud de combustible ha sido RECHAZADA.',
                'solicitud' => [
                    'codigo' => $solicitud->codigo,
                    'estado' => $solicitud->estado->value,
                    'vehiculo' => $solicitud->vehiculo?->placa ?? 'N/A',
                    'motorista' => $solicitud->motorista?->nombre ?? 'N/A',
                    'cantidad_combustible' => $solicitud->cantidad_galones,
                    'valor_total' => $solicitud->valor_total,
                    'destino_actividad' => $solicitud->destino_actividad,
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
                new NotificacionEventMail('❌ Solicitud de Combustible RECHAZADA', $payload)
            );
        } catch (\Exception $e) {
            Log::error('Error enviando correo de rechazo combustible: '.$e->getMessage());
        }
    }
}
