<?php

namespace App\Filament\Resources\AsignacionCombustibleLoteResource\Pages;

use App\Domain\Solicitudes\Enums\EstadoLoteEnum;
use App\Filament\Resources\AsignacionCombustibleLoteResource;
use Filament\Actions;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Resources\Pages\ViewRecord;

class ViewAsignacionCombustibleLote extends ViewRecord
{
    protected static string $resource = AsignacionCombustibleLoteResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('pdf')
                ->label('Exportar PDF')
                ->icon('heroicon-o-printer')
                ->url(fn ($record) => route('reportes.lote-combustible.pdf', ['lote' => $record->id]))
                ->openUrlInNewTab(),

            Actions\EditAction::make()
                ->visible(fn ($record) => $record->estado === EstadoLoteEnum::BORRADOR),

            //NUEVO: Accion para iniciar asignacion operativa
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

        app(\App\Domain\Solicitudes\Services\Lotes\LoteCombustibleService::class)
            ->iniciarAsignacion($record->id, auth()->id());

        return redirect(
            $this->getResource()::getUrl('view', ['record' => $record])
        );
    })
    ->visible(
        fn ($record) =>
            $record->estado === EstadoLoteEnum::FINALIZADO
            && auth()->user()->hasAnyRole([
                'operativo',
                'admin',
                'super_admin',
            ])
    ),    
            //NUEVO: Accion para completar lote con montos ya asignados  
            Actions\Action::make('completarLote')
                ->label('Completar Lote')
                ->icon('heroicon-o-check-badge')
                ->color('success')
                ->requiresConfirmation()
                ->modalHeading('Completar lote')
                ->modalDescription('El lote será marcado como COMPLETADO y ya no podrá modificarse.')
                ->action(function ($record) {

                app(\App\Domain\Solicitudes\Services\Lotes\LoteCombustibleService::class)
                ->completarLote($record->id, auth()->id());

            return redirect(
                $this->getResource()::getUrl('view', ['record' => $record])
            );
        })
            ->visible(
                fn ($record) =>
                $record->estado === EstadoLoteEnum::EN_PROCESO
                && auth()->user()->hasAnyRole(['operativo', 'admin', 'super_admin'])
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
