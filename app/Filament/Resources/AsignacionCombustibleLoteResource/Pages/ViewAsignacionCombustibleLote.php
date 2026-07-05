<?php

namespace App\Filament\Resources\AsignacionCombustibleLoteResource\Pages;

use App\Domain\Solicitudes\Enums\EstadoLoteEnum;
use App\Filament\Resources\AsignacionCombustibleLoteResource;
use Filament\Actions;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;

class ViewAsignacionCombustibleLote extends ViewRecord
{
    protected static string $resource = AsignacionCombustibleLoteResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // ── Exportar PDF — siempre visible ───────────────────────────────
            Actions\Action::make('pdf')
                ->label('PDF')
                ->icon('heroicon-o-printer')
                ->color('gray')
                ->url(fn ($record) => route('reportes.lote-combustible.pdf', ['lote' => $record->id]))
                ->openUrlInNewTab(),

            // ── Exportar Excel — desde FINALIZADO en adelante ────────────────
            Actions\Action::make('excel')
                ->label('Excel')
                ->icon('heroicon-o-table-cells')
                ->color('success')
                ->url(fn ($record) => route('reportes.lote-combustible.excel', ['lote' => $record->id]))
                ->openUrlInNewTab()
                ->visible(
                    fn ($record) => in_array($record->estado, [
                        EstadoLoteEnum::FINALIZADO,
                        EstadoLoteEnum::EN_PROCESO,
                        EstadoLoteEnum::COMPLETADO,
                    ])
                ),

            // ── Exportar CSV auditoría — solo jefe/admin en EN_PROCESO o COMPLETADO
            Actions\Action::make('csv')
                ->label('CSV Auditoría')
                ->icon('heroicon-o-document-text')
                ->color('gray')
                ->url(fn ($record) => route('reportes.lote-combustible.csv', ['lote' => $record->id]))
                ->openUrlInNewTab()
                ->visible(
                    fn ($record) => in_array($record->estado, [
                        EstadoLoteEnum::EN_PROCESO,
                        EstadoLoteEnum::COMPLETADO,
                    ])
                    && auth()->check()
                    && auth()->user()->hasAnyRole(['admin', 'super_admin', 'jefe', 'operativo'])
                ),

            // ── Editar — solo BORRADOR ────────────────────────────────────────
            Actions\EditAction::make()
                ->visible(fn ($record) => $record->estado === EstadoLoteEnum::BORRADOR),

            // ── Iniciar asignación — FINALIZADO → EN_PROCESO ──────────────────
            Actions\Action::make('iniciarAsignacion')
                ->label('Iniciar Asignación')
                ->icon('heroicon-o-play')
                ->color('warning')
                ->requiresConfirmation()
                ->modalHeading('Iniciar asignación operativa')
                ->modalDescription(
                    'El lote pasará a EN PROCESO y el personal operativo podrá registrar cargas.'
                )
                ->action(function ($record) {
                    try {
                        app(\App\Domain\Solicitudes\Services\Lotes\LoteCombustibleService::class)
                            ->iniciarAsignacion($record->id, auth()->id());

                        Notification::make()
                            ->title('Asignación iniciada')
                            ->body('El operativo ya puede registrar las cargas.')
                            ->success()
                            ->send();

                        $this->redirect($this->getResource()::getUrl('view', ['record' => $record]));
                    } catch (\DomainException $e) {
                        Notification::make()
                            ->title('No se pudo iniciar')
                            ->body($e->getMessage())
                            ->danger()
                            ->send();
                    }
                })
                ->visible(
                    fn ($record) => $record->estado === EstadoLoteEnum::FINALIZADO
                        && auth()->check()
                        && auth()->user()->hasAnyRole(['operativo', 'admin', 'super_admin'])
                ),

            // ── Completar lote — EN_PROCESO → COMPLETADO ──────────────────────
            Actions\Action::make('completarLote')
                ->label('Completar Lote')
                ->icon('heroicon-o-check-badge')
                ->color('success')
                ->requiresConfirmation()
                ->modalHeading('Completar lote')
                ->modalDescription(
                    'El lote será marcado como COMPLETADO y ya no podrá modificarse. '.
                    'Se verificará que todos los vehículos tengan serie, contrato, tipo de combustible y galones.'
                )
                ->action(function ($record) {
                    try {
                        app(\App\Domain\Solicitudes\Services\Lotes\LoteCombustibleService::class)
                            ->completarLote($record->id, auth()->id());

                        Notification::make()
                            ->title('Lote completado')
                            ->body('El lote fue cerrado exitosamente.')
                            ->success()
                            ->send();

                        $this->redirect($this->getResource()::getUrl('view', ['record' => $record]));
                    } catch (\DomainException $e) {
                        Notification::make()
                            ->title('No se pudo completar')
                            ->body($e->getMessage())
                            ->danger()
                            ->send();
                    }
                })
                ->visible(
                    fn ($record) => $record->estado === EstadoLoteEnum::EN_PROCESO
                        && auth()->check()
                        && auth()->user()->hasAnyRole(['operativo', 'admin', 'super_admin', 'jefe'])
                ),
        ];
    }

    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Infolists\Components\Grid::make(4)->schema([
                    Infolists\Components\TextEntry::make('fecha')
                        ->label('Fecha del Lote')
                        ->date('d/m/Y'),

                    Infolists\Components\TextEntry::make('detalles_count')
                        ->label('Número de Vehículos')
                        ->state(fn ($record) => $record->detalles()->count()),

                    Infolists\Components\TextEntry::make('total_monto')
                        ->label('Monto Total Asignado')
                        ->money('USD', true),

                    Infolists\Components\TextEntry::make('estado')
                        ->label('Estado del Lote')
                        ->badge()
                        ->color(fn (EstadoLoteEnum $state) => $state->color())
                        ->formatStateUsing(fn (EstadoLoteEnum $state) => $state->label()),
                ]),

                Infolists\Components\Section::make('Observaciones')
                    ->schema([
                        Infolists\Components\TextEntry::make('observaciones')
                            ->label('')
                            ->placeholder('No hay observaciones'),
                    ])
                    ->visible(fn ($record) => ! empty($record->observaciones)),
            ]);
    }

    public function getRelationManagers(): array
    {
        return [
            \App\Filament\Resources\AsignacionCombustibleLoteResource\RelationManagers\DetallesRelationManager::class,
        ];
    }
}
