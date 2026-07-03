<?php

namespace App\Filament\Resources\SolicitudMantenimientoResource\Pages;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Services\SolicitudEmailDispatchService;
use App\Domain\Solicitudes\Services\SolicitudMantenimientoService;
use App\Filament\Resources\SolicitudMantenimientoResource;
use App\Models\BitacoraEvento;
use App\Models\HistorialEstado;
use App\Models\SolicitudMantenimiento;
use Filament\Actions;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;
use Illuminate\Support\Facades\Log;

class ViewSolicitudMantenimiento extends ViewRecord
{
    protected static string $resource = SolicitudMantenimientoResource::class;

    protected function getHeaderActions(): array
    {
        return [

            Actions\Action::make('orden_trabajo')
                ->button()
                ->size('lg')
                ->label('Generar Orden de Trabajo')
                ->color('gray')
                ->icon('heroicon-o-document-text')
                ->url(fn (SolicitudMantenimiento $record) => route('reportes.orden-trabajo.pdf', ['solicitud_id' => $record->id]))
                ->openUrlInNewTab()
                ->visible(fn (SolicitudMantenimiento $record) => auth()->check() &&
                    auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'super_admin']) &&
                    $record->vehiculo_id !== null &&
                    in_array($record->estado->value, [
                        EstadoSolicitudEnum::APROBADA->value,
                        EstadoSolicitudEnum::EN_EJECUCION->value,
                        EstadoSolicitudEnum::COMPLETADA->value,
                    ])
                ),

            Actions\Action::make('enviar_liquidador')
                ->button()
                ->size('lg')
                ->label('Enviar a liquidador')
                ->color('primary')
                ->icon('heroicon-o-arrow-right')
                ->requiresConfirmation()
                ->modalHeading('Enviar a liquidador')
                ->modalDescription('La solicitud será enviada para proceso de liquidación. Asegúrese de haber cargado los adjuntos.')
                ->disabled(fn (SolicitudMantenimiento $record) => ! $record->tieneAdjuntos())
                ->tooltip(fn (SolicitudMantenimiento $record) => ! $record->tieneAdjuntos()
                    ? 'Debe cargar adjuntos antes de enviar'
                    : 'Enviar a revisión'
                )
                ->action(function (SolicitudMantenimiento $record, \Filament\Actions\StaticAction $action) {
                    try {
                        app(SolicitudMantenimientoService::class)
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
                ->visible(fn (SolicitudMantenimiento $record) => auth()->user()?->hasAnyRole(['jefe', 'admin', 'ti', 'super_admin']) &&
                    in_array($record->estado, [
                        EstadoSolicitudEnum::COMPLETADA,
                    ], true)
                ),
        ];
    }

    protected function canCreate(): bool
    {
        return false;
    }

    private function sendAprobadoEmail(SolicitudMantenimiento $solicitud): void
    {
        try {
            app(SolicitudEmailDispatchService::class)->toSolicitante(
                $solicitud, 'mantenimiento', 'solicitud_aprobada'
            );
        } catch (\Exception $e) {
            Log::error('Error enviando correo de aprobación: '.$e->getMessage());
        }
    }

    private function sendRechazadoEmail(SolicitudMantenimiento $solicitud): void
    {
        try {
            app(SolicitudEmailDispatchService::class)->toSolicitante(
                $solicitud, 'mantenimiento', 'solicitud_rechazada'
            );
        } catch (\Exception $e) {
            Log::error('Error enviando correo de rechazo: '.$e->getMessage());
        }
    }
}
