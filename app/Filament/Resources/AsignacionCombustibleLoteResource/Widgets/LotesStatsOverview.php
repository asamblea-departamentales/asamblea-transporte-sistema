<?php
namespace App\Filament\Resources\AsignacionCombustibleLoteResource\Widgets;

use App\Domain\Solicitudes\Enums\EstadoLoteEnum;
use App\Models\AsignacionCombustibleLote;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class LotesStatsOverview extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        $hoy = now()->toDateString();

        return [

            Stat::make(
                'Lotes Hoy',
                AsignacionCombustibleLote::whereDate('fecha', $hoy)->count()
            )
                ->description('Lotes creados hoy')
                ->color('primary'),

            Stat::make(
                'Pendientes',
                AsignacionCombustibleLote::where('estado', EstadoLoteEnum::BORRADOR)->count()
            )->description('Aún sin finalizar')
                ->color('warning'),

            Stat::make(
                'En Proceso',
                AsignacionCombustibleLote::where('estado', EstadoLoteEnum::EN_PROCESO)->count()
            )
                ->description('Operativo asignando')
                ->color('info'),

            Stat::make(
                'Completados',
                AsignacionCombustibleLote::where('estado', EstadoLoteEnum::COMPLETADO)->count()
            )
                ->description('Lotes cerrados')
                ->color('success'),

            Stat::make(
                'Monto Total',
                '$' . number_format(
                    AsignacionCombustibleLote::sum('total_monto'),
                    2
                )
            )
                ->description('Asignación histórica')
                ->color('gray'),
        ];
    }
}