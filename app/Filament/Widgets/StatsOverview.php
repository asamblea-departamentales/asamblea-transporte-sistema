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

        // ✅ KPI “operativos” para Jefe
        if ($user->hasRole('jefe')) {
            return [
                Stat::make('Pendientes', SolicitudTransporte::where('estado', EstadoSolicitudEnum::PENDIENTE)->count())
                    ->description('Por revisar')
                    ->descriptionIcon('heroicon-m-inbox')
                    ->color('warning'),

                Stat::make('En revisión', SolicitudTransporte::where('estado', EstadoSolicitudEnum::EN_REVISION)->count())
                    ->description('Con observación / seguimiento')
                    ->descriptionIcon('heroicon-m-eye')
                    ->color('info'),

                Stat::make('Pre-aprobadas', SolicitudTransporte::where('estado', EstadoSolicitudEnum::PRE_APROBADA)->count())
                    ->description('Listas para programar')
                    ->descriptionIcon('heroicon-m-clock')
                    ->color('warning'),

                Stat::make('Programadas (7 días)', SolicitudTransporte::where('estado', EstadoSolicitudEnum::PROGRAMADA)
                        ->whereBetween('fecha_salida', [now(), now()->addDays(7)])
                        ->count())
                    ->description('Próximas salidas')
                    ->descriptionIcon('heroicon-m-calendar-days')
                    ->color('success'),
            ];
        }

        // ✅ KPI para TI/Admin
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
                ->description('Registradas en el sistema')
                ->descriptionIcon('heroicon-m-truck')
                ->color('info'),
        ];
    }
}
