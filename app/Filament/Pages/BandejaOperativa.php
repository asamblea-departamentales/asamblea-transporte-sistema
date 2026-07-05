<?php

namespace App\Filament\Pages;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use App\Domain\Solicitudes\Services\Operativo\BandejaOperativaService;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Form;
use Filament\Pages\Page;
use Illuminate\Support\Collection;
use Livewire\WithPagination;

class BandejaOperativa extends Page implements Forms\Contracts\HasForms
{
    use InteractsWithForms;
    use WithPagination;

    protected static bool $shouldRegisterNavigation = false;

    protected static ?string $navigationGroup = 'Gestión Operativa';

    protected static ?string $navigationLabel = 'Bandeja Operativa';

    protected static ?string $navigationIcon = 'heroicon-o-inbox-stack';

    protected static ?int $navigationSort = 1;

    protected static string $view = 'filament.pages.bandeja-operativa';

    public ?string $date_from = null;

    public ?string $date_to = null;

    public ?string $tipo = null;

    public ?string $estado = null;

    public ?string $prioridad = null;

    public int $kpi_total = 0;

    public int $kpi_transporte = 0;

    public int $kpi_combustible = 0;

    public int $kpi_mantenimiento = 0;

    public function mount(): void
    {
        $this->date_from = now()->startOfMonth()->startOfDay()->toDateTimeString();
        $this->date_to = now()->endOfMonth()->endOfDay()->toDateTimeString();

        $this->form->fill($this->getFilterState());
        $this->refreshKpis();
    }

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['admin', 'ti', 'jefe', 'super_admin']) ?? false;
    }

    public function updated($propertyName): void
    {
        if (in_array($propertyName, [
            'date_from',
            'date_to',
            'tipo',
            'estado',
            'prioridad',
        ], true)) {
            $this->resetPage();
            $this->refreshKpis();
        }
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Grid::make(12)->schema([
                Forms\Components\Section::make('Filtros')
                    ->description('Centraliza las solicitudes pendientes de revisión.')
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

                            Forms\Components\Select::make('tipo')
                                ->label('Tipo')
                                ->options([
                                    'transporte' => 'Transporte',
                                    'combustible' => 'Combustible',
                                    'mantenimiento' => 'Mantenimiento',
                                ])
                                ->native(false)
                                ->searchable()
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 2]),

                            Forms\Components\Select::make('estado')
                                ->label('Estado')
                                ->options([
                                    EstadoSolicitudEnum::PENDIENTE->value => 'Pendiente',
                                    EstadoSolicitudEnum::EN_REVISION->value => 'En revisión',
                                ])
                                ->native(false)
                                ->searchable()
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 2]),

                            Forms\Components\Select::make('prioridad')
                                ->label('Prioridad')
                                ->options(
                                    collect(PrioridadSolicitudEnum::cases())
                                        ->mapWithKeys(fn ($c) => [$c->value => strtoupper($c->value)])
                                )
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
                                        $this->resetPage();
                                        $this->refreshKpis();
                                    }),

                                Forms\Components\Actions\Action::make('limpiar')
                                    ->label('Limpiar')
                                    ->color('gray')
                                    ->action(function () {
                                        $this->date_from = null;
                                        $this->date_to = null;
                                        $this->tipo = null;
                                        $this->estado = null;
                                        $this->prioridad = null;
                                        $this->form->fill($this->getFilterState());
                                        $this->resetPage();
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

    public function getRowsProperty(): Collection
    {
        return app(BandejaOperativaService::class)
            ->obtenerSolicitudes($this->getFilterState());
    }

    public function getPaginatedRowsProperty()
    {
        $perPage = 10;
        $page = $this->getPage();

        return new \Illuminate\Pagination\LengthAwarePaginator(
            $this->rows->forPage($page, $perPage)->values(),
            $this->rows->count(),
            $perPage,
            $page,
            ['path' => request()->url(), 'pageName' => 'page']
        );
    }

    public function tomarParaRevision(string $tipo, int $id): void
    {
        app(BandejaOperativaService::class)
            ->tomarParaRevision($tipo, $id, auth()->id(), 'Tomada desde bandeja operativa.');

        $this->refreshKpis();
        $this->resetPage();

        \Filament\Notifications\Notification::make()
            ->title('Solicitud enviada a revisión')
            ->success()
            ->send();
    }

    public function cambiarPrioridad(string $tipo, int $id, string $prioridad): void
    {
        app(BandejaOperativaService::class)
            ->actualizarPrioridad($tipo, $id, $prioridad, auth()->id());

        \Filament\Notifications\Notification::make()
            ->title('Prioridad actualizada')
            ->success()
            ->send();
    }

    private function refreshKpis(): void
    {
        $kpis = app(BandejaOperativaService::class)
            ->getKpis($this->getFilterState());

        $this->kpi_total = $kpis['total'];
        $this->kpi_transporte = $kpis['transporte'];
        $this->kpi_combustible = $kpis['combustible'];
        $this->kpi_mantenimiento = $kpis['mantenimiento'];
    }

    private function getFilterState(): array
    {
        return [
            'date_from' => $this->date_from,
            'date_to' => $this->date_to,
            'tipo' => $this->tipo,
            'estado' => $this->estado,
            'prioridad' => $this->prioridad,
        ];
    }
}
