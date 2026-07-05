<?php

namespace App\Filament\Resources\AsignacionCombustibleLoteResource\Widgets;

use App\Domain\Solicitudes\Enums\EstadoLoteEnum;
use App\Models\AsignacionCombustibleLote;
use Filament\Widgets\ChartWidget;

class EstadoOperativoChart extends ChartWidget
{
    protected static ?string $heading = 'Estado Operativo';

    protected function getData(): array
    {
        return [
            'datasets' => [
                [
                    'label' => 'Lotes',
                    'data' => [
                        AsignacionCombustibleLote::where('estado', EstadoLoteEnum::BORRADOR)->count(),
                        AsignacionCombustibleLote::where('estado', EstadoLoteEnum::FINALIZADO)->count(),
                        AsignacionCombustibleLote::where('estado', EstadoLoteEnum::EN_PROCESO)->count(),
                        AsignacionCombustibleLote::where('estado', EstadoLoteEnum::COMPLETADO)->count(),
                    ],
                ],
            ],

            'labels' => [
                'Borrador',
                'Finalizado',
                'En Proceso',
                'Completado',
            ],
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}
