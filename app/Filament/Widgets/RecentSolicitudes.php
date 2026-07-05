<?php

namespace App\Filament\Widgets;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Filament\Resources\SolicitudCombustibleResource;
use App\Filament\Resources\SolicitudMantenimientoResource;
use App\Filament\Resources\SolicitudTransporteResource;
use App\Models\SolicitudCombustible;
use App\Models\SolicitudMantenimiento;
use App\Models\SolicitudTransporte;
use Filament\Widgets\Widget;

class RecentSolicitudes extends Widget
{
    protected static ?int $sort = 6;

    protected int|string|array $columnSpan = 'full';

    protected static string $view = 'filament.widgets.recent-solicitudes';

    public static function canView(): bool
    {
        return auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'super_admin', 'superadmin', 'operativo', 'liquidador']);
    }

    public function getSolicitudes(): \Illuminate\Support\Collection
    {
        $estadosPendientes = [
            EstadoSolicitudEnum::PENDIENTE->value,
            EstadoSolicitudEnum::EN_REVISION->value,
            EstadoSolicitudEnum::PRE_APROBADA->value,
        ];

        $transporte = SolicitudTransporte::query()
            ->with(['solicitante'])
            ->whereIn('estado', $estadosPendientes)
            ->latest('created_at')
            ->limit(5)
            ->get()
            ->map(fn ($s) => [
                'codigo' => $s->codigo,
                'solicitante' => $s->solicitante?->name ?? '-',
                'estado' => $s->estado?->value ?? $s->estado,
                'fecha' => optional($s->fecha_salida ?? $s->created_at)->format('d/m/Y H:i'),
                'modulo' => 'Transporte',
                'url' => SolicitudTransporteResource::getUrl('view', ['record' => $s->id]),
            ]);

        $mantenimiento = SolicitudMantenimiento::query()
            ->with(['solicitante', 'vehiculo'])
            ->whereIn('estado', $estadosPendientes)
            ->latest('created_at')
            ->limit(5)
            ->get()
            ->map(fn ($s) => [
                'codigo' => $s->codigo,
                'solicitante' => $s->solicitante?->name ?? '-',
                'estado' => $s->estado?->value ?? $s->estado,
                'fecha' => optional($s->fecha_sugerida ?? $s->created_at)->format('d/m/Y H:i'),
                'modulo' => 'Mantenimiento',
                'url' => SolicitudMantenimientoResource::getUrl('view', ['record' => $s->id]),
            ]);

        $combustible = SolicitudCombustible::query()
            ->with(['solicitante', 'vehiculo'])
            ->whereIn('estado', $estadosPendientes)
            ->latest('created_at')
            ->limit(5)
            ->get()
            ->map(fn ($s) => [
                'codigo' => $s->codigo,
                'solicitante' => $s->solicitante?->name ?? '-',
                'estado' => $s->estado?->value ?? $s->estado,
                'fecha' => optional($s->fecha_solicitud ?? $s->created_at)->format('d/m/Y H:i'),
                'modulo' => 'Combustible',
                'url' => SolicitudCombustibleResource::getUrl('view', ['record' => $s->id]),
            ]);

        return $transporte
            ->concat($mantenimiento)
            ->concat($combustible)
            ->sortByDesc('fecha')
            ->take(12)
            ->values();
    }
}
