<?php

namespace App\Filament\Widgets;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\SolicitudTransporte;
use App\Models\SolicitudMantenimiento;
use App\Models\SolicitudCombustible;
use App\Models\UnidadSolicitante;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected static ?int $sort = 1;
    protected int|string|array $columnSpan = 'full';

    public static function canView(): bool
    {
        return auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'superadmin', 'operativo', 'liquidador']);
    }

    protected function getStats(): array
    {
        $user = auth()->user();

        $estadosPendientes = [
            EstadoSolicitudEnum::PENDIENTE,
            EstadoSolicitudEnum::EN_REVISION,
            EstadoSolicitudEnum::PRE_APROBADA,
        ];

        if ($user->hasRole('jefe')) {
            return [
                Stat::make('Pendientes',
                    SolicitudTransporte::whereIn('estado', $estadosPendientes)->count()
                    + SolicitudMantenimiento::whereIn('estado', $estadosPendientes)->count()
                    + SolicitudCombustible::whereIn('estado', $estadosPendientes)->count()
                )
                    ->description('Transporte · Mantenimiento · Combustible')
                    ->descriptionIcon('heroicon-m-inbox')
                    ->color('warning'),

                Stat::make('En Revisión',
                    SolicitudTransporte::where('estado', EstadoSolicitudEnum::EN_REVISION)->count()
                    + SolicitudMantenimiento::where('estado', EstadoSolicitudEnum::EN_REVISION)->count()
                    + SolicitudCombustible::where('estado', EstadoSolicitudEnum::EN_REVISION)->count()
                )
                    ->description('En seguimiento')
                    ->descriptionIcon('heroicon-m-eye')
                    ->color('info'),

                Stat::make('Pre-Aprobadas',
                    SolicitudTransporte::where('estado', EstadoSolicitudEnum::PRE_APROBADA)->count()
                    + SolicitudMantenimiento::where('estado', EstadoSolicitudEnum::PRE_APROBADA)->count()
                    + SolicitudCombustible::where('estado', EstadoSolicitudEnum::PRE_APROBADA)->count()
                )
                    ->description('Listas para aprobar')
                    ->descriptionIcon('heroicon-m-clock')
                    ->color('warning'),

                Stat::make('Riesgo (<48h)',
                    SolicitudTransporte::whereIn('estado', $estadosPendientes)
                        ->whereBetween('fecha_salida', [now(), now()->addDays(2)])
                        ->count()
                )
                    ->description('Transportes que salen pronto')
                    ->descriptionIcon('heroicon-m-exclamation-triangle')
                    ->color('danger'),
            ];
        }

        // TI / Admin — totales globales
        return [
            Stat::make('Usuarios', User::count())
                ->description('Personal con acceso')
                ->descriptionIcon('heroicon-m-users')
                ->color('primary'),

            Stat::make('Unidades', UnidadSolicitante::count())
                ->description('Unidades registradas')
                ->descriptionIcon('heroicon-m-building-office')
                ->color('success'),

            Stat::make('Transporte',
                SolicitudTransporte::whereIn('estado', $estadosPendientes)->count()
            )
                ->description('Solicitudes pendientes')
                ->descriptionIcon('heroicon-m-truck')
                ->color('info'),

            Stat::make('Mantenimiento',
                SolicitudMantenimiento::whereIn('estado', $estadosPendientes)->count()
            )
                ->description('Solicitudes pendientes')
                ->descriptionIcon('heroicon-m-wrench-screwdriver')
                ->color('warning'),

            Stat::make('Combustible',
                SolicitudCombustible::whereIn('estado', $estadosPendientes)->count()
            )
                ->description('Solicitudes pendientes')
                ->descriptionIcon('heroicon-m-fire')
                ->color('success'),
        ];
    }
}