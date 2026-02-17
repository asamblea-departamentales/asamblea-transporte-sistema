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
                        // OJO: usá el nombre real de tu columna (datos_extra vs datos_extras)
                        'datos_extra'  => [
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
    ->options(function (SolicitudTransporte $record) {
        return \App\Models\Vehiculo::where('activo', true)
            // Filtramos vehículos cuyo tipo coincida con el solicitado
            ->where('tipo_vehiculo_id', $record->tipo_vehiculo_id) 
            ->get()
            ->pluck('placa', 'id');
    })
    ->helperText(fn ($record) => "Mostrando solo vehículos tipo: " . ($record->tipoVehiculo?->nombre ?? 'N/A'))
    ->required()
    ->searchable()
                    ->live() // Cambiado de reactive() a live() que es el estándar de Filament v3
                    ->afterStateUpdated(function ($state, callable $set) {
                        $vehiculo = \App\Models\Vehiculo::find($state);
                        // Asegúrate de que la relación 'asignacionVigenteMotorista' exista en tu modelo Vehiculo
                        $asignacion = $vehiculo?->asignacionVigenteMotorista;
                        if ($asignacion) {
                            $set('motorista_id', $asignacion->motorista_id);
                        }
                    }),
                
                Forms\Components\Select::make('motorista_id')
                    ->label('Motorista')
                    ->options(fn () => \App\Models\Motorista::where('activo', true)->pluck('nombre', 'id'))
                    ->searchable()
                    ->required(),
            ])->columns(2),    
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
                        'entidad_tipo' => 'solicitud_transporte',
                        'entidad_id'   => $record->id,
                        'accion'       => AccionBitacoraEnum::APROBAR->value,
                        'user_id'      => auth()->id(),
                        'datos_extras'  => [
                            'comentario' => $data['comentario_jefe'],
                            'vehiculo_id' => $data['vehiculo_id'],
                            'motorista_id' => $data['motorista_id'],
                        ],
                    ]);
                })
                ->visible(fn (SolicitudTransporte $record) =>
                    auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    $record->estado === EstadoSolicitudEnum::PRE_APROBADA
                ),

            // RECHAZAR (PENDIENTE/EN_REVISION)
            Actions\Action::make('rechazar')
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
                        'datos_extra'  => [
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
