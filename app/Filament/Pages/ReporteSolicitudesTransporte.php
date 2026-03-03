<?php

namespace App\Filament\Pages;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use App\Exports\SolicitudesTransporteExport;
use App\Models\SolicitudTransporte;
use App\Models\UnidadSolicitante;
use Barryvdh\DomPDF\Facade\Pdf;
use Filament\Actions\Action;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Pages\Page;
use Filament\Support\Enums\MaxWidth;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Forms\Concerns\InteractsWithForms;
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

    // Propiedades de KPIs
    public int $kpi_total = 0;
    public int $kpi_pendientes = 0;
    public int $kpi_aprobadas = 0;
    public int $kpi_rechazadas = 0;

    public function mount(): void
    {
        // Valores por defecto: Hoy
        $this->date_from = now()->startOfDay()->toDateTimeString();
        $this->date_to   = now()->endOfDay()->toDateTimeString();

        $this->form->fill($this->getFilterState());
        $this->refreshKpis();
    }

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['jefe', 'admin', 'ti']) ?? false;
    }

    /**
     * Se ejecuta automáticamente cuando cualquier propiedad de Livewire cambia
     */
    public function updated($propertyName)
    {
        if (in_array($propertyName, ['date_field', 'date_from', 'date_to', 'unidad_solicitante_id', 'estado', 'prioridad'])) {
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
                    $filename = 'reporte_solicitudes_' . now()->format('Ymd_His') . '.xlsx';
                    return Excel::download(new SolicitudesTransporteExport($query), $filename);
                }),

            Action::make('export_pdf')
    ->label('Exportar PDF')
    ->icon('heroicon-o-printer')
    ->action(function () {
        // 1. Obtenemos los datos y limpiamos caracteres extraños de una vez
        $rows = $this->buildQuery()
            ->with(['unidad', 'solicitante'])
            ->orderBy('fecha_salida')
            ->get()
            ->map(function ($row) {
                // Limpiamos campos propensos a errores de encoding (tildes de Word, etc)
                $row->origen = mb_convert_encoding($row->origen, 'UTF-8', 'UTF-8');
                $row->destino = mb_convert_encoding($row->destino, 'UTF-8', 'UTF-8');
                if($row->motivo_actividad) {
                    $row->motivo_actividad = mb_convert_encoding($row->motivo_actividad, 'UTF-8', 'UTF-8');
                }
                return $row;
            });

        // 2. Generamos el PDF con configuración segura
        $pdf = Pdf::loadView('reports.solicitudes_transporte_pdf', [
            'rows' => $rows,
            'rangeLabel' => $this->rangeLabel(),
        ])
        ->setPaper('a4', 'landscape')
        ->setWarnings(false); // Evita que warnings de fuentes rompan el stream

        $filename = 'reporte_solicitudes_' . now()->format('Ymd_His') . '.pdf';

        // 3. Retornamos como Stream para que Filament lo maneje correctamente
        return response()->streamDownload(function () use ($pdf) {
            echo $pdf->output();
        }, $filename, [
            'Content-Type' => 'application/pdf',
        ]);
    }),
        ];
    }
    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Filtros de Reporte')
                ->columns(4)
                ->schema([
                    Forms\Components\Select::make('date_field')
                        ->label('Tipo de fecha')
                        ->options([
                            'fecha_salida' => 'Fecha salida',
                            'created_at'   => 'Fecha creación',
                        ])
                        ->live(),

                    Forms\Components\DateTimePicker::make('date_from')
                        ->label('Desde')
                        ->seconds(false)
                        ->live(),

                    Forms\Components\DateTimePicker::make('date_to')
                        ->label('Hasta')
                        ->seconds(false)
                        ->live(),

                    Forms\Components\Select::make('unidad_solicitante_id')
                        ->label('Unidad')
                        ->options(fn () => UnidadSolicitante::orderBy('nombre')->pluck('nombre', 'id'))
                        ->searchable()
                        ->live(),

                    Forms\Components\Select::make('estado')
                        ->label('Estado')
                        ->options(collect(EstadoSolicitudEnum::cases())->mapWithKeys(fn ($case) => [$case->value => $case->name]))
                        ->searchable()
                        ->live(),

                    Forms\Components\Select::make('prioridad')
                        ->label('Prioridad')
                        ->options(collect(PrioridadSolicitudEnum::cases())->mapWithKeys(fn ($case) => [$case->value => $case->value]))
                        ->live(),

                    Forms\Components\Actions::make([
                        Forms\Components\Actions\Action::make('limpiar')
                            ->label('Limpiar Filtros')
                            ->color('gray')
                            ->action(function () {
                                $this->date_from = null;
                                $this->date_to = null;
                                $this->unidad_solicitante_id = null;
                                $this->estado = null;
                                $this->prioridad = null;
                                $this->form->fill($this->getFilterState());
                                $this->refreshKpis();
                            }),
                    ])->columnSpanFull(),
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
        
        if ($this->date_from) $baseParaKpis->where($column, '>=', $this->date_from);
        if ($this->date_to)   $baseParaKpis->where($column, '<=', $this->date_to);
        if ($this->unidad_solicitante_id) $baseParaKpis->where('unidad_solicitante_id', $this->unidad_solicitante_id);

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
        ];
    }

    private function rangeLabel(): string
    {
        $from = $this->date_from ? \Carbon\Carbon::parse($this->date_from)->format('d/m/Y') : 'Inicio';
        $to   = $this->date_to ? \Carbon\Carbon::parse($this->date_to)->format('d/m/Y') : 'Fin';
        return "Periodo: {$from} al {$to}";
    }
}