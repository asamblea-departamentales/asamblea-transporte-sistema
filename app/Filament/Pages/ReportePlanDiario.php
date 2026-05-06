<?php

namespace App\Filament\Pages;

use App\Domain\Solicitudes\Services\Reportes\ReportePlanDiarioService;
use Dompdf\FrameDecorator\Page;
use Filament\Forms\Form;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Widgets\StatsOverview;
use Illuminate\Support\Carbon;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;

class ReportePlanDiario extends Page
{
    protected static ?string $title = 'Plan Diario de Transporte';
    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';
    protected static ?string $navigationGroup = 'Reportes';

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

    public function render()
    {
        return view('filament.pages.reporte-plan-diario', [
            'datos' => $this->datos,
            'kpis' => $this->kpis,
            'fecha' => $this->fecha_seleccionada,
        ]);
    }
}