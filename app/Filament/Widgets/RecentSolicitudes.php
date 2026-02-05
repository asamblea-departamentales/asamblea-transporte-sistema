<?php

namespace App\Filament\Widgets;

use App\Models\SolicitudTransporte;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class RecentSolicitudes extends BaseWidget
{
    // Esto hace que el cuadro ocupe todo el ancho de la pantalla
    protected int | string | array $columnSpan = 'full';

    protected static ?int $sort = 2;
    protected static ?string $heading = 'Solicitudes de Transporte Recientes';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                // Tomamos las últimas 5 solicitudes creadas
                SolicitudTransporte::query()->latest()->limit(5)
            )
            ->columns([
                Tables\Columns\TextColumn::make('codigo')
                    ->label('Código')
                    ->searchable(),
                
                Tables\Columns\TextColumn::make('tipo')
                    ->label('Tipo de Solicitud'),

                Tables\Columns\TextColumn::make('unidadSolicitante.nombre')
                    ->label('Unidad'),

                Tables\Columns\TextColumn::make('estado')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pendiente' => 'warning',
                        'aprobado' => 'success',
                        'rechazado' => 'danger',
                        default => 'gray',
                    }),
                
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Fecha Creación')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ]);
    }
}