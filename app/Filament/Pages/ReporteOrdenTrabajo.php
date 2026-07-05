<?php

namespace App\Filament\Pages;

use App\Domain\Solicitudes\Services\Reportes\ReporteOrdenTrabajoService;
use App\Models\User;
use App\Models\Vehiculo;
use App\Models\VehTipoMantenimiento;
use Filament\Actions\Action;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Form;
use Filament\Pages\Page;
use Filament\Tables;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ReporteOrdenTrabajo extends Page implements Forms\Contracts\HasForms, Tables\Contracts\HasTable
{
    use InteractsWithForms;
    use InteractsWithTable;

    protected static ?string $navigationGroup = 'Reportes';

    protected static ?string $navigationLabel = 'Orden de Trabajo';

    protected static ?string $navigationIcon = 'heroicon-o-wrench-screwdriver';

    protected static ?int $navigationSort = 8;

    protected static string $view = 'filament.pages.reporte-orden-trabajo';

    public ?string $date_from = null;

    public ?string $date_to = null;

    public ?int $vehiculo_id = null;

    public ?int $tipo_mantenimiento_id = null;

    public ?int $solicitante_id = null;

    public int $kpi_total = 0;

    public int $kpi_aprobadas = 0;

    public int $kpi_en_ejecucion = 0;

    public int $kpi_completadas = 0;

    public function mount(): void
    {
        $this->date_from = now()->startOfMonth()->startOfDay()->toDateTimeString();
        $this->date_to = now()->endOfMonth()->endOfDay()->toDateTimeString();

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
            'vehiculo_id',
            'tipo_mantenimiento_id',
            'solicitante_id',
        ], true)) {
            $this->refreshKpis();
        }
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('export_pdf')
                ->label('Exportar PDF')
                ->icon('heroicon-o-printer')
                ->url(fn () => route('reportes.orden-trabajo.pdf', $this->getFilterState()))
                ->openUrlInNewTab(),
        ];
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Grid::make(12)->schema([
                Forms\Components\Section::make('Filtros del reporte')
                    ->description('Genera órdenes de trabajo de mantenimiento.')
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

                            Forms\Components\Select::make('vehiculo_id')
                                ->label('Vehículo')
                                ->options(fn () => Vehiculo::orderBy('placa')->pluck('placa', 'id'))
                                ->searchable()
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 2]),

                            Forms\Components\Select::make('tipo_mantenimiento_id')
                                ->label('Tipo mantenimiento')
                                ->options(fn () => VehTipoMantenimiento::orderBy('nombre')->pluck('nombre', 'id'))
                                ->searchable()
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 2]),

                            Forms\Components\Select::make('solicitante_id')
                                ->label('Solicitante')
                                ->options(fn () => User::orderBy('name')->pluck('name', 'id'))
                                ->searchable()
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 2]),

                            Forms\Components\Actions::make([
                                Forms\Components\Actions\Action::make('mes_actual')
                                    ->label('Mes actual')
                                    ->action(function () {
                                        $this->date_from = now()->startOfMonth()->startOfDay()->toDateTimeString();
                                        $this->date_to = now()->endOfMonth()->endOfDay()->toDateTimeString();
                                        $this->form->fill($this->getFilterState());
                                        $this->refreshKpis();
                                    }),

                                Forms\Components\Actions\Action::make('limpiar')
                                    ->label('Limpiar')
                                    ->color('gray')
                                    ->action(function () {
                                        $this->date_from = null;
                                        $this->date_to = null;
                                        $this->vehiculo_id = null;
                                        $this->tipo_mantenimiento_id = null;
                                        $this->solicitante_id = null;

                                        $this->form->fill($this->getFilterState());
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

    public function table(Table $table): Table
    {
        return $table
            ->query(fn () => $this->buildQuery())
            ->defaultSort('fecha_sugerida', 'asc')
            ->columns([
                Tables\Columns\TextColumn::make('codigo')
                    ->label('Código')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->fontFamily('mono'),

                Tables\Columns\TextColumn::make('fecha_sugerida')
                    ->label('Fecha sugerida')
                    ->date('d/m/Y')
                    ->sortable(),

                Tables\Columns\TextColumn::make('vehiculo.placa')
                    ->label('Placa')
                    ->sortable(),

                Tables\Columns\TextColumn::make('tipoMantenimiento.nombre')
                    ->label('Tipo mantenimiento')
                    ->sortable(),

                Tables\Columns\TextColumn::make('tipo_solicitud')
                    ->label('Tipo solicitud')
                    ->formatStateUsing(fn ($state) => match ((string) $state) {
                        'taller' => 'Taller',
                        'llantas' => 'Llantas',
                        default => ucfirst((string) $state),
                    }),

                Tables\Columns\TextColumn::make('solicitante.name')
                    ->label('Solicitante')
                    ->sortable(),

                Tables\Columns\TextColumn::make('estado')
                    ->badge(),

                Tables\Columns\TextColumn::make('detalle')
                    ->label('Detalle')
                    ->limit(50)
                    ->wrap(),
            ])
            ->paginated([10, 25, 50]);
    }

    private function buildQuery(): Builder
    {
        return app(ReporteOrdenTrabajoService::class)
            ->buildQuery($this->getFilterState());
    }

    private function refreshKpis(): void
    {
        $kpis = app(ReporteOrdenTrabajoService::class)
            ->getKpis($this->getFilterState());

        $this->kpi_total = $kpis['total'];
        $this->kpi_aprobadas = $kpis['aprobadas'];
        $this->kpi_en_ejecucion = $kpis['en_ejecucion'];
        $this->kpi_completadas = $kpis['completadas'];
    }

    private function getFilterState(): array
    {
        return [
            'date_from' => $this->date_from,
            'date_to' => $this->date_to,
            'vehiculo_id' => $this->vehiculo_id,
            'tipo_mantenimiento_id' => $this->tipo_mantenimiento_id,
            'solicitante_id' => $this->solicitante_id,
        ];
    }
}
