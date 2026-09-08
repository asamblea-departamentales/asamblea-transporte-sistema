<?php

namespace App\Filament\Pages;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Services\Reportes\ReporteControlMensualCombustibleService;
use App\Models\ContratoCombustible;
use App\Models\Motorista;
use App\Models\SerieCarga;
use App\Models\SolicitudCombustible;
use App\Models\Vehiculo;
use Carbon\Carbon;
use Filament\Actions\Action;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Form;
use Filament\Pages\Page;
use Filament\Tables;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ReporteControlMensualCombustible extends Page implements Forms\Contracts\HasForms, Tables\Contracts\HasTable
{
    use InteractsWithForms;
    use InteractsWithTable;

    protected static ?string $navigationGroup = 'Reportes';

    protected static ?string $title = 'Reporte Control Mensual de Combustible';

    protected static ?string $navigationLabel = 'Control Mensual de Combustible';

    protected static ?string $navigationIcon = 'heroicon-o-document-chart-bar';

    protected static ?int $navigationSort = 5;

    protected static string $view = 'filament.pages.reporte-control-mensual-combustible';

    public ?string $date_field = 'fecha_solicitud';

    public ?string $date_from = null;

    public ?string $date_to = null;

    public ?int $vehiculo_id = null;

    public ?int $motorista_id = null;

    public ?int $contrato_id = null;

    public ?int $serie_vale_id = null;

    public ?string $estado = null;

    public int $kpi_total = 0;

    public float $kpi_galones = 0;

    public float $kpi_valor_total = 0;

    public float $kpi_monto_asignado = 0;

    public int $kpi_asignadas = 0;

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
            'date_field',
            'date_from',
            'date_to',
            'vehiculo_id',
            'motorista_id',
            'contrato_id',
            'serie_vale_id',
            'estado',
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
                ->url(fn () => route('reportes.control-mensual-combustible.pdf', $this->getFilterState()))
                ->openUrlInNewTab(),
        ];
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Grid::make(12)->schema([
                Forms\Components\Section::make('Filtros del reporte')
                    ->description('Filtra el control mensual de combustible.')
                    ->icon('heroicon-o-funnel')
                    ->collapsible()
                    ->columnSpan(12)
                    ->schema([
                        Forms\Components\Grid::make(12)->schema([

                            Forms\Components\Select::make('date_field')
                                ->label('Tipo de fecha')
                                ->options([
                                    'fecha_solicitud' => 'Fecha solicitud',
                                    'fecha_asignacion' => 'Fecha asignación',
                                    'fecha_aprobacion' => 'Fecha aprobación',
                                    'created_at' => 'Fecha creación',
                                ])
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\DateTimePicker::make('date_from')
                                ->label('Fecha Inicio')
                                ->seconds(false)
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\DateTimePicker::make('date_to')
                                ->label('Fecha Fin')
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
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\Select::make('motorista_id')
                                ->label('Motorista')
                                ->options(fn () => Motorista::orderBy('nombre')->pluck('nombre', 'id'))
                                ->searchable()
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\Select::make('contrato_id')
                                ->label('Contrato')
                                ->options(fn () => ContratoCombustible::orderBy('numero_contrato')->pluck('numero_contrato', 'id'))
                                ->searchable()
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\Select::make('serie_vale_id')
                                ->label('Serie de carga')
                                ->options(fn () => SerieCarga::orderBy('nombre')->pluck('nombre', 'id'))
                                ->searchable()
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\Select::make('estado')
                                ->label('Estado')
                                ->options(collect(EstadoSolicitudEnum::cases())
                                    ->mapWithKeys(fn ($c) => [$c->value => str($c->name)->replace('_', ' ')->title()]))
                                ->searchable()
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

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
                                        $this->motorista_id = null;
                                        $this->contrato_id = null;
                                        $this->serie_vale_id = null;
                                        $this->estado = null;
                                        $this->form->fill($this->getFilterState());
                                        $this->refreshKpis();
                                    }),
                            ])->columnSpan(12)->alignEnd(),
                        ]),
                    ]),
            ]),
        ])->statePath('');
    }

    public function table(Table $table): Table
    {
        return $table
            ->striped()
            ->query(fn () => $this->buildQuery())
            ->defaultSort('fecha_solicitud', 'asc')
            ->columns([
                Tables\Columns\TextColumn::make('fecha_solicitud')
                    ->label('Fecha')
                    ->date('d/m/Y')
                    ->sortable(),

                Tables\Columns\TextColumn::make('codigo')
                    ->label('Código')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->fontFamily('mono'),

                Tables\Columns\TextColumn::make('vehiculo_id')
                    ->label('Vehículo')
                    ->getStateUsing(fn (SolicitudCombustible $record) => app(ReporteControlMensualCombustibleService::class)->resolverVehiculo($record))
                    ->wrap(),

                Tables\Columns\TextColumn::make('motorista.nombre')
                    ->label('Motorista')
                    ->sortable()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('contrato.numero_contrato')
                    ->label('Contrato')
                    ->toggleable(),

                Tables\Columns\TextColumn::make('serieCarga.nombre')
                    ->label('Serie')
                    ->toggleable(),

                Tables\Columns\TextColumn::make('correlativo')
                    ->label('Correlativo')
                    ->getStateUsing(fn (SolicitudCombustible $record) => app(ReporteControlMensualCombustibleService::class)->resolverCorrelativo($record))
                    ->toggleable(),

                Tables\Columns\TextColumn::make('cantidad_vales')
                    ->label('Cargas')
                    ->numeric()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('monto_asignado')
                    ->label('Monto asignado')
                    ->money('USD')
                    ->sortable(),

                Tables\Columns\TextColumn::make('cantidad_combustible')
                    ->label('Monto ($)')
                    ->formatStateUsing(fn ($state) => '$'.number_format((float) $state, 2))
                    ->badge()
                    ->color('info'),

                Tables\Columns\TextColumn::make('valor_total')
                    ->label('Valor total')
                    ->money('USD')
                    ->weight('bold')
                    ->sortable(),

                Tables\Columns\TextColumn::make('estado')
                    ->badge(),
            ])
            ->paginated([10, 25, 50])
            ->emptyStateHeading('No hay resultados')
            ->emptyStateDescription('Prueba ampliando el rango o quitando filtros.');
    }

    private function buildQuery(): Builder
    {
        return app(ReporteControlMensualCombustibleService::class)
            ->buildQuery($this->getFilterState());
    }

    private function refreshKpis(): void
    {
        $kpis = app(ReporteControlMensualCombustibleService::class)
            ->getKpis($this->getFilterState());

        $this->kpi_total = $kpis['total'];
        $this->kpi_galones = $kpis['galones'];
        $this->kpi_valor_total = $kpis['valor_total'];
        $this->kpi_monto_asignado = $kpis['monto_asignado'];
        $this->kpi_asignadas = $kpis['asignadas'];
        $this->kpi_completadas = $kpis['completadas'];
    }

    private function getFilterState(): array
    {
        return [
            'date_field' => $this->date_field,
            'date_from' => $this->date_from,
            'date_to' => $this->date_to,
            'vehiculo_id' => $this->vehiculo_id,
            'motorista_id' => $this->motorista_id,
            'contrato_id' => $this->contrato_id,
            'serie_vale_id' => $this->serie_vale_id,
            'estado' => $this->estado,
        ];
    }

    public function rangeLabel(): string
    {
        $from = $this->date_from ? Carbon::parse($this->date_from)->format('d/m/Y') : 'Inicio';
        $to = $this->date_to ? Carbon::parse($this->date_to)->format('d/m/Y') : 'Fin';

        return "Periodo: {$from} al {$to}";
    }
}
