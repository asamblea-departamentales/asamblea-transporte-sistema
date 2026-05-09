<?php

namespace App\Filament\Pages;

use App\Domain\Solicitudes\Services\Reportes\ReporteFlotaVehicularService;
use App\Models\TipoVehiculo;
use App\Models\VehClasificacion;
use App\Models\VehEstadoCatalogo;
use App\Models\Vehiculo;
use App\Models\VehMarca;
use App\Models\VehModelo;
use App\Models\VehTipoCombustible;
use Filament\Actions\Action;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Form;
use Filament\Pages\Page;
use Filament\Tables;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ReporteFlotaVehicular extends Page implements Forms\Contracts\HasForms, Tables\Contracts\HasTable
{
    use InteractsWithForms;
    use InteractsWithTable;

    protected static ?string $navigationGroup = 'Reportes';

    protected static ?string $navigationLabel = 'Reporte Flota Vehicular';

    protected static ?string $navigationIcon = 'heroicon-o-truck';

    protected static ?int $navigationSort = 4;

    protected static string $view = 'filament.pages.reporte-flota-vehicular';

    public ?string $placa = null;

    public ?int $tipo_vehiculo_id = null;

    public ?int $veh_marca_id = null;

    public ?int $veh_modelo_id = null;

    public ?int $veh_tipo_combustible_id = null;

    public ?int $veh_clasificacion_id = null;

    public ?int $veh_estado_catalogo_id = null;

    public $activo = null;

    public int $kpi_total = 0;

    public int $kpi_activos = 0;

    public int $kpi_con_asignacion = 0;

    public int $kpi_sin_asignacion = 0;

    public function mount(): void
    {
        $this->form->fill($this->getFilterState());
        $this->refreshKpis();
    }

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['jefe', 'admin', 'ti', 'operativo', 'liquidador']) ?? false;
    }

    public function updated($propertyName): void
    {
        if (in_array($propertyName, [
            'placa',
            'tipo_vehiculo_id',
            'veh_marca_id',
            'veh_modelo_id',
            'veh_tipo_combustible_id',
            'veh_clasificacion_id',
            'veh_estado_catalogo_id',
            'activo',
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
                ->url(fn () => route('reportes.flota-vehicular.pdf', $this->getFilterState()))
                ->openUrlInNewTab(),
        ];
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Grid::make(12)->schema([
                Forms\Components\Section::make('Filtros del reporte')
                    ->description('Filtra la distribución actual de la flota vehicular.')
                    ->icon('heroicon-o-funnel')
                    ->collapsible()
                    ->columnSpan(12)
                    ->schema([
                        Forms\Components\Grid::make(12)->schema([
                            Forms\Components\TextInput::make('placa')
                                ->label('Placa')
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\Select::make('tipo_vehiculo_id')
                                ->label('Tipo de vehículo')
                                ->options(fn () => TipoVehiculo::orderBy('nombre')->pluck('nombre', 'id'))
                                ->searchable()
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\Select::make('veh_marca_id')
                                ->label('Marca')
                                ->options(fn () => VehMarca::orderBy('nombre')->pluck('nombre', 'id'))
                                ->searchable()
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\Select::make('veh_modelo_id')
                                ->label('Modelo')
                                ->options(fn () => VehModelo::orderBy('nombre')->pluck('nombre', 'id'))
                                ->searchable()
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\Select::make('veh_tipo_combustible_id')
                                ->label('Combustible')
                                ->options(fn () => VehTipoCombustible::orderBy('nombre')->pluck('nombre', 'id'))
                                ->searchable()
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\Select::make('veh_clasificacion_id')
                                ->label('Clase')
                                ->options(fn () => VehClasificacion::orderBy('nombre')->pluck('nombre', 'id'))
                                ->searchable()
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\Select::make('veh_estado_catalogo_id')
                                ->label('Estado catálogo')
                                ->options(fn () => VehEstadoCatalogo::orderBy('nombre')->pluck('nombre', 'id'))
                                ->searchable()
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\Select::make('activo')
                                ->label('Activo')
                                ->options([
                                    '1' => 'Sí',
                                    '0' => 'No',
                                ])
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\Actions::make([
                                Forms\Components\Actions\Action::make('limpiar')
                                    ->label('Limpiar')
                                    ->color('gray')
                                    ->icon('heroicon-o-x-mark')
                                    ->action(function () {
                                        $this->placa = null;
                                        $this->tipo_vehiculo_id = null;
                                        $this->veh_marca_id = null;
                                        $this->veh_modelo_id = null;
                                        $this->veh_tipo_combustible_id = null;
                                        $this->veh_clasificacion_id = null;
                                        $this->veh_estado_catalogo_id = null;
                                        $this->activo = null;

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
            ->defaultSort('placa', 'asc')
            ->columns([
                Tables\Columns\TextColumn::make('placa')
                    ->label('Placa')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('vehMarca.nombre')
                    ->label('Marca')
                    ->formatStateUsing(fn ($state, Vehiculo $record) => $state ?: ($record->getAttribute('marca') ?: '-'))
                    ->sortable(),

                Tables\Columns\TextColumn::make('vehModelo.nombre')
                    ->label('Modelo')
                    ->formatStateUsing(fn ($state, Vehiculo $record) => $state ?: ($record->getAttribute('modelo') ?: '-'))
                    ->sortable(),

                Tables\Columns\TextColumn::make('clasificacion.nombre')
                    ->label('Clase')
                    ->sortable(),

                Tables\Columns\TextColumn::make('color.nombre')
                    ->label('Color'),

                Tables\Columns\TextColumn::make('anio')
                    ->label('Año')
                    ->sortable(),

                Tables\Columns\TextColumn::make('tipoCombustible.nombre')
                    ->label('Combustible'),

                Tables\Columns\TextColumn::make('capacidad_personas')
                    ->label('Capacidad'),

                Tables\Columns\TextColumn::make('motor_numero')
                    ->label('No. Motor')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('chasis')
                    ->label('Chasis')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('vin')
                    ->label('VIN')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('asignado_a')
                    ->label('Asignado a')
                    ->getStateUsing(fn (Vehiculo $record) => app(ReporteFlotaVehicularService::class)->resolverAsignadoA($record)),

                Tables\Columns\IconColumn::make('activo')
                    ->label('Activo')
                    ->boolean(),
            ])
            ->paginated([10, 25, 50]);
    }

    private function buildQuery(): Builder
    {
        return app(ReporteFlotaVehicularService::class)
            ->buildQuery($this->getFilterState());
    }

    private function refreshKpis(): void
    {
        $kpis = app(ReporteFlotaVehicularService::class)
            ->getKpis($this->getFilterState());

        $this->kpi_total = $kpis['total'];
        $this->kpi_activos = $kpis['activos'];
        $this->kpi_con_asignacion = $kpis['con_asignacion'];
        $this->kpi_sin_asignacion = $kpis['sin_asignacion'];
    }

    private function getFilterState(): array
    {
        return [
            'placa' => $this->placa,
            'tipo_vehiculo_id' => $this->tipo_vehiculo_id,
            'veh_marca_id' => $this->veh_marca_id,
            'veh_modelo_id' => $this->veh_modelo_id,
            'veh_tipo_combustible_id' => $this->veh_tipo_combustible_id,
            'veh_clasificacion_id' => $this->veh_clasificacion_id,
            'veh_estado_catalogo_id' => $this->veh_estado_catalogo_id,
            'activo' => $this->activo,
        ];
    }
}
