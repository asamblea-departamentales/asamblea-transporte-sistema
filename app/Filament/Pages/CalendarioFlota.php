<?php

namespace App\Filament\Pages;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Filament\Resources\PlanificacionFlotaResource;
use App\Models\SolicitudTransporte;
use App\Models\Vehiculo;
use Filament\Actions\Action;
use Filament\Pages\Page;

class CalendarioFlota extends Page
{
    protected static ?string $navigationIcon  = 'heroicon-o-calendar-days';
    protected static ?string $navigationLabel = 'Calendario de Flota';
    protected static ?string $navigationGroup = 'Gestión Operativa';
    protected static ?int    $navigationSort  = 3;

    // Ocultar del menú lateral — se accede desde PlanificacionFlota
    protected static bool $shouldRegisterNavigation = false;

    protected static string $view = 'filament.pages.calendario-flota';

    public static function canAccess(): bool
    {
        return auth()->check() && auth()->user()->hasAnyRole([
            'super_admin', 'ti', 'jefe', 'operativo',
        ]);
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('volver_flota')
                ->label('← Planificación de Flota')
                ->color('gray')
                ->url(PlanificacionFlotaResource::getUrl('index')),
        ];
    }

    public function getEventosJson(): string
    {
        $solicitudes = SolicitudTransporte::query()
            ->whereNotNull('vehiculo_id')
            ->whereIn('estado', [
                EstadoSolicitudEnum::PROGRAMADA,
                EstadoSolicitudEnum::EN_EJECUCION,
                EstadoSolicitudEnum::APROBADA,
            ])
            ->with(['vehiculo', 'solicitante', 'unidad'])
            ->get()
            ->map(function (SolicitudTransporte $s) {

                $placa       = $s->vehiculo?->placa ?? 'Vehículo';
                $destino     = $s->destino ?? '—';
                $origen      = $s->origen ?? '—';
                $solicitante = $s->solicitante?->name ?? '—';
                $unidad      = $s->unidad?->nombre ?? '—';
                $personas    = $s->cantidad_personas ?? '—';

                $color = match ($s->estado) {
                    EstadoSolicitudEnum::EN_EJECUCION => '#D85A30',
                    EstadoSolicitudEnum::PROGRAMADA   => '#2563eb',
                    EstadoSolicitudEnum::APROBADA     => '#BA7517',
                    default                           => '#6b7280',
                };

                return [
                    'id'              => $s->id,
                    'title'           => "{$placa} → {$destino}",
                    'start'           => $s->fecha_salida?->toIso8601String(),
                    'end'             => $s->fecha_retorno?->toIso8601String(),
                    'backgroundColor' => $color,
                    'borderColor'     => $color,
                    'textColor'       => '#ffffff',
                    'extendedProps'   => [
                        'codigo'      => $s->codigo,
                        'placa'       => $placa,
                        'origen'      => $origen,
                        'destino'     => $destino,
                        'solicitante' => $solicitante,
                        'unidad'      => $unidad,
                        'personas'    => $personas,
                        'estado'      => $s->estado?->value ?? '—',
                        'url_view'    => \App\Filament\Resources\SolicitudTransporteResource::getUrl('view', ['record' => $s->id]),
                    ],
                ];
            })
            ->toArray();

        return json_encode(array_values($solicitudes));
    }

    public function getVehiculosOptions(): string
    {
        $vehiculos = Vehiculo::where('activo', true)
            ->orderBy('placa')
            ->pluck('placa', 'id')
            ->toArray();

        return json_encode($vehiculos);
    }
}