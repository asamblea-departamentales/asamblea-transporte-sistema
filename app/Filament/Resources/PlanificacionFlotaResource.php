<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PlanificacionFlotaResource\Pages;
use App\Models\Vehiculo;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Filament\Tables\Columns\Layout\Stack;
use Filament\Tables\Columns\Layout\View;

class PlanificacionFlotaResource extends Resource
{
    protected static ?string $model = Vehiculo::class;
    protected static ?string $navigationIcon = 'heroicon-o-truck';
    protected static ?string $navigationGroup = 'Gestión Operativa';
    protected static ?string $navigationLabel = 'Planificación de Flota';

    public static function table(Table $table): Table
    {
        return $table
            ->contentGrid([
                'md' => 2,
                'xl' => 3,
            ])
            ->columns([
                // Usamos View Layout para un diseño limpio y moderno
                Tables\Columns\Layout\View::make('filament.resources.planificacion.vehiculo-card')
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('tipo_id')
                    ->label('Tipo de Vehículo')
                    ->relationship('tipo', 'nombre'),
                
                Tables\Filters\TernaryFilter::make('tiene_motorista')
                    ->label('Asignación')
                    ->placeholder('Todos')
                    ->trueLabel('Con motorista')
                    ->falseLabel('Sin motorista')
                    ->queries(
                        true: fn (Builder $query) => $query->whereHas('asignacionVigenteMotorista'),
                        false: fn (Builder $query) => $query->whereDoesntHave('asignacionVigenteMotorista'),
                    ),
            ])
            ->actions([
                Tables\Actions\Action::make('ver_solicitudes')
                    ->label('Ver Historial')
                    ->icon('heroicon-m-calendar-days')
                    ->color('gray')
                    ->url(fn (Vehiculo $record) => SolicitudTransporteResource::getUrl('index', [
                        'tableFilters[vehiculo_id][value]' => $record->id,
                    ])),
                
                // Acción rápida para asignar motorista si no tiene
                Tables\Actions\Action::make('asignar_motorista')
                    ->icon('heroicon-m-user-plus')
                    ->hidden(fn (Vehiculo $record) => $record->asignacionVigenteMotorista()->exists())
                    ->color('info')
                    // Aquí podrías abrir un modal de registro
            ]);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->where('activo', true)
            ->with([
                'tipo',
                'marca',
                'modelo',
                'asignacionVigenteMotorista.motorista',
                // Traemos solo la solicitud relevante para el estado actual
                'solicitudes' => fn($q) => $q->whereIn('estado', [
                        EstadoSolicitudEnum::EN_EJECUCION,
                        EstadoSolicitudEnum::PROGRAMADA
                    ])->orderBy('fecha_salida')->limit(1)
            ]);
    }
}