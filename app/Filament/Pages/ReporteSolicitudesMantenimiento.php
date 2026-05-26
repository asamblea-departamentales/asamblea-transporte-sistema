<?php

namespace App\Filament\Pages;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use App\Domain\Solicitudes\Services\AuditoriaService;
use App\Exports\SolicitudesMantenimientoExport;
use App\Models\SolicitudMantenimiento;
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
use Maatwebsite\Excel\Facades\Excel;

class ReporteSolicitudesMantenimiento extends Page implements Forms\Contracts\HasForms, Tables\Contracts\HasTable
{
    use InteractsWithForms;
    use InteractsWithTable;

    protected static ?string $navigationGroup = 'Reportes';

    protected static ?string $navigationLabel = 'Reporte Solicitudes Mantenimiento';

    protected static ?string $navigationIcon = 'heroicon-o-wrench-screwdriver';

    protected static ?int $navigationSort = 5;

    protected static string $view = 'filament.pages.reporte-solicitudes-mantenimiento';

    // Filtros
    public ?string $date_field = 'fecha_sugerida';

    public ?string $date_from = null;

    public ?string $date_to = null;

    public ?int $veh_tipo_mantenimiento_id = null;

    public ?string $estado = null;

    public ?string $prioridad = null;

    public ?string $tipo_solicitud = null;

    public ?string $ticket = null;

    // KPIs
    public int $kpi_total = 0;

    public int $kpi_pendientes = 0;

    public int $kpi_aprobadas = 0;

    public int $kpi_rechazadas = 0;

    public string $kpi_costo_estimado = '0.00';

    public string $kpi_costo_real = '0.00';

