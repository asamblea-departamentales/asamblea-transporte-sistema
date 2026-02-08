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
                SolicitudTransporte::query()
                    ->with(['unidad']) // ✅ cargar relación usada en la tabla
                    ->latest()
                    ->limit(5)
            )
            ->columns([
                Tables\Columns\TextColumn::make('codigo')
                    ->label('Código')
                    ->searchable(),

                // ✅ no existe "tipo" en SolicitudTransporte, así que ponemos fijo
                Tables\Columns\TextColumn::make('tipo_solicitud')
                    ->label('Tipo de Solicitud')
                    ->state('Transporte'),

                // ✅ relación correcta: unidad()
                Tables\Columns\TextColumn::make('unidad.nombre')
                    ->label('Unidad'),

                Tables\Columns\TextColumn::make('estado')
                    ->badge()
                    ->color(fn ($state): string => match ($state->value ?? $state) {
                        'pendiente' => 'warning',
                        'aprobada', 'aprobado' => 'success',
                        'rechazada', 'rechazado' => 'danger',
                        'borrador' => 'gray',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn ($state) => ucfirst($state->value ?? $state)),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Fecha Creación')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ]);
    }
}
