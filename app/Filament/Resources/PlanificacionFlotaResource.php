<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PlanificacionFlotaResource\Pages;
use App\Models\Vehiculo;
use App\Models\SolicitudTransporte;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class PlanificacionFlotaResource extends Resource
{
    protected static ?string $model = Vehiculo::class;

    protected static ?string $navigationIcon = 'heroicon-o-truck';

    protected static ?string $navigationLabel = 'Planificación de Flota';

    protected static ?string $navigationGroup = 'Gestión Operativa';

    protected static ?int $navigationSort = 2;

    public static function table(Table $table): Table
    {
        return $table
            ->columns([

                Tables\Columns\TextColumn::make('placa')
                    ->label('Vehículo')
                    ->searchable(),

                Tables\Columns\TextColumn::make('tipo.nombre')
                    ->label('Tipo'),

                Tables\Columns\TextColumn::make('capacidad_personas')
                    ->label('Capacidad'),

                Tables\Columns\TextColumn::make('asignacionVigenteMotorista.motorista.nombre')
                    ->label('Motorista'),

                Tables\Columns\TextColumn::make('estado_operativo')
                    ->label('Estado actual')
                    ->badge()
                    ->getStateUsing(function (Vehiculo $record) {

                        $solicitud = SolicitudTransporte::where('vehiculo_id', $record->id)
                            ->whereIn('estado', [
                                EstadoSolicitudEnum::PROGRAMADA,
                                EstadoSolicitudEnum::EN_EJECUCION,
                            ])
                            ->orderBy('fecha_salida')
                            ->first();

                        if (!$solicitud) {
                            return 'Disponible';
                        }

                        if ($solicitud->estado === EstadoSolicitudEnum::EN_EJECUCION) {
                            return 'En ejecución';
                        }

                        return 'Programado';
                    })
                    ->colors([
                        'success' => 'Disponible',
                        'warning' => 'Programado',
                        'danger' => 'En ejecución',
                    ]),

                Tables\Columns\TextColumn::make('proximo_viaje')
                    ->label('Próximo viaje')
                    ->getStateUsing(function (Vehiculo $record) {

                        $solicitud = SolicitudTransporte::where('vehiculo_id', $record->id)
                            ->whereIn('estado', [
                                EstadoSolicitudEnum::PROGRAMADA,
                                EstadoSolicitudEnum::APROBADA,
                            ])
                            ->orderBy('fecha_salida')
                            ->first();

                        if (!$solicitud) {
                            return '—';
                        }

                        return $solicitud->fecha_salida?->format('d/m/Y H:i');
                    }),

            ])
            ->actions([

                Tables\Actions\Action::make('ver_solicitudes')
                    ->label('Ver solicitudes')
                    ->icon('heroicon-o-eye')
                    ->url(fn (Vehiculo $record) =>
                        route('filament.admin.resources.solicitud-transportes.index', [
                            'tableFilters[vehiculo_id][value]' => $record->id
                        ])
                    ),

            ])
            ->defaultSort('placa');
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->where('activo', true);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPlanificacionFlotas::route('/'),
        ];
    }
}