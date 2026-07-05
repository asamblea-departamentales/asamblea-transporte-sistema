<?php

namespace App\Filament\Resources\LiquidacionCombustibleResource\Pages;

use App\Filament\Resources\LiquidacionCombustibleResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewLiquidacionCombustible extends ViewRecord
{
    protected static string $resource = LiquidacionCombustibleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // Acción para imprimir el PDF desde la cabecera
            Actions\Action::make('print')
                ->label('Imprimir PDF')
                ->color('gray')
                ->icon('heroicon-o-printer')
                ->url(fn ($record) => route('liquidacion.pdf', $record))
                ->openUrlInNewTab(),

            // Si el liquidador necesitara corregir la liquidación creada
            // Actions\EditAction::make(),
        ];
    }
}
