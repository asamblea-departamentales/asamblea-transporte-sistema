<?php

namespace App\Filament\Resources\SolicitudTransporteResource\Pages;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Filament\Resources\SolicitudTransporteResource;
use App\Models\BitacoraEvento;
use App\Models\HistorialEstado;
use App\Models\SolicitudTransporte;
use Filament\Actions;
use Filament\Forms;
use Filament\Resources\Pages\ViewRecord;

class ViewSolicitudTransporte extends ViewRecord
{
    protected static string $resource = SolicitudTransporteResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // OBSERVACIÓN (PENDIENTE/EN_REVISION)
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
                        // ✅ columna real
                        'datos_extras' => [
                            'comentario' => $data['comentario_jefe'],
                        ],
                    ]);
                })
                ->visible(fn (SolicitudTransporte $record) =>
                    auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    in_array($record->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)
                ),

            // PRE-APROBAR (PENDIENTE/EN_REVISION)
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

                    BitacoraEvento::create([
                        'entidad_tipo' => 'solicitud_transporte',
                        'entidad_id'   => $record->id,
                        'accion'       => 'PRE_APROBAR',
                        'user_id'      => auth()->id(),
                    ]);
                })
                ->visible(fn (SolicitudTransporte $record) =>
                    auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    in_array($record->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)
                ),

            // PROGRAMAR ('aprobar') SOLO cuando está PRE_APROBADA
            Actions\Action::make('aprobar')
                ->button()
                ->size('lg')
                ->label('Programar y Aprobar')
                ->color('success')
                ->icon('heroicon-o-check-circle')
                ->modalHeading('Programar Solicitud')
                ->modalSubmitActionLabel('Programar')
                ->form([
                    Forms\Components\Textarea::make('comentario_jefe')
                        ->label('Motivo de la programación')
                        ->rows(4)
                        ->required()
                        ->maxLength(2000),

                    Forms\Components\Section::make('Asignación de Vehículo y Motorista')
    ->schema([
        Forms\Components\Select::make('vehiculo_id')
            ->label('Vehículo a Asignar')
            ->options(function () {
                return \App\Models\Vehiculo::where('activo', true)
                    ->with('tipo')
                    ->get()
                    ->mapWithKeys(fn ($v) => [
                        $v->id => "{$v->placa} - {$v->tipo->nombre}"
                    ]);
            })
            ->hint(fn ($record) => "El usuario pidió: " . ($record->tipo_vehiculo_nombre ?? 'N/A'))
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
                $vehiculo = \App\Models\Vehiculo::find($state);
                $motorista = $vehiculo?->asignacionVigenteMotorista?->motorista;
                $set('motorista_nombre', $motorista
                    ? "{$motorista->nombre} — DUI: {$motorista->dui}"
                    : 'Sin motorista asignado');
                $set('motorista_id', $motorista?->id);
            }),

        // ID oculto para guardar en BD
        Forms\Components\Hidden::make('motorista_id'),

        // Solo visual
        Forms\Components\Placeholder::make('motorista_nombre')
            ->label('Motorista Asignado')
            ->content(fn ($get) => $get('motorista_nombre') ?? 'Selecciona un vehículo primero'),
    ])
    ->columns([
        'default' => 1,
        'md' => 2,
    ]),
                ])
                ->action(function (SolicitudTransporte $record, array $data) {
                    $estadoAnterior = $record->estado;

                    $record->estado = EstadoSolicitudEnum::APROBADA;
                    $record->vehiculo_id = $data['vehiculo_id'];
                    $record->motorista_id = $data['motorista_id'];
                    $record->comentario_jefe = $data['comentario_jefe'];
                    $record->decidido_por = auth()->id();
                    $record->decidido_en = now();
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
                        'entidad_tipo'  => 'solicitud_transporte',
                        'entidad_id'    => $record->id,
                        'accion'        => AccionBitacoraEnum::APROBAR->value,
                        'user_id'       => auth()->id(),
                        'datos_extras'  => [
                            'comentario'   => $data['comentario_jefe'],
                            'vehiculo_id'  => $data['vehiculo_id'],
                            'motorista_id' => $data['motorista_id'],
                        ],
                    ]);
                })
                ->visible(fn (SolicitudTransporte $record) =>
                    auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    $record->estado === EstadoSolicitudEnum::PRE_APROBADA
                ),

            // RECHAZAR (PENDIENTE/EN_REVISION/PRE_APROBADA)
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

                    $record->estado = EstadoSolicitudEnum::RECHAZADA;
                    $record->comentario_jefe = $data['comentario_jefe'];
                    $record->decidido_por = auth()->id();
                    $record->decidido_en = now();
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
                        // ✅ columna real
                        'datos_extras' => [
                            'comentario' => $data['comentario_jefe'],
                        ],
                    ]);
                })
                ->visible(fn (SolicitudTransporte $record) =>
                    in_array($record->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION, EstadoSolicitudEnum::PRE_APROBADA], true)
                ),
        ];
    }

    protected function canCreate(): bool
    {
        return false;
    }
}
