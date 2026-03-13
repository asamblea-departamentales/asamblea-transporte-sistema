<?php

namespace App\Filament\Pages;

use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use App\Models\User;
use App\Domain\Solicitudes\Services\Operativo\RevisionOperativaService;
use Filament\Actions\Action;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Forms\Concerns\InteractsWithForms;
use Illuminate\Support\Collection;
use Livewire\WithPagination;

class RevisionOperativa extends Page implements Forms\Contracts\HasForms
{
    use InteractsWithForms;
    use WithPagination;
    protected static bool $shouldRegisterNavigation = false;
    protected static ?string $navigationGroup = 'Gestión Operativa';
    protected static ?string $navigationLabel = 'Revisión Operativa';
    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-check';
    protected static ?int $navigationSort = 2;

    protected static string $view = 'filament.pages.revision-operativa';

    public ?string $date_from = null;
    public ?string $date_to = null;
    public ?string $tipo = null;
    public ?string $prioridad = null;

    public int $kpi_total = 0;
    public int $kpi_transporte = 0;
    public int $kpi_combustible = 0;
    public int $kpi_mantenimiento = 0;

    public function mount(): void
    {
        $this->date_from = now()->startOfMonth()->startOfDay()->toDateTimeString();
        $this->date_to   = now()->endOfMonth()->endOfDay()->toDateTimeString();

        $this->form->fill($this->getFilterState());
        $this->refreshKpis();
    }

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['admin', 'ti', 'jefe']) ?? false;
    }

    public function updated($propertyName): void
    {
        if (in_array($propertyName, ['date_from', 'date_to', 'tipo', 'prioridad'], true)) {
            $this->resetPage();
            $this->refreshKpis();
        }
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Grid::make(12)->schema([
                Forms\Components\Section::make('Filtros')
                    ->description('Solicitudes en revisión operativa.')
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
                                ->columnSpan(['default' => 12, 'md' => 3]),

                            Forms\Components\Select::make('prioridad')
                                ->label('Prioridad')
                                ->options(
                                    collect(PrioridadSolicitudEnum::cases())
                                        ->mapWithKeys(fn ($c) => [$c->value => strtoupper($c->value)])
                                )
                                ->native(false)
                                ->live()
                                ->columnSpan(['default' => 12, 'md' => 3]),
                        ]),
                    ]),
            ]),
        ])->statePath('');
    }

    public function getRowsProperty(): Collection
    {
        return app(RevisionOperativaService::class)
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

    public function derivar(string $tipo, int $id, array $data): void
    {
        app(RevisionOperativaService::class)->derivar(
            $tipo,
            $id,
            auth()->id(),
            (int) $data['derivado_a'],
            $data['comentario'],
            $this->armarValidaciones($data),
        );

        Notification::make()
            ->title('Solicitud derivada correctamente')
            ->success()
            ->send();
    }

    public function observar(string $tipo, int $id, array $data): void
    {
        app(RevisionOperativaService::class)->observar(
            $tipo,
            $id,
            auth()->id(),
            $data['comentario'],
            $this->armarValidaciones($data),
        );

        Notification::make()
            ->title('Observación registrada')
            ->success()
            ->send();
    }

    public function validar(string $tipo, int $id, array $data): void
    {
        app(RevisionOperativaService::class)->validarYPreaprobar(
            $tipo,
            $id,
            auth()->id(),
            $data['comentario'],
            $this->armarValidaciones($data),
        );

        $this->refreshKpis();
        $this->resetPage();

        Notification::make()
            ->title('Solicitud enviada a preaprobación')
            ->success()
            ->send();
    }

    protected function getHeaderActions(): array
    {
        return [];
    }

    private function armarValidaciones(array $data): array
    {
        return [
            'datos_completos' => (bool) ($data['datos_completos'] ?? false),
            'fechas_validas' => (bool) ($data['fechas_validas'] ?? false),
            'recursos_disponibles' => (bool) ($data['recursos_disponibles'] ?? false),
            'reglas_minimas' => (bool) ($data['reglas_minimas'] ?? false),
            'hallazgos' => $data['hallazgos'] ?? null,
        ];
    }

    private function refreshKpis(): void
    {
        $kpis = app(RevisionOperativaService::class)
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
            'prioridad' => $this->prioridad,
        ];
    }

    public function usuariosOptions(): array
    {
        return User::orderBy('name')->pluck('name', 'id')->toArray();
    }
}