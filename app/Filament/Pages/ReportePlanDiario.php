<?php

namespace App\Filament\Pages;

use App\Domain\Solicitudes\Services\Reportes\ReportePlanDiarioService;
use Filament\Pages\Page;
use Illuminate\Support\Carbon;

class ReportePlanDiario extends Page
{
    protected static ?string $title = 'Plan Diario de Transporte';

    protected static ?string $navigationLabel = 'Plan Diario de Transporte';

    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';

    protected static ?string $navigationGroup = 'Operatividad Diaria';

    protected static string $view = 'filament.pages.reporte-plan-diario';

    public $fecha_seleccionada;

    public $datos = [];

    public $kpis = [];

    public function mount()
    {
        $this->fecha_seleccionada = now()->format('Y-m-d');
        $this->cargarDatos();
    }

    public function updatedFechaSeleccionada(): void
    {
        $this->cargarDatos();
    }

    protected function cargarDatos(): void
    {
        $service = app(ReportePlanDiarioService::class);
        $fecha = Carbon::parse($this->fecha_seleccionada);

        $this->datos = $service->obtenerPorFecha($fecha)->toArray();
        $this->kpis = $service->getKpis($fecha);
    }
}
