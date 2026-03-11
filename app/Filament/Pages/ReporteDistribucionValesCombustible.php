<?php

namespace App\Filament\Pages;

use App\Domain\Solicitudes\Services\Reportes\ReporteDistribucionValesCombustibleService;
use App\Models\Vehiculo;
use App\Models\Motorista;
use App\Models\Proveedor;
use App\Models\SerieVale;
use App\Models\SolicitudCombustible;
use Filament\Pages\Page;
use Filament\Tables;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Tables\Table;
use Filament\Actions\Action;
use Illuminate\Database\Eloquent\Builder;

class ReporteDistribucionValesCombustible extends Page
implements Forms\Contracts\HasForms, Tables\Contracts\HasTable
{
    use Forms\Concerns\InteractsWithForms;
    use Tables\Concerns\InteractsWithTable;

    protected static ?string $navigationGroup = 'Reportes';
    protected static ?string $navigationLabel = 'Distribución de Vales';
    protected static ?string $navigationIcon = 'heroicon-o-ticket';
    protected static string $view = 'filament.pages.reporte-distribucion-vales';

    public ?string $date_field = 'fecha_asignacion';
    public ?string $date_from = null;
    public ?string $date_to = null;
    public ?int $vehiculo_id = null;
    public ?int $motorista_id = null;
    public ?int $proveedor_id = null;
    public ?int $serie_vale_id = null;

    public int $kpi_total=0;
    public float $kpi_vales=0;
    public float $kpi_monto=0;
    public float $kpi_galones=0;

    public function mount()
    {
        $this->date_from = now()->startOfMonth();
        $this->date_to = now()->endOfMonth();

        $this->form->fill($this->filters());
        $this->refreshKpis();
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('pdf')
            ->label('Exportar PDF')
            ->icon('heroicon-o-printer')
            ->url(fn()=>route('reportes.distribucion-vales.pdf',$this->filters()))
            ->openUrlInNewTab()
        ];
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Grid::make(12)->schema([

                Forms\Components\DatePicker::make('date_from')->label('Desde')->live()->columnSpan(3),
                Forms\Components\DatePicker::make('date_to')->label('Hasta')->live()->columnSpan(3),

                Forms\Components\Select::make('vehiculo_id')
                    ->options(Vehiculo::pluck('placa','id'))
                    ->searchable()->columnSpan(3)->live(),

                Forms\Components\Select::make('motorista_id')
                    ->options(Motorista::pluck('nombre','id'))
                    ->searchable()->columnSpan(3)->live(),

                Forms\Components\Select::make('proveedor_id')
                    ->options(Proveedor::pluck('nombre_comercial','id'))
                    ->searchable()->columnSpan(3)->live(),

                Forms\Components\Select::make('serie_vale_id')
                    ->options(SerieVale::pluck('nombre','id'))
                    ->searchable()->columnSpan(3)->live(),

            ])
        ])->statePath('');
    }

    public function table(Table $table): Table
    {
        return $table
            ->query(fn()=>app(ReporteDistribucionValesCombustibleService::class)
                ->buildQuery($this->filters()))
            ->columns([

                Tables\Columns\TextColumn::make('fecha_asignacion')
                    ->label('Fecha')->date(),

                Tables\Columns\TextColumn::make('codigo')
                    ->label('Solicitud'),

                Tables\Columns\TextColumn::make('solicitante.name')
                    ->label('Solicitante'),

                Tables\Columns\TextColumn::make('vehiculo.placa')
                    ->label('Placa'),

                Tables\Columns\TextColumn::make('serieVale.nombre')
                    ->label('Serie'),

                Tables\Columns\TextColumn::make('cantidad_vales')
                    ->label('Cantidad'),

                Tables\Columns\TextColumn::make('monto_asignado')
                    ->label('Total')->money('USD'),

                Tables\Columns\TextColumn::make('destino_actividad')
                    ->label('Destino'),

                Tables\Columns\TextColumn::make('contrato.proveedor.nombre_completo')
                    ->label('Proveedor'),

                Tables\Columns\TextColumn::make('cantidad_combustible')
                    ->label('Galones'),

                Tables\Columns\TextColumn::make('valor_unitario')
                    ->label('Precio Galón'),

                Tables\Columns\TextColumn::make('motorista.nombre')
                    ->label('Motorista'),

                Tables\Columns\TextColumn::make('comprobantes')
                    ->label('Comprobantes')
                    ->getStateUsing(fn($r)=>app(ReporteDistribucionValesCombustibleService::class)->comprobantes($r))
                    ->badge()

            ])
            ->paginated([10,25,50]);
    }

    private function filters()
    {
        return [
            'date_field'=>$this->date_field,
            'date_from'=>$this->date_from,
            'date_to'=>$this->date_to,
            'vehiculo_id'=>$this->vehiculo_id,
            'motorista_id'=>$this->motorista_id,
            'proveedor_id'=>$this->proveedor_id,
            'serie_vale_id'=>$this->serie_vale_id
        ];
    }

    private function refreshKpis()
    {
        $kpis = app(ReporteDistribucionValesCombustibleService::class)
            ->kpis($this->filters());

        $this->kpi_total=$kpis['total_solicitudes'];
        $this->kpi_vales=$kpis['total_vales'];
        $this->kpi_monto=$kpis['total_monto'];
        $this->kpi_galones=$kpis['total_galones'];
    }
}