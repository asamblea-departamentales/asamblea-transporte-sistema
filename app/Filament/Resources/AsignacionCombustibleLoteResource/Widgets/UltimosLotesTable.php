<?php

namespace App\Filament\Resources\AsignacionCombustibleLoteResource\Widgets;

use App\Models\AsignacionCombustibleLote;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;

class UltimosLotesTable extends TableWidget
{
    protected static ?string $heading = 'Últimos Lotes';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                AsignacionCombustibleLote::query()
                    ->latest()
                    ->limit(10)
            )
            ->columns([
                Tables\Columns\TextColumn::make('fecha')
                    ->date('d/m/Y'),

                Tables\Columns\TextColumn::make('estado')
                    ->badge(),

                Tables\Columns\TextColumn::make('detalles_count')
                    ->counts('detalles')
                    ->label('Vehículos'),

                Tables\Columns\TextColumn::make('total_monto')
                    ->money('USD', true),
            ]);
    }
}
