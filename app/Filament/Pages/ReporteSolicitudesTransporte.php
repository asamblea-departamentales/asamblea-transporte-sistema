<?php

namespace App\Filament\Pages;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use App\Domain\Solicitudes\Services\AuditoriaService;
use App\Exports\SolicitudesTransporteExport;
use App\Models\SolicitudTransporte;
use App\Models\UnidadSolicitante;
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

class ReporteSolicitudesTransporte extends Page implements Forms\Contracts\HasForms, Tables\Contracts\HasTable
{
    use InteractsWithForms;
    use InteractsWithTable;

    protected static ?string $navigationGroup = 'Reportes';

    protected static ?string $navigationLabel = 'Reporte Solicitudes Transporte';

    protected static ?string $navigationIcon = 'heroicon-o-document-chart-bar';

    protected static ?int $navigationSort = 3;

    protected static string $view = 'filament.pages.reporte-solicitudes-transporte';

    // Propiedades de Filtros (Sincronizadas con Livewire)
    public ?string $date_field = 'fecha_salida';

    public ?string $date_from = null;

    public ?string $date_to = null;

    public ?int $unidad_solicitante_id = null;

    public ?string $estado = null;

    public ?string $prioridad = null;

    public ?string $ticket = null;

    // Propiedades de KPIs
    public int $kpi_total = 0;

    public int $kpi_pendientes = 0;

    public int $kpi_aprobadas = 0;

    public int $kpi_rechazadas = 0;

