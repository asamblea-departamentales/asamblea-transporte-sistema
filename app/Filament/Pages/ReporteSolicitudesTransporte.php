<?php

namespace App\Filament\Pages;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
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

    // Filtros
    public ?string $date_field = 'fecha_salida'; // fecha_salida | created_at
    public ?string $date_from = null;
    public ?string $date_to = null;

    public ?int $unidad_solicitante_id = null;
    public ?string $estado = null;
    public ?string $prioridad = null;

    // KPIs
    public int $kpi_total = 0;
    public int $kpi_pendientes = 0;
    public int $kpi_aprobadas = 0;
    public int $kpi_rechazadas = 0;

    public function mount(): void
    {
        // Default: hoy (por salida)
        $this->date_from = now()->startOfDay()->toDateTimeString();
        $this->date_to   = now()->endOfDay()->toDateTimeString();

        $this->form->fill($this->getFilterState());
        $this->refreshKpis();
    }

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['jefe', 'admin', 'ti']) ?? false;
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('export_excel')
                ->label('Exportar Excel')
                ->icon('heroicon-o-arrow-down-tray')
                ->action(function () {
                    $query = $this->buildQuery();
                    $filename = 'reporte_solicitudes_transporte_' . now()->format('Ymd_His') . '.xlsx';

                    return Excel::download(new SolicitudesTransporteExport($query), $filename);
                }),

            Action::make('export_pdf')
                ->label('Exportar PDF')
                ->icon('heroicon-o-printer')
                ->action(function () {
                    $rows = $this->buildQuery()
                        ->with(['unidad', 'solicitante'])
                        ->orderBy('fecha_salida')
                        ->get();

                    $rangeLabel = $this->rangeLabel();

                    $pdf = Pdf::loadView('reports.solicitudes_transporte_pdf', [
                        'rows' => $rows,
                        'rangeLabel' => $rangeLabel,
                    ])->setPaper('a4', 'landscape');

                    $filename = 'reporte_solicitudes_transporte_' . now()->format('Ymd_His') . '.pdf';
                    return response()->streamDownload(fn () => print($pdf->output()), $filename);
                }),
        ];
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Filtros')
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
                        ->options(fn () => UnidadSolicitante::query()->orderBy('nombre')->pluck('nombre', 'id')->all())
                        ->searchable()
                        ->preload()
                        ->live(),

                    Forms\Components\Select::make('estado')
                        ->label('Estado')
                        ->options([
                            EstadoSolicitudEnum::BORRADOR->value => 'Borrador',
                            EstadoSolicitudEnum::PENDIENTE->value => 'Pendiente',
                            EstadoSolicitudEnum::EN_REVISION->value => 'En revisión',
                            EstadoSolicitudEnum::APROBADA->value => 'Aprobada',
                            EstadoSolicitudEnum::RECHAZADA->value => 'Rechazada',
                            EstadoSolicitudEnum::PROGRAMADA->value => 'Programada',
                            EstadoSolicitudEnum::EN_EJECUCION->value => 'En ejecución',
                            EstadoSolicitudEnum::COMPLETADA->value => 'Completada',
                            EstadoSolicitudEnum::CANCELADA->value => 'Cancelada',
                        ])
                        ->searchable()
                        ->live(),

                    Forms\Components\Select::make('prioridad')
                        ->label('Prioridad')
                        ->options([
                            'baja' => 'Baja',
                            'media' => 'Media',
                            'alta' => 'Alta',
                        ])
                        ->live(),

                    Forms\Components\Actions::make([
                        Forms\Components\Actions\Action::make('aplicar')
                            ->label('Aplicar filtros')
                            ->action(function () {
                                $this->refreshKpis();
                                $this->resetTable();
                            })
                            ->color('primary'),

                        Forms\Components\Actions\Action::make('hoy')
                            ->label('Hoy')
                            ->action(function () {
                                $this->date_from = now()->startOfDay()->toDateTimeString();
                                $this->date_to = now()->endOfDay()->toDateTimeString();
                                $this->form->fill($this->getFilterState());
                                $this->refreshKpis();
                                $this->resetTable();
                            }),

                        Forms\Components\Actions\Action::make('mes')
                            ->label('Este mes')
                            ->action(function () {
                                $this->date_from = now()->startOfMonth()->startOfDay()->toDateTimeString();
                                $this->date_to = now()->endOfMonth()->endOfDay()->toDateTimeString();
                                $this->form->fill($this->getFilterState());
                                $this->refreshKpis();
                                $this->resetTable();
                            }),

                        Forms\Components\Actions\Action::make('anio')
                            ->label('Este año')
                            ->action(function () {
                                $this->date_from = now()->startOfYear()->startOfDay()->toDateTimeString();
                                $this->date_to = now()->endOfYear()->endOfDay()->toDateTimeString();
                                $this->form->fill($this->getFilterState());
                                $this->refreshKpis();
                                $this->resetTable();
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
                Tables\Columns\TextColumn::make('codigo')->sortable()->searchable(),
                Tables\Columns\TextColumn::make('unidad.nombre')->label('Unidad')->sortable()->searchable(),
                Tables\Columns\TextColumn::make('solicitante.name')->label('Solicitante')->sortable()->searchable(),
                Tables\Columns\TextColumn::make('origen')->sortable()->searchable(),
                Tables\Columns\TextColumn::make('destino')->sortable()->searchable(),
                Tables\Columns\TextColumn::make('fecha_salida')->label('Salida')->dateTime('d/m/Y H:i')->sortable(),
                Tables\Columns\TextColumn::make('prioridad')->badge()->formatStateUsing(fn ($s) => strtoupper($s)),
                Tables\Columns\TextColumn::make('estado')->badge(),
            ])
            ->paginated([10, 25, 50])
            ->bulkActions([]);
    }

    private function buildQuery(): Builder
    {
        $q = SolicitudTransporte::query();

        // Rango
        if ($this->date_from) {
            $q->where($this->date_field ?? 'fecha_salida', '>=', $this->date_from);
        }
        if ($this->date_to) {
            $q->where($this->date_field ?? 'fecha_salida', '<=', $this->date_to);
        }

        // Filtros
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

    private function refreshKpis(): void
    {
        $base = $this->buildQuery();

        $this->kpi_total = (clone $base)->count();
        $this->kpi_pendientes = (clone $base)->whereIn('estado', [
            EstadoSolicitudEnum::PENDIENTE->value,
            EstadoSolicitudEnum::EN_REVISION->value,
        ])->count();

        $this->kpi_aprobadas = (clone $base)->where('estado', EstadoSolicitudEnum::APROBADA->value)->count();
        $this->kpi_rechazadas = (clone $base)->where('estado', EstadoSolicitudEnum::RECHAZADA->value)->count();
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
        $from = $this->date_from ? \Carbon\Carbon::parse($this->date_from)->format('d/m/Y H:i') : 'N/A';
        $to   = $this->date_to ? \Carbon\Carbon::parse($this->date_to)->format('d/m/Y H:i') : 'N/A';
        $tipo = $this->date_field === 'created_at' ? 'Creación' : 'Salida';

        return "{$tipo}: {$from} - {$to}";
    }
}

