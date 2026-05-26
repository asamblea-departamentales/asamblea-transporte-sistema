<?php

namespace App\Filament\Pages;

use App\Models\Motorista;
use App\Models\TipoVehiculo;
use App\Models\User;
use App\Models\Vehiculo;
use App\Domain\Solicitudes\Services\Reportes\ReporteMisionOficialService;
use Filament\Actions\Action;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Pages\Page;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Tables\Concerns\InteractsWithTable;
use Illuminate\Database\Eloquent\Builder;

class ReporteMisionOficial extends Page implements Forms\Contracts\HasForms, Tables\Contracts\HasTable
{
    use InteractsWithForms;
    use InteractsWithTable;

    protected static ?string $navigationGroup = 'Reportes';
    protected static ?string $navigationLabel = 'Misión Oficial';
    protected static ?string $navigationIcon = 'heroicon-o-document-text';
    protected static ?int $navigationSort = 7;

    protected static string $view = 'filament.pages.reporte-mision-oficial';

    public ?string $date_from = null;
    public ?string $date_to = null;
    public ?int $vehiculo_id = null;
    public ?int $motorista_id = null;
    public ?int $tipo_vehiculo_id = null;
    public ?int $solicitante_id = null;

    public int $kpi_total = 0;
    public int $kpi_aprobadas = 0;
    public int $kpi_completadas = 0;

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
            'vehiculo_id',
            'motorista_id',
            'tipo_vehiculo_id',
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
                ->url(fn () => route('reportes.mision-oficial.pdf', $this->getFilterState()))
                ->openUrlInNewTab(),
        ];
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Grid::make(12)->schema([
                Forms\Components\Section::make('Filtros del reporte')
                    ->description('Genera misiones oficiales para solicitudes de transporte aprobadas o completadas.')
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

                            Forms\Components\Select::make('motorista_id')
                                ->label('Motorista')
                                ->options(fn () => Motorista::orderBy('nombre')->pluck('nombre', 'id'))
                                ->searchable()
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 2]),

                            Forms\Components\Select::make('tipo_vehiculo_id')
                                ->label('Tipo de vehículo')
                                ->options(fn () => TipoVehiculo::orderBy('nombre')->pluck('nombre', 'id'))
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
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\Actions::make([
                                Forms\Components\Actions\Action::make('mes_actual')
                                    ->label('Mes actual')
                                    ->action(function () {
                                        $this->date_from = now()->startOfMonth()->startOfDay()->toDateTimeString();
                                        $this->date_to   = now()->endOfMonth()->endOfDay()->toDateTimeString();
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
                                        $this->tipo_vehiculo_id = null;
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
            ->defaultSort('fecha_salida', 'asc')
            ->columns([
                Tables\Columns\TextColumn::make('codigo')
                    ->label('Código')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->fontFamily('mono'),

                Tables\Columns\TextColumn::make('fecha_salida')
                    ->label('Salida')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),

                Tables\Columns\TextColumn::make('solicitante.name')
                    ->label('Solicitante')
                    ->sortable(),

                Tables\Columns\TextColumn::make('vehiculo.placa')
                    ->label('Placa')
                    ->sortable(),

                Tables\Columns\TextColumn::make('motorista.nombre')
                    ->label('Motorista')
                    ->sortable(),

                Tables\Columns\TextColumn::make('destino')
                    ->label('Destino')
                    ->wrap(),

                Tables\Columns\TextColumn::make('estado')
                    ->badge(),
            ])
            ->paginated([10, 25, 50]);
    }

    private function buildQuery(): Builder
    {
        return app(ReporteMisionOficialService::class)
            ->buildQuery($this->getFilterState());
    }

    private function refreshKpis(): void
{
    $kpis = app(ReporteMisionOficialService::class)
        ->getKpis($this->getFilterState());

    $this->kpi_total = $kpis['total'];
    $this->kpi_aprobadas = $kpis['aprobadas'];
    $this->kpi_completadas = $kpis['completadas'];
}

    private function getFilterState(): array
    {
        return [
            'date_from' => $this->date_from,
            'date_to' => $this->date_to,
            'vehiculo_id' => $this->vehiculo_id,
            'motorista_id' => $this->motorista_id,
            'tipo_vehiculo_id' => $this->tipo_vehiculo_id,
            'solicitante_id' => $this->solicitante_id,
        ];
    }
}