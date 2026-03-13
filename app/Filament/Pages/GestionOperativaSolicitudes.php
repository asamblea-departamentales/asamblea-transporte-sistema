<?php

namespace App\Filament\Pages;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use App\Models\User;
use App\Domain\Solicitudes\Services\Operativo\AprobacionesService;
use App\Domain\Solicitudes\Services\Operativo\BandejaOperativaService;
use App\Domain\Solicitudes\Services\Operativo\RevisionOperativaService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Forms\Concerns\InteractsWithForms;
use Illuminate\Support\Collection;
use Livewire\WithPagination;

class GestionOperativaSolicitudes extends Page implements Forms\Contracts\HasForms
{
    use InteractsWithForms;
    use WithPagination;

    protected static ?string $navigationGroup = 'Gestión Operativa';
    protected static ?string $navigationLabel = 'Gestión Operativa de Solicitudes';
    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';
    protected static ?int $navigationSort = 1;

    protected static string $view = 'filament.pages.gestion-operativa-solicitudes';

    public string $etapa = 'bandeja';

    public ?string $date_from = null;
    public ?string $date_to = null;
    public ?string $tipo = null;
    public ?string $prioridad = null;
    public ?string $estado = null;

    public int $kpi_total = 0;
    public int $kpi_a = 0;
    public int $kpi_b = 0;
    public int $kpi_c = 0;
    public string $kpi_a_label = 'A';
    public string $kpi_b_label = 'B';
    public string $kpi_c_label = 'C';

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['admin', 'ti', 'jefe']) ?? false;
    }

    public function mount(): void
    {
        $this->date_from = now()->startOfMonth()->startOfDay()->toDateTimeString();
        $this->date_to   = now()->endOfMonth()->endOfDay()->toDateTimeString();

        $this->form->fill($this->getFilterState());
        $this->refreshKpis();
    }

    public function updated($propertyName): void
    {
        if (in_array($propertyName, [
            'date_from',
            'date_to',
            'tipo',
            'prioridad',
            'estado',
        ], true)) {
            $this->resetPage();
            $this->refreshKpis();
        }
    }

    public function cambiarEtapa(string $etapa): void
    {
        $this->etapa = $etapa;
        $this->estado = null;
        $this->resetPage();
        $this->refreshKpis();
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Grid::make(12)->schema([
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

                Forms\Components\Select::make('prioridad')
                    ->label('Prioridad')
                    ->options(
                        collect(PrioridadSolicitudEnum::cases())
                            ->mapWithKeys(fn ($c) => [$c->value => strtoupper($c->value)])
                    )
                    ->native(false)
                    ->live()
                    ->columnSpan(['default' => 12, 'md' => 2]),

                Forms\Components\Select::make('estado')
                    ->label('Estado')
                    ->options($this->estadosOptions())
                    ->native(false)
                    ->searchable()
                    ->live()
                    ->columnSpan(['default' => 12, 'md' => 2]),

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
            ]),
        ])->statePath('');
    }

    public function getRowsProperty(): Collection
    {
        return match ($this->etapa) {
            'bandeja' => app(BandejaOperativaService::class)->obtenerSolicitudes($this->getFilterStateWithStage()),
            'revision' => app(RevisionOperativaService::class)->obtenerSolicitudes($this->getFilterStateWithStage()),
            'aprobaciones' => app(AprobacionesService::class)->obtenerSolicitudes($this->getFilterStateWithStage()),
            default => collect(),
        };
    }

    public function getPaginatedRowsProperty()
    {
        $perPage = 8;
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
            ->tomarParaRevision($tipo, $id, auth()->id(), 'Tomada desde flujo operativo.');

        $this->refreshKpis();
        $this->resetPage();

        Notification::make()
            ->title('Solicitud enviada a revisión')
            ->success()
            ->send();
    }

    public function cambiarPrioridad(string $tipo, int $id, string $prioridad): void
    {
        app(BandejaOperativaService::class)
            ->actualizarPrioridad($tipo, $id, $prioridad, auth()->id());

        Notification::make()
            ->title('Prioridad actualizada')
            ->success()
            ->send();

        $this->refreshKpis();
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
            ->title('Solicitud derivada')
            ->success()
            ->send();
    }

    public function observarRevision(string $tipo, int $id, array $data): void
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

    public function aprobar(string $tipo, int $id, array $data): void
    {
        app(AprobacionesService::class)->aprobar(
            $tipo,
            $id,
            auth()->id(),
            $data['comentario']
        );

        $this->refreshKpis();
        $this->resetPage();

        Notification::make()
            ->title('Solicitud aprobada')
            ->success()
            ->send();
    }

    public function rechazar(string $tipo, int $id, array $data): void
    {
        app(AprobacionesService::class)->rechazar(
            $tipo,
            $id,
            auth()->id(),
            $data['comentario']
        );

        $this->refreshKpis();
        $this->resetPage();

        Notification::make()
            ->title('Solicitud rechazada')
            ->success()
            ->send();
    }

    public function condicionar(string $tipo, int $id, array $data): void
    {
        app(AprobacionesService::class)->condicionar(
            $tipo,
            $id,
            auth()->id(),
            $data['comentario']
        );

        $this->refreshKpis();
        $this->resetPage();

        Notification::make()
            ->title('Solicitud condicionada')
            ->success()
            ->send();
    }

    public function reabrir(string $tipo, int $id, array $data): void
    {
        app(AprobacionesService::class)->reabrir(
            $tipo,
            $id,
            auth()->id(),
            $data['comentario']
        );

        $this->refreshKpis();
        $this->resetPage();

        Notification::make()
            ->title('Solicitud reabierta')
            ->success()
            ->send();
    }

    public function usuariosOptions(): array
    {
        return User::orderBy('name')->pluck('name', 'id')->toArray();
    }

    public function limpiarFiltros(): void
    {
        $this->date_from = null;
        $this->date_to = null;
        $this->tipo = null;
        $this->prioridad = null;
        $this->estado = null;

        $this->form->fill($this->getFilterState());
        $this->resetPage();
        $this->refreshKpis();
    }

    public function setMesActual(): void
    {
        $this->date_from = now()->startOfMonth()->startOfDay()->toDateTimeString();
        $this->date_to   = now()->endOfMonth()->endOfDay()->toDateTimeString();

        $this->form->fill($this->getFilterState());
        $this->resetPage();
        $this->refreshKpis();
    }

    private function refreshKpis(): void
    {
        $kpis = match ($this->etapa) {
            'bandeja' => app(BandejaOperativaService::class)->getKpis($this->getFilterStateWithStage()),
            'revision' => app(RevisionOperativaService::class)->getKpis($this->getFilterStateWithStage()),
            'aprobaciones' => app(AprobacionesService::class)->getKpis($this->getFilterStateWithStage()),
            default => ['total' => 0, 'transporte' => 0, 'combustible' => 0, 'mantenimiento' => 0],
        };

        $this->kpi_total = $kpis['total'] ?? 0;
        $this->kpi_a = $kpis['transporte'] ?? 0;
        $this->kpi_b = $kpis['combustible'] ?? 0;
        $this->kpi_c = $kpis['mantenimiento'] ?? 0;

        $this->kpi_a_label = 'Transporte';
        $this->kpi_b_label = 'Combustible';
        $this->kpi_c_label = 'Mantenimiento';
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

    private function estadosOptions(): array
    {
        return match ($this->etapa) {
            'bandeja' => [
                EstadoSolicitudEnum::PENDIENTE->value => 'Pendiente',
                EstadoSolicitudEnum::EN_REVISION->value => 'En revisión',
            ],
            'revision' => [
                EstadoSolicitudEnum::EN_REVISION->value => 'En revisión',
            ],
            'aprobaciones' => [
                EstadoSolicitudEnum::PRE_APROBADA->value => 'Pre-aprobada',
            ],
            default => [],
        };
    }

    private function getFilterState(): array
    {
        return [
            'date_from' => $this->date_from,
            'date_to' => $this->date_to,
            'tipo' => $this->tipo,
            'prioridad' => $this->prioridad,
            'estado' => $this->estado,
        ];
    }

    private function getFilterStateWithStage(): array
    {
        return $this->getFilterState();
    }

    public function etapaLabel(): string
    {
        return match ($this->etapa) {
            'bandeja' => 'Recepción, clasificación y priorización inicial.',
            'revision' => 'Validación técnica, observaciones y derivación.',
            'aprobaciones' => 'Resolución administrativa y cierre de decisión.',
            default => '',
        };
    }

    public function etapaColor(): string
    {
        return match ($this->etapa) {
            'bandeja' => 'primary',
            'revision' => 'warning',
            'aprobaciones' => 'success',
            default => 'gray',
        };
    }
}