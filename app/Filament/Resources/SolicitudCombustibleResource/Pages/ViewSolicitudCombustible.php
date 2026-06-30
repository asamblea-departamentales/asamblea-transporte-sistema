<?php

namespace App\Filament\Resources\SolicitudCombustibleResource\Pages;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Services\SolicitudEmailDispatchService;
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
use App\Models\SerieCarga;
use Illuminate\Support\Facades\Log;

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
                ->visible(fn (SolicitudCombustible $record) => auth()->user()?->hasAnyRole(['jefe', 'admin', 'ti', 'super_admin']) &&
                    in_array($record->estado, [
                        EstadoSolicitudEnum::APROBADA,
                        EstadoSolicitudEnum::COMPLETADA,
                        EstadoSolicitudEnum::ASIGNADA,
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
                ->visible(fn (SolicitudCombustible $record) => auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'super_admin']) &&
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
            app(SolicitudEmailDispatchService::class)->toSolicitante(
                $solicitud, 'combustible', 'solicitud_aprobada'
            );
        } catch (\Exception $e) {
            Log::error('Error enviando correo de aprobación: '.$e->getMessage());
        }
    }

    private function sendRechazadoEmail(SolicitudCombustible $solicitud): void
    {
        try {
            app(SolicitudEmailDispatchService::class)->toSolicitante(
                $solicitud, 'combustible', 'solicitud_rechazada'
            );
        } catch (\Exception $e) {
            Log::error('Error enviando correo de rechazo: '.$e->getMessage());
        }
    }
}
