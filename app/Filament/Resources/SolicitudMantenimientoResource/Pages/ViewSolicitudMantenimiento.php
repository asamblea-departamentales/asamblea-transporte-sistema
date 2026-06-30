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
                    ->visible(fn (SolicitudMantenimiento $record) => auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'super_admin']) &&
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
