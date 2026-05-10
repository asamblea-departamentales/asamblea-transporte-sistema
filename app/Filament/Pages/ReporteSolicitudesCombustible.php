<?php

namespace App\Filament\Pages;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\SolicitudCombustible;
use App\Models\Vehiculo;
use Filament\Actions\Action;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Form;
use Filament\Pages\Page;
use Filament\Tables;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ReporteSolicitudesCombustible extends Page implements Forms\Contracts\HasForms, Tables\Contracts\HasTable
{
    use InteractsWithForms;
    use InteractsWithTable;

    protected static ?string $navigationGroup = 'Reportes';

    protected static ?string $navigationLabel = 'Reporte Solicitudes Combustible';

    protected static ?string $navigationIcon = 'heroicon-o-document-chart-bar';

    protected static ?int $navigationSort = 4;

    protected static string $view = 'filament.pages.reporte-solicitudes-combustible';

    public ?string $date_field = 'fecha_solicitud';

    public ?string $date_from = null;

    public ?string $date_to = null;

    public ?int $vehiculo_id = null;

    public ?string $estado = null;

    public float $kpi_galones = 0;

    public float $kpi_valor_total = 0;

    public int $kpi_total = 0;

    public int $kpi_pendientes = 0;

    public int $kpi_aprobadas = 0;

    public int $kpi_rechazadas = 0;

    public function mount(): void
    {
        $this->date_from = now()->startOfDay()->toDateTimeString();
        $this->date_to = now()->endOfDay()->toDateTimeString();

        $this->form->fill($this->getFilterState());
        $this->refreshKpis();
    }

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['jefe', 'admin', 'ti', 'operativo', 'liquidador']) ?? false;
    }

    public function updated($propertyName): void
    {
        if (in_array($propertyName, ['date_field', 'date_from', 'date_to', 'vehiculo_id', 'estado'])) {
            $this->refreshKpis();
        }
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('export_excel')
                ->label('Exportar Excel')
                ->icon('heroicon-o-arrow-down-tray')
                ->url(fn () => route('reportes.solicitudes-combustible.excel', $this->getFilterState()))
                ->openUrlInNewTab(),

            //CSV
                Action::make('export_csv')
                    ->label('Exportar CSV')
                    ->icon('heroicon-o-document-text')
                    ->url(fn () => route('reportes.solicitudes-combustible.csv', $this->getFilterState()))
                    ->openUrlInNewTab(),    

            Action::make('export_pdf')
                ->label('Exportar PDF')
                ->icon('heroicon-o-printer')
                ->url(fn () => route('reportes.solicitudes-combustible.pdf', $this->getFilterState()))
                ->openUrlInNewTab(),
        ];
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Grid::make(12)->schema([
                Forms\Components\Section::make('Filtros del reporte')
                    ->description('Filtra el reporte de solicitudes de combustible.')
                    ->icon('heroicon-o-funnel')
                    ->collapsible()
                    ->columnSpan(12)
                    ->schema([
                        Forms\Components\Grid::make(12)->schema([
                            Forms\Components\Select::make('date_field')
                                ->label('Tipo de fecha')
                                ->options([
                                    'fecha_solicitud' => 'Fecha solicitud',
                                    'created_at' => 'Fecha creación',
                                ])
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

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
                                Forms\Components\Actions\Action::make('hoy')
                                    ->label('Hoy')
                                    ->action(function () {
                                        $this->date_from = now()->startOfDay()->toDateTimeString();
                                        $this->date_to = now()->endOfDay()->toDateTimeString();
                                        $this->form->fill($this->getFilterState());
                                        $this->refreshKpis();
                                    }),

                                Forms\Components\Actions\Action::make('esta_semana')
                                    ->label('Esta semana')
                                    ->action(function () {
                                        $this->date_from = now()->startOfWeek()->startOfDay()->toDateTimeString();
                                        $this->date_to = now()->endOfWeek()->endOfDay()->toDateTimeString();
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
            ->query(fn () => $this->buildQuery()->with(['vehiculo.vehMarca', 'vehiculo.vehModelo', 'solicitante']))
            ->defaultSort('fecha_solicitud', 'asc')
            ->columns([
                Tables\Columns\TextColumn::make('codigo')
                    ->label('Solicitud')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->fontFamily('mono')
                    ->description(fn ($record) => 'Vehículo: '.($record->vehiculo?->placa ?? 'N/A'))
                    ->wrap(),

                Tables\Columns\TextColumn::make('solicitante.name')
                    ->label('Solicitante')
                    ->sortable()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('fecha_solicitud')
                    ->label('Fecha')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),

                Tables\Columns\TextColumn::make('cantidad_combustible')
                    ->label('Galones')
                    ->formatStateUsing(fn ($state) => number_format((float) $state, 2).' gal')
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
            ->emptyStateDescription('Prueba ampliando el rango de fechas o quitando filtros.');
    }

    private function buildQuery(): Builder
    {
        $q = SolicitudCombustible::query();

        $column = $this->date_field ?? 'fecha_solicitud';

        if ($this->date_from) {
            $q->where($column, '>=', $this->date_from);
        }
        if ($this->date_to) {
            $q->where($column, '<=', $this->date_to);
        }
        if ($this->vehiculo_id) {
            $q->where('vehiculo_id', $this->vehiculo_id);
        }
        if ($this->estado) {
            $q->where('estado', $this->estado);
        }

        return $q;
    }

    private function refreshKpis(): void
    {
        $base = SolicitudCombustible::query();
        $column = $this->date_field ?? 'fecha_solicitud';

        if ($this->date_from) {
            $base->where($column, '>=', $this->date_from);
        }
        if ($this->date_to) {
            $base->where($column, '<=', $this->date_to);
        }
        if ($this->vehiculo_id) {
            $base->where('vehiculo_id', $this->vehiculo_id);
        }

        $this->kpi_total = (clone $base)->count();

        $this->kpi_pendientes = (clone $base)->whereIn('estado', [
            EstadoSolicitudEnum::PENDIENTE,
            EstadoSolicitudEnum::EN_REVISION,
            EstadoSolicitudEnum::PRE_APROBADA,
        ])->count();

        $this->kpi_aprobadas = (clone $base)->where('estado', EstadoSolicitudEnum::APROBADA)->count();

        $this->kpi_rechazadas = (clone $base)->where('estado', EstadoSolicitudEnum::RECHAZADA)->count();

        $this->kpi_galones = (float) ((clone $base)->sum('cantidad_combustible') ?? 0);

        $this->kpi_valor_total = (float) ((clone $base)->sum('valor_total') ?? 0);
    }

    private function getFilterState(): array
    {
        return [
            'date_field' => $this->date_field,
            'date_from' => $this->date_from,
            'date_to' => $this->date_to,
            'vehiculo_id' => $this->vehiculo_id,
            'estado' => $this->estado,
        ];
    }
}