    public function mount(): void
    {
        // Valores por defecto: Hoy
        $this->date_from = now()->startOfDay()->toDateTimeString();
        $this->date_to = now()->endOfDay()->toDateTimeString();

        $this->form->fill($this->getFilterState());
        $this->refreshKpis();
    }

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['jefe', 'admin', 'ti', 'operativo', 'liquidador', 'super_admin']) ?? false;
    }

    /**
     * Se ejecuta automáticamente cuando cualquier propiedad de Livewire cambia
     */
    public function updated($propertyName)
    {
        if (in_array($propertyName, ['date_field', 'date_from', 'date_to', 'unidad_solicitante_id', 'estado', 'prioridad', 'ticket'])) {
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
                    $query = $this->buildQuery();
                    $filename = 'reporte_solicitudes_'.now()->format('Ymd_His').'.xlsx';

                    app(AuditoriaService::class)->registrar(
                        AccionBitacoraEnum::EXPORTAR_EXCEL,
                        'solicitudes_transporte',
                        ['cantidad_registros' => $query->count()]
                    );

                    return Excel::download(new SolicitudesTransporteExport($query), $filename);
                }),

            // CSV
            Action::make('export_csv')
                ->label('Exportar CSV')
                ->icon('heroicon-o-document-text')
                ->color('gray')
                ->action(function () {

                    $query = $this->buildQuery();

                    $filename = 'reporte_solicitudes_'.now()->format('Ymd_His').'.csv';

                    app(AuditoriaService::class)->registrar(
                        AccionBitacoraEnum::EXPORTAR_CSV,
                        'solicitudes_transporte',
                        ['cantidad_registros' => $query->count()]
                    );

                    return Excel::download(
                        new SolicitudesTransporteExport($query),
                        $filename,
                        \Maatwebsite\Excel\Excel::CSV
                    );
                }),

            Action::make('export_pdf')
                ->label('Exportar PDF')
                ->icon('heroicon-o-printer')
                ->url(fn () => route('reportes.solicitudes-transporte.pdf', $this->getFilterState()))
                ->openUrlInNewTab(),
        ];
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Grid::make(12)->schema([

                Forms\Components\Section::make('Filtros del reporte')
                    ->description('Ajusta los criterios. La tabla y los indicadores se actualizan con tus filtros.')
                    ->icon('heroicon-o-funnel')
                    ->collapsible()
                    ->columnSpan(12)
                    ->schema([
                        Forms\Components\Grid::make(12)->schema([

                            Forms\Components\Select::make('date_field')
                                ->label('Tipo de fecha')
                                ->options([
                                    'fecha_salida' => 'Fecha salida',
                                    'created_at' => 'Fecha creación',
                                ])
                                ->native(false)
                                ->live()
                                ->columnSpan([
                                    'default' => 12,
                                    'md' => 3,
                                ]),

                            Forms\Components\DateTimePicker::make('date_from')
                                ->label('Desde')
                                ->seconds(false)
                                ->native(false)
                                ->live()
                                ->columnSpan([
                                    'default' => 12,
                                    'md' => 3,
                                ]),

                            Forms\Components\DateTimePicker::make('date_to')
                                ->label('Hasta')
                                ->seconds(false)
                                ->native(false)
                                ->live()
                                ->columnSpan([
                                    'default' => 12,
                                    'md' => 3,
                                ]),

                            Forms\Components\Select::make('unidad_solicitante_id')
                                ->label('Unidad')
                                ->options(fn () => UnidadSolicitante::orderBy('nombre')->pluck('nombre', 'id'))
                                ->searchable()
                                ->native(false)
                                ->live()
                                ->columnSpan([
                                    'default' => 12,
                                    'md' => 3,
                                ]),

                            Forms\Components\Select::make('estado')
                                ->label('Estado')
                                ->options(collect(EstadoSolicitudEnum::cases())
                                    ->mapWithKeys(fn ($c) => [$c->value => str($c->name)->replace('_', ' ')->title()]))
                                ->searchable()
                                ->native(false)
                                ->live()
                                ->columnSpan([
                                    'default' => 12,
                                    'md' => 3,
                                ]),

                            Forms\Components\Select::make('prioridad')
                                ->label('Prioridad')
                                ->options(collect(PrioridadSolicitudEnum::cases())
                                    ->mapWithKeys(fn ($c) => [$c->value => strtoupper($c->value)]))
                                ->native(false)
                                ->live()
                                ->columnSpan([
                                    'default' => 12,
                                    'md' => 3,
                                ]),

                            Forms\Components\TextInput::make('ticket')
                                ->label('Ticket')
                                ->numeric()
                                ->live()
                                ->columnSpan([
                                    'default' => 12,
                                    'md' => 3,
                                ]),

                            // Acciones / presets
                            Forms\Components\Actions::make([
                                Forms\Components\Actions\Action::make('hoy')
                                    ->label('Hoy')
                                    ->icon('heroicon-o-clock')
                                    ->action(function () {
                                        $this->date_from = now()->startOfDay()->toDateTimeString();
                                        $this->date_to = now()->endOfDay()->toDateTimeString();
                                        $this->form->fill($this->getFilterState());
                                        $this->refreshKpis();
                                    }),

                                Forms\Components\Actions\Action::make('esta_semana')
                                    ->label('Esta semana')
                                    ->icon('heroicon-o-calendar-days')
                                    ->action(function () {
                                        $this->date_from = now()->startOfWeek()->startOfDay()->toDateTimeString();
                                        $this->date_to = now()->endOfWeek()->endOfDay()->toDateTimeString();
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
                                        $this->unidad_solicitante_id = null;
                                        $this->estado = null;
                                        $this->prioridad = null;
                                        $this->ticket = null;
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
            ->query(fn () => $this->buildQuery()->with(['unidad', 'solicitante']))
            ->defaultSort('fecha_salida', 'asc')
            ->columns([
                Tables\Columns\TextColumn::make('codigo')
                    ->label('Código')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('ticket')
                    ->label('Ticket')
                    ->sortable()
                    ->searchable()
                    ->fontFamily('mono')
                    ->copyable(),
                Tables\Columns\TextColumn::make('unidad.nombre')
                    ->label('Unidad')
                    ->sortable(),
                Tables\Columns\TextColumn::make('solicitante.name')
                    ->label('Solicitante')
                    ->sortable(),
                Tables\Columns\TextColumn::make('fecha_salida')
                    ->label('Salida')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
                Tables\Columns\TextColumn::make('prioridad')
                    ->badge()
                    ->formatStateUsing(fn ($state) => strtoupper($state->value ?? $state)) // Evita el error de $s
                    ->color(fn ($state) => match ($state->value ?? $state) {
                        'alta' => 'danger',
                        'media' => 'warning',
                        'baja' => 'success',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('estado')
                    ->badge(),
            ])
            ->paginated([10, 25, 50]);
    }

    private function buildQuery(): Builder
    {
        $q = SolicitudTransporte::query();

        // Filtro de Rango de Fechas
        $column = $this->date_field ?? 'fecha_salida';
        if ($this->date_from) {
            $q->where($column, '>=', $this->date_from);
        }
        if ($this->date_to) {
            $q->where($column, '<=', $this->date_to);
        }

        // Filtros Adicionales
        if ($this->unidad_solicitante_id) {
            $q->where('unidad_solicitante_id', $this->unidad_solicitante_id);
        }
        if ($this->estado) {
            $q->where('estado', $this->estado);
        }
        if ($this->prioridad) {
            $q->where('prioridad', $this->prioridad);
        }
        if ($this->ticket) {
            $q->where('ticket', $this->ticket);
        }

        return $q;
    }

    /**
     * MODIFICACIÓN: refreshKpis ahora clona la base de filtros pero ignora el filtro de estado
     * para que los conteos no se pongan en cero al seleccionar un estado específico.
     */
    private function refreshKpis(): void
    {
        // Creamos una base que tenga fechas y unidad, pero NO el estado ni prioridad
        $baseParaKpis = SolicitudTransporte::query();
        $column = $this->date_field ?? 'fecha_salida';

        if ($this->date_from) {
            $baseParaKpis->where($column, '>=', $this->date_from);
        }
        if ($this->date_to) {
            $baseParaKpis->where($column, '<=', $this->date_to);
        }
        if ($this->unidad_solicitante_id) {
            $baseParaKpis->where('unidad_solicitante_id', $this->unidad_solicitante_id);
        }

        $this->kpi_total = (clone $baseParaKpis)->count();

        $this->kpi_pendientes = (clone $baseParaKpis)
            ->whereIn('estado', [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION, EstadoSolicitudEnum::PRE_APROBADA])
            ->count();

        $this->kpi_aprobadas = (clone $baseParaKpis)
            ->whereIn('estado', [EstadoSolicitudEnum::APROBADA, EstadoSolicitudEnum::PROGRAMADA])
            ->count();

        $this->kpi_rechazadas = (clone $baseParaKpis)
            ->where('estado', EstadoSolicitudEnum::RECHAZADA)
            ->count();
    }

    private function getFilterState(): array
    {
        return [
            'date_field' => $this->date_field,
            'date_from' => $this->date_from,
            'date_to' => $this->date_to,
            'unidad_solicitante_id' => $this->unidad_solicitante_id,
            'estado' => $this->estado,
            'prioridad' => $this->prioridad,
            'ticket' => $this->ticket,
        ];
    }

    private function rangeLabel(): string
    {
        $from = $this->date_from ? \Carbon\Carbon::parse($this->date_from)->format('d/m/Y') : 'Inicio';
        $to = $this->date_to ? \Carbon\Carbon::parse($this->date_to)->format('d/m/Y') : 'Fin';

        return "Periodo: {$from} al {$to}";
    }
}