    public function mount(): void
    {
        $this->date_from = now()->startOfMonth()->toDateString();
        $this->date_to = now()->endOfMonth()->toDateString();
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
            'date_field', 'date_from', 'date_to',
            'veh_tipo_mantenimiento_id', 'estado', 'prioridad', 'tipo_solicitud', 'ticket',
        ])) {
            $this->refreshKpis();
        }
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('export_excel')
                ->label('Exportar Excel')
                ->icon('heroicon-o-arrow-down-tray')
                ->action(function () {
                    $filename = 'reporte_mantenimiento_'.now()->format('Ymd_His').'.xlsx';

                    $query = $this->buildQuery();

                    app(AuditoriaService::class)->registrar(
                        AccionBitacoraEnum::EXPORTAR_EXCEL,
                        'solicitudes_mantenimiento',
                        ['cantidad_registros' => $query->count()]
                    );

                    return Excel::download(new SolicitudesMantenimientoExport($query), $filename);
                }),

            // CSV
            Action::make('export_csv')
                ->label('Exportar CSV')
                ->icon('heroicon-o-document-text')
                ->action(function () {
                    $filename = 'reporte_mantenimiento_'.now()->format('Ymd_His').'.csv';

                    $query = $this->buildQuery();

                    app(AuditoriaService::class)->registrar(
                        AccionBitacoraEnum::EXPORTAR_CSV,
                        'solicitudes_mantenimiento',
                        ['cantidad_registros' => $query->count()]
                    );

                    return Excel::download(new SolicitudesMantenimientoExport($query), $filename, \Maatwebsite\Excel\Excel::CSV);

                }),

            Action::make('export_pdf')
                ->label('Exportar PDF')
                ->icon('heroicon-o-printer')
                ->url(fn () => route('reportes.solicitudes-mantenimiento.pdf', $this->getFilterState()))
                ->openUrlInNewTab(),
        ];
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Grid::make(12)->schema([
                Forms\Components\Section::make('Filtros del reporte')
                    ->description('Ajusta los criterios. La tabla y los indicadores se actualizan automáticamente.')
                    ->icon('heroicon-o-funnel')
                    ->collapsible()
                    ->columnSpan(12)
                    ->schema([
                        Forms\Components\Grid::make(12)->schema([

                            Forms\Components\Select::make('date_field')
                                ->label('Tipo de fecha')
                                ->options([
                                    'fecha_sugerida' => 'Fecha sugerida',
                                    'fecha_realizada' => 'Fecha realizada',
                                    'created_at' => 'Fecha creación',
                                ])
                                ->native(false)->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\DatePicker::make('date_from')
                                ->label('Desde')->native(false)->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\DatePicker::make('date_to')
                                ->label('Hasta')->native(false)->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\Select::make('veh_tipo_mantenimiento_id')
                                ->label('Tipo de mantenimiento')
                                ->options(fn () => VehTipoMantenimiento::orderBy('nombre')->pluck('nombre', 'id'))
                                ->searchable()->native(false)->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\Select::make('tipo_solicitud')
                                ->label('Tipo de solicitud')
                                ->options([
                                    'preventivo' => 'Preventivo',
                                    'correctivo' => 'Correctivo',
                                ])
                                ->native(false)->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\Select::make('estado')
                                ->label('Estado')
                                ->options(collect(EstadoSolicitudEnum::cases())
                                    ->mapWithKeys(fn ($c) => [$c->value => str($c->name)->replace('_', ' ')->title()]))
                                ->searchable()->native(false)->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\Select::make('prioridad')
                                ->label('Prioridad')
                                ->options(collect(PrioridadSolicitudEnum::cases())
                                    ->mapWithKeys(fn ($c) => [$c->value => strtoupper($c->value)]))
                                ->native(false)->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\TextInput::make('ticket')
                                ->label('Ticket')
                                ->numeric()
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\Actions::make([
                                Forms\Components\Actions\Action::make('este_mes')
                                    ->label('Este mes')
                                    ->icon('heroicon-o-calendar')
                                    ->action(function () {
                                        $this->date_from = now()->startOfMonth()->toDateString();
                                        $this->date_to = now()->endOfMonth()->toDateString();
                                        $this->form->fill($this->getFilterState());
                                        $this->refreshKpis();
                                    }),

                                Forms\Components\Actions\Action::make('esta_semana')
                                    ->label('Esta semana')
                                    ->icon('heroicon-o-calendar-days')
                                    ->action(function () {
                                        $this->date_from = now()->startOfWeek()->toDateString();
                                        $this->date_to = now()->endOfWeek()->toDateString();
                                        $this->form->fill($this->getFilterState());
                                        $this->refreshKpis();
                                    }),

                                Forms\Components\Actions\Action::make('limpiar')
                                    ->label('Limpiar')
                                    ->color('gray')
                                    ->icon('heroicon-o-x-mark')
                                    ->action(function () {
                                        $this->date_from = null;
                                        $this->date_to = null;
                                        $this->veh_tipo_mantenimiento_id = null;
                                        $this->estado = null;
                                        $this->prioridad = null;
                                        $this->tipo_solicitud = null;
                                        $this->ticket = null;
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
            ->query(fn () => $this->buildQuery()->with(['vehiculo', 'tipoMantenimiento', 'solicitante', 'aprobador']))
            ->defaultSort('fecha_sugerida', 'asc')
            ->columns([
                Tables\Columns\TextColumn::make('codigo')
                    ->label('Código')->sortable()->searchable()->fontFamily('mono'),

                Tables\Columns\TextColumn::make('ticket')
                    ->label('Ticket')
                    ->sortable()
                    ->searchable()
                    ->fontFamily('mono')
                    ->copyable(),

                Tables\Columns\TextColumn::make('vehiculo.placa')
                    ->label('Vehículo')
                    ->description(fn ($record) => trim("{$record->vehiculo?->vehMarca?->nombre} {$record->vehiculo?->vehModelo?->nombre}"))
                    ->sortable(),

                Tables\Columns\TextColumn::make('tipoMantenimiento.nombre')
                    ->label('Tipo')->badge()->color('info'),

                Tables\Columns\TextColumn::make('tipo_solicitud')
                    ->label('Solicitud')
                    ->badge()
                    ->color(fn ($state) => $state === 'correctivo' ? 'danger' : 'success')
                    ->formatStateUsing(fn ($state) => ucfirst($state)),

                Tables\Columns\TextColumn::make('fecha_sugerida')
                    ->label('Fecha sugerida')->date('d/m/Y')->sortable(),

                Tables\Columns\TextColumn::make('costo_estimado')
                    ->label('Costo est.')->money('USD')->sortable(),

                Tables\Columns\TextColumn::make('costo_real')
                    ->label('Costo real')->money('USD')->sortable()->placeholder('—'),

                Tables\Columns\TextColumn::make('prioridad')
                    ->badge()
                    ->formatStateUsing(fn ($state) => strtoupper($state->value ?? $state))
                    ->color(fn ($state) => match ($state->value ?? $state) {
                        'alta' => 'danger',
                        'media' => 'warning',
                        'baja' => 'success',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('estado')
                    ->badge()
                    ->formatStateUsing(fn ($state) => ucfirst(str_replace('_', ' ', $state->value ?? $state)))
                    ->color(fn ($state) => match ($state->value ?? $state) {
                        'aprobada' => 'success',
                        'rechazada' => 'danger',
                        'pendiente' => 'warning',
                        'en_revision' => 'info',
                        'completada' => 'success',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('solicitante.name')
                    ->label('Solicitante')->toggleable(isToggledHiddenByDefault: true),
            ])
            ->paginated([10, 25, 50]);
    }

    private function buildQuery(): Builder
    {
        $q = SolicitudMantenimiento::query();
        $column = $this->date_field ?? 'fecha_sugerida';

        if ($this->date_from) {
            $q->where($column, '>=', $this->date_from);
        }
        if ($this->date_to) {
            $q->where($column, '<=', $this->date_to);
        }
        if ($this->veh_tipo_mantenimiento_id) {
            $q->where('veh_tipo_mantenimiento_id', $this->veh_tipo_mantenimiento_id);
        }
        if ($this->estado) {
            $q->where('estado', $this->estado);
        }
        if ($this->prioridad) {
            $q->where('prioridad', $this->prioridad);
        }
        if ($this->tipo_solicitud) {
            $q->where('tipo_solicitud', $this->tipo_solicitud);
        }
        if ($this->ticket) {
            $q->where('ticket', $this->ticket);
        }

        return $q;
    }

    private function refreshKpis(): void
    {
        $base = SolicitudMantenimiento::query();
        $column = $this->date_field ?? 'fecha_sugerida';

        if ($this->date_from) {
            $base->where($column, '>=', $this->date_from);
        }
        if ($this->date_to) {
            $base->where($column, '<=', $this->date_to);
        }
        if ($this->veh_tipo_mantenimiento_id) {
            $base->where('veh_tipo_mantenimiento_id', $this->veh_tipo_mantenimiento_id);
        }

        $this->kpi_total = (clone $base)->count();
        $this->kpi_pendientes = (clone $base)->whereIn('estado', [
            EstadoSolicitudEnum::PENDIENTE,
            EstadoSolicitudEnum::EN_REVISION,
            EstadoSolicitudEnum::PRE_APROBADA,
        ])->count();
        $this->kpi_aprobadas = (clone $base)->whereIn('estado', [
            EstadoSolicitudEnum::APROBADA,
            EstadoSolicitudEnum::EN_EJECUCION,
            EstadoSolicitudEnum::COMPLETADA,
        ])->count();
        $this->kpi_rechazadas = (clone $base)->where('estado', EstadoSolicitudEnum::RECHAZADA)->count();
        $this->kpi_costo_estimado = number_format((clone $base)->sum('costo_estimado'), 2);
        $this->kpi_costo_real = number_format((clone $base)->sum('costo_real'), 2);
    }

    private function getFilterState(): array
    {
        return [
            'date_field' => $this->date_field,
            'date_from' => $this->date_from,
            'date_to' => $this->date_to,
            'veh_tipo_mantenimiento_id' => $this->veh_tipo_mantenimiento_id,
            'estado' => $this->estado,
            'prioridad' => $this->prioridad,
            'tipo_solicitud' => $this->tipo_solicitud,
            'ticket' => $this->ticket,
        ];
    }
}
