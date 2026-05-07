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
                        ->color(fn (EstadoLoteEnum $state) => match ($state) {
                            EstadoLoteEnum::BORRADOR => 'warning',
                            EstadoLoteEnum::FINALIZADO => 'success',
                        })
                        ->formatStateUsing(fn (EstadoLoteEnum $state) => ucfirst($state->value)),
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
