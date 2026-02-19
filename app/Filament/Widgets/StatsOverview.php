<?php

namespace App\Filament\Widgets;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\SolicitudTransporte;
use App\Models\UnidadSolicitante;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected static ?int $sort = 1;

    public static function canView(): bool
    {
        return auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'superadmin']);
    }

    protected function getStats(): array
    {
        $user = auth()->user();

        // ✅ KPI “operativos” para Jefe (mobile-friendly)
        if ($user->hasRole('jefe')) {
            return [
                Stat::make('Pendientes', SolicitudTransporte::where('estado', EstadoSolicitudEnum::PENDIENTE)->count())
                    ->description('Por revisar')
                    ->descriptionIcon('heroicon-m-inbox')
                    ->color('warning'),

                Stat::make('En revisión', SolicitudTransporte::where('estado', EstadoSolicitudEnum::EN_REVISION)->count())
                    ->description('En seguimiento')
                    ->descriptionIcon('heroicon-m-eye')
                    ->color('info'),

                Stat::make('Pre-aprobadas', SolicitudTransporte::where('estado', EstadoSolicitudEnum::PRE_APROBADA)->count())
                    ->description('Listas para programar')
                    ->descriptionIcon('heroicon-m-clock')
                    ->color('warning'),

                Stat::make('Riesgo (<48h)', SolicitudTransporte::whereIn('estado', [
                        EstadoSolicitudEnum::PENDIENTE,
                        EstadoSolicitudEnum::EN_REVISION,
                        EstadoSolicitudEnum::PRE_APROBADA,
                    ])
                    ->whereBetween('fecha_salida', [now(), now()->addDays(2)])
                    ->count())
                    ->description('Salen pronto')
                    ->descriptionIcon('heroicon-m-exclamation-triangle')
                    ->color('danger'),
            ];
        }

        // ✅ KPI para TI/Admin (también mobile-friendly, 3 stats)
        return [
            Stat::make('Usuarios', User::count())
                ->description('Personal con acceso')
                ->descriptionIcon('heroicon-m-users')
                ->color('primary'),

            Stat::make('Unidades', UnidadSolicitante::count())
                ->description('Unidades registradas')
                ->descriptionIcon('heroicon-m-building-office')
                ->color('success'),

            Stat::make('Solicitudes', SolicitudTransporte::count())
                ->description('En el sistema')
                ->descriptionIcon('heroicon-m-truck')
                ->color('info'),
        ];
    }
}
