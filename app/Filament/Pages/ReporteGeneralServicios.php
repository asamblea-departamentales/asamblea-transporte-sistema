<?php

namespace App\Filament\Pages;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use App\Models\Vehiculo;
use App\Domain\Solicitudes\Services\Reportes\ReporteGeneralServiciosService;
use Filament\Actions\Action;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Pages\Page;
use Filament\Forms\Concerns\InteractsWithForms;
use Illuminate\Support\Collection;
use Livewire\WithPagination;

class ReporteGeneralServicios extends Page implements Forms\Contracts\HasForms
{
    use InteractsWithForms;
    use WithPagination;

    protected static ?string $navigationGroup = 'Reportes';
    protected static ?string $navigationLabel = 'Informe General de Servicios';
    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';
    protected static ?int $navigationSort = 6;

    protected static string $view = 'filament.pages.reporte-general-servicios';

    public ?string $date_from = null;
    public ?string $date_to = null;
    public ?string $tipo_servicio = null;
    public ?string $estado = null;
    public ?string $prioridad = null;
    public ?int $vehiculo_id = null;

    public int $kpi_total = 0;
    public int $kpi_transporte = 0;
    public int $kpi_combustible = 0;
    public int $kpi_mantenimiento = 0;
    public int $kpi_aprobadas = 0;
    public int $kpi_rechazadas = 0;
    public float $kpi_monto_total = 0;

    public function mount(): void
    {
        $this->date_from = now()->startOfMonth()->startOfDay()->toDateTimeString();
        $this->date_to   = now()->endOfMonth()->endOfDay()->toDateTimeString();

        $this->form->fill($this->getFilterState());
        $this->refreshKpis();
    }

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['jefe', 'admin', 'ti', 'operativo', 'liquidador', 'super_admin']) ?? false;
    }

    public function updated($propertyName): void
    {
        if (in_array($propertyName, [
            'date_from',
            'date_to',
            'tipo_servicio',
            'estado',
            'prioridad',
            'vehiculo_id',
        ], true)) {
            $this->resetPage();
            $this->refreshKpis();
        }
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('export_pdf')
                ->label('Exportar PDF')
                ->icon('heroicon-o-printer')
                ->url(fn () => route('reportes.general-servicios.pdf', $this->getFilterState()))
                ->openUrlInNewTab(),
        ];
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Grid::make(12)->schema([
                Forms\Components\Section::make('Filtros del reporte')
                    ->description('Consulta consolidada de transporte, combustible y mantenimiento.')
                    ->icon('heroicon-o-funnel')
                    ->collapsible()
                    ->columnSpan(12)
                    ->schema([
                        Forms\Components\Grid::make(12)->schema([

                            Forms\Components\DateTimePicker::make('date_from')
                                ->label('Desde')
                                ->seconds(false)
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\DateTimePicker::make('date_to')
                                ->label('Hasta')
                                ->seconds(false)
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\Select::make('tipo_servicio')
                                ->label('Tipo de servicio')
                                ->options([
                                    'transporte' => 'Transporte',
                                    'combustible' => 'Combustible',
                                    'mantenimiento' => 'Mantenimiento',
                                ])
                                ->native(false)
                                ->searchable()
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 2]),

                            Forms\Components\Select::make('estado')
                                ->label('Estado')
                                ->options(
                                    collect(EstadoSolicitudEnum::cases())
                                        ->mapWithKeys(fn ($c) => [$c->value => str($c->name)->replace('_', ' ')->title()])
                                )
                                ->native(false)
                                ->searchable()
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 2]),

                            Forms\Components\Select::make('prioridad')
                                ->label('Prioridad')
                                ->options(
                                    collect(PrioridadSolicitudEnum::cases())
                                        ->mapWithKeys(fn ($c) => [$c->value => strtoupper($c->value)])
                                )
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 2]),

                            Forms\Components\Select::make('vehiculo_id')
                                ->label('Vehículo')
                                ->options(fn () => Vehiculo::orderBy('placa')->pluck('placa', 'id'))
                                ->searchable()
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\Actions::make([
                                Forms\Components\Actions\Action::make('mes_actual')
                                    ->label('Mes actual')
                                    ->action(function () {
                                        $this->date_from = now()->startOfMonth()->startOfDay()->toDateTimeString();
                                        $this->date_to   = now()->endOfMonth()->endOfDay()->toDateTimeString();
                                        $this->form->fill($this->getFilterState());
                                        $this->resetPage();
                                        $this->refreshKpis();
                                    }),

                                Forms\Components\Actions\Action::make('limpiar')
                                    ->label('Limpiar')
                                    ->color('gray')
                                    ->action(function () {
                                        $this->date_from = null;
                                        $this->date_to = null;
                                        $this->tipo_servicio = null;
                                        $this->estado = null;
                                        $this->prioridad = null;
                                        $this->vehiculo_id = null;

                                        $this->form->fill($this->getFilterState());
                                        $this->resetPage();
                                        $this->refreshKpis();
                                    }),
                            ])
                                ->columnSpan(12)
                                ->alignEnd(),
                        ]),
                    ]),
            ]),
        ])->statePath('');
    }

    public function getRowsProperty(): Collection
    {
        return app(ReporteGeneralServiciosService::class)
            ->obtenerDatos($this->getFilterState());
    }

    public function getPaginatedRowsProperty()
    {
        $perPage = 10;
        $page = $this->getPage();

        return new \Illuminate\Pagination\LengthAwarePaginator(
            $this->rows->forPage($page, $perPage)->values(),
            $this->rows->count(),
            $perPage,
            $page,
            ['path' => request()->url(), 'pageName' => 'page']
        );
    }

    private function refreshKpis(): void
    {
        $kpis = app(ReporteGeneralServiciosService::class)
            ->getKpis($this->getFilterState());

        $this->kpi_total = $kpis['total'];
        $this->kpi_transporte = $kpis['transporte'];
        $this->kpi_combustible = $kpis['combustible'];
        $this->kpi_mantenimiento = $kpis['mantenimiento'];
        $this->kpi_aprobadas = $kpis['aprobadas'];
        $this->kpi_rechazadas = $kpis['rechazadas'];
        $this->kpi_monto_total = (float) $kpis['monto_total'];
    }

    private function getFilterState(): array
    {
        return [
            'date_from' => $this->date_from,
            'date_to' => $this->date_to,
            'tipo_servicio' => $this->tipo_servicio,
            'estado' => $this->estado,
            'prioridad' => $this->prioridad,
            'vehiculo_id' => $this->vehiculo_id,
        ];
    }

    public function rangeLabel(): string
    {
        $from = $this->date_from ? \Carbon\Carbon::parse($this->date_from)->format('d/m/Y') : 'Inicio';
        $to   = $this->date_to ? \Carbon\Carbon::parse($this->date_to)->format('d/m/Y') : 'Fin';

        return "Periodo: {$from} al {$to}";
    }
}