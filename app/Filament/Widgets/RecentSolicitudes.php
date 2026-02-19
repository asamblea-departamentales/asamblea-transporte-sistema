<?php

namespace App\Filament\Widgets;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Filament\Resources\SolicitudTransporteResource;
use App\Models\SolicitudTransporte;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class RecentSolicitudes extends BaseWidget
{
    protected int|string|array $columnSpan = 'full';

    protected static ?int $sort = 2;
    protected static ?string $heading = 'Bandeja de Aprobaciones';

    public static function canView(): bool
    {
        return auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'superadmin']);
    }

    public function table(Table $table): Table
    {
        return $table
            ->query(
                SolicitudTransporte::query()
                    ->with(['unidad', 'solicitante'])
                    ->whereIn('estado', [
                        EstadoSolicitudEnum::PENDIENTE,
                        EstadoSolicitudEnum::EN_REVISION,
                        EstadoSolicitudEnum::PRE_APROBADA,
                    ])
                    ->orderBy('fecha_salida', 'asc')
                    ->limit(8)
            )

            // ✅ Mobile feel: tarjetas
            ->contentGrid([
                'default' => 1,
                'md' => 2,
                'xl' => 3,
            ])

            // ✅ Tap en la tarjeta/fila
            ->recordUrl(fn (SolicitudTransporte $record) => SolicitudTransporteResource::getUrl('view', ['record' => $record]))

            ->columns([
                Tables\Columns\TextColumn::make('codigo')
                    ->label('Código')
                    ->weight('bold')
                    ->searchable()
                    ->sortable()
                    ->copyable()
                    ->description(fn (SolicitudTransporte $record) => $record->solicitante?->name ?? '-')
                    ->wrap(),

                Tables\Columns\TextColumn::make('estado')
                    ->label('Estado')
                    ->badge()
                    ->color(fn ($state): string => match ($state->value ?? $state) {
                        'pendiente' => 'warning',
                        'en_revision' => 'info',
                        'pre_aprobada' => 'warning',
                        'programada' => 'success',
                        'rechazada' => 'danger',
                        'borrador' => 'gray',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn ($state) => ucfirst($state->value ?? $state)),

                Tables\Columns\TextColumn::make('fecha_salida')
                    ->label('Salida')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),

                // 👇 Secundarias (mejor escondidas por defecto en móvil)
                Tables\Columns\TextColumn::make('tipo_solicitud')
                    ->label('Tipo')
                    ->state('Transporte')
                    ->badge()
                    ->color('info')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('unidad.nombre')
                    ->label('Unidad')
                    ->wrap()
                    ->lineClamp(2)
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('ruta_ui')
                    ->label('Ruta')
                    ->state(fn (SolicitudTransporte $record) =>
                        ($record->origen ?? '-') . ' → ' . ($record->destino ?? '-')
                    )
                    ->wrap()
                    ->lineClamp(2)
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->actions([
                Tables\Actions\Action::make('ver')
                    ->label('Ver')
                    ->icon('heroicon-o-eye')
                    ->button()
                    ->size('lg')
                    ->url(fn (SolicitudTransporte $record) => SolicitudTransporteResource::getUrl('view', ['record' => $record])),
            ])
            ->paginated(false); // widget tipo "bandeja" (sin paginación)
    }
}
