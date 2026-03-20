<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;
use App\Domain\Solicitudes\Services\Liquidaciones\LiquidacionUnifiedService;
use Livewire\Attributes\Url;

class PanelLiquidaciones extends Page
{
    protected static ?string $navigationGroup = 'Liquidación';
    protected static ?string $navigationLabel = 'Panel de Liquidación';
    protected static ?string $navigationIcon  = 'heroicon-o-check-badge';
    protected static string  $view            = 'filament.pages.panel-liquidaciones';

    #[Url]
    public string $fecha_desde = '';

    #[Url]
    public string $fecha_hasta = '';

    #[Url]
    public string $tipo        = '';   // '' | 'combustible' | 'mantenimiento'

    #[Url]
    public string $estado      = '';   // '' | 'pendiente' | 'liquidado'

    public function mount(): void
    {
        $this->fecha_desde = now()->startOfMonth()->format('Y-m-d');
        $this->fecha_hasta = now()->format('Y-m-d');
    }

    public function getData(): \Illuminate\Support\Collection
    {
        return app(LiquidacionUnifiedService::class)->getAll(
            fechaDesde: $this->fecha_desde ?: null,
            fechaHasta: $this->fecha_hasta ?: null,
            tipo:       $this->tipo        ?: null,
            estado:     $this->estado      ?: null,
        );
    }

    public function limpiarFiltros(): void
    {
        $this->fecha_desde = now()->startOfMonth()->format('Y-m-d');
        $this->fecha_hasta = now()->format('Y-m-d');
        $this->tipo        = '';
        $this->estado      = '';
    }

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['liquidador', 'jefe', 'operativo']);
    }
}