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

    // PO: sin acciones de editar/borrar, pero sí aprobar/rechazar/observación
    protected function getHeaderActions(): array
    {
        return [
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
                ->action(function (array $data) {
                    /** @var SolicitudTransporte $record */
                    $record = $this->record;

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
                        'datos_extra'  => [
                            'comentario' => $data['comentario_jefe'],
                        ],
                    ]);
                })
                ->visible(fn () =>
                    auth()->user()?->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    in_array($this->record->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)
                ),

            Actions\Action::make('aprobar')
                ->label('Aprobar')
                ->color('success')
                ->icon('heroicon-o-check-circle')
                ->requiresConfirmation()
                ->modalHeading('Aprobar Solicitud')
                ->modalDescription('¿Está seguro de que desea aprobar esta solicitud de transporte?')
                ->action(function () {
                    /** @var SolicitudTransporte $record */
                    $record = $this->record;

                    $estadoAnterior = $record->estado;

                    $record->estado = EstadoSolicitudEnum::APROBADA;
                    $record->decidido_por = auth()->id();
                    $record->decidido_en = now();
                    $record->save();

                    HistorialEstado::create([
                        'entidad_tipo'    => 'solicitud_transporte',
                        'entidad_id'      => $record->id,
                        'estado_anterior' => $estadoAnterior?->value,
                        'estado_nuevo'    => $record->estado?->value,
                        'user_id'         => auth()->id(),
                        'comentario'      => null,
                    ]);

                    BitacoraEvento::create([
                        'entidad_tipo' => 'solicitud_transporte',
                        'entidad_id'   => $record->id,
                        'accion'       => AccionBitacoraEnum::APROBAR->value,
                        'user_id'      => auth()->id(),
                        'datos_extra'  => null,
                    ]);
                })
                ->visible(fn () =>
                    auth()->user()?->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    in_array($this->record->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)
                ),

            Actions\Action::make('rechazar')
                ->label('Rechazar')
                ->color('danger')
                ->icon('heroicon-o-x-circle')
                ->modalHeading('Rechazar Solicitud')
                ->modalSubmitActionLabel('Rechazar Solicitud')
                ->form([
                    Forms\Components\Textarea::make('comentario_jefe')
                        ->label('Motivo del rechazo')
                        ->rows(4)
                        ->required()
                        ->maxLength(2000),
                ])
                ->action(function (array $data) {
                    /** @var SolicitudTransporte $record */
                    $record = $this->record;

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
                ->visible(fn () =>
                    auth()->user()?->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    in_array($this->record->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)
                ),
        ];
    }

    // Extra seguridad: aunque alguien intente forzar, no puede editar ni borrar
    protected function canCreate(): bool
    {
        return false;
    }
}
