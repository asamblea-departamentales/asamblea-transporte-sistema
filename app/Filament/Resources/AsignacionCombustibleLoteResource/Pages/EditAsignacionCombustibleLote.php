<?php

namespace App\Filament\Resources\AsignacionCombustibleLoteResource\Pages;

use App\Filament\Resources\AsignacionCombustibleLoteResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditAsignacionCombustibleLote extends EditRecord
{
    protected static string $resource = AsignacionCombustibleLoteResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
            Actions\Action::make('finalizar')
                ->label('Finalizar Lote')
                ->icon('heroicon-o-lock-closed')
                ->color('success')
                ->requiresConfirmation()
                ->modalHeading('Finalizar lote')
                ->modalDescription('Una vez finalizado, no se podrán realizar más cambios en este lote.')
                ->action(function ($record) {
                    app(\App\Domain\Solicitudes\Services\Lotes\LoteCombustibleService::class)->finalizarLote($record->id, auth()->id());

                    return redirect($this->getResource()::getUrl('view', ['record' => $record]));
                })
                ->visible(fn ($record) => $record->estado === \App\Domain\Solicitudes\Enums\EstadoLoteEnum::BORRADOR),
        ];
    }

    public function getRelationManagers(): array
    {
        return [
            \App\Filament\Resources\AsignacionCombustibleLoteResource\RelationManagers\DetallesRelationManager::class,
        ];
    }
}
