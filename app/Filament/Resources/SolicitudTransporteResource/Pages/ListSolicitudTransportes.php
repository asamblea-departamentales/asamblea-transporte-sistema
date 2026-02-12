<?php

namespace App\Filament\Resources\SolicitudTransporteResource\Pages;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Filament\Resources\SolicitudTransporteResource;
use Filament\Resources\Pages\ListRecords;
use Filament\Resources\Components\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListSolicitudTransportes extends ListRecords
{
    protected static string $resource = SolicitudTransporteResource::class;

    public function getTabs(): array
    {
        return [
            'todas' => Tab::make('Todas')
                ->badge(fn () => $this->baseQuery()->count())
                ->modifyQueryUsing(fn (Builder $query) => $this->baseQuery($query)),

            'pendientes' => Tab::make('Pendientes')
                ->badge(fn () => $this->baseQuery()->where('estado', EstadoSolicitudEnum::PENDIENTE)->count())
                ->modifyQueryUsing(fn (Builder $query) => $this->baseQuery($query)->where('estado', EstadoSolicitudEnum::PENDIENTE)),

            'en_revision' => Tab::make('En revisión')
                ->badge(fn () => $this->baseQuery()->where('estado', EstadoSolicitudEnum::EN_REVISION)->count())
                ->modifyQueryUsing(fn (Builder $query) => $this->baseQuery($query)->where('estado', EstadoSolicitudEnum::EN_REVISION)),

            'pre_aprobadas' => Tab::make('Pre-aprobadas')
                ->badge(fn () => $this->baseQuery()->where('estado', EstadoSolicitudEnum::PRE_APROBADA)->count())
                ->modifyQueryUsing(fn (Builder $query) => $this->baseQuery($query)->where('estado', EstadoSolicitudEnum::PRE_APROBADA)),

            'programadas' => Tab::make('Programadas')
                ->badge(fn () => $this->baseQuery()->where('estado', EstadoSolicitudEnum::PROGRAMADA)->count())
                ->modifyQueryUsing(fn (Builder $query) => $this->baseQuery($query)->where('estado', EstadoSolicitudEnum::PROGRAMADA)),

            'historial' => Tab::make('Historial')
                ->badge(fn () => $this->baseQuery()
                    ->whereIn('estado', [
                        EstadoSolicitudEnum::RECHAZADA,
                        EstadoSolicitudEnum::COMPLETADA,
                        EstadoSolicitudEnum::CANCELADA,
                    ])->count()
                )
                ->modifyQueryUsing(fn (Builder $query) => $this->baseQuery($query)
                    ->whereIn('estado', [
                        EstadoSolicitudEnum::RECHAZADA,
                        EstadoSolicitudEnum::COMPLETADA,
                        EstadoSolicitudEnum::CANCELADA,
                    ])
                ),
        ];
    }

    /**
     * Query base para TODOS los tabs (para no repetir).
     * - Incluye relaciones para evitar N+1
     * - Mantiene tu orden por fecha_salida asc
     */
    private function baseQuery(?Builder $query = null): Builder
    {
        $query ??= parent::getTableQuery();

        return $query
            ->with(['solicitante', 'unidad', 'autorizador'])
            ->orderBy('fecha_salida', 'asc');
    }
}
