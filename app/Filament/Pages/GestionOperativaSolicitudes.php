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
use Filament\Actions\Concerns\InteractsWithActions;
use Filament\Actions\Contracts\HasActions;
use Filament\Actions\Action;
use Illuminate\Support\Collection;
use Livewire\WithPagination;

class GestionOperativaSolicitudes extends Page implements Forms\Contracts\HasForms, HasActions
{
    use InteractsWithForms, InteractsWithActions, WithPagination;

    protected static ?string $navigationGroup = 'Gestión Operativa';
    protected static ?string $navigationLabel = 'Gestión Operativa';
    protected static ?string $navigationIcon = 'heroicon-o-queue-list';
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

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['admin', 'ti', 'jefe']) ?? false;
    }

    public function mount(): void
    {
        $this->date_from = now()->startOfMonth()->toDateTimeString();
        $this->date_to = now()->endOfMonth()->toDateTimeString();
        $this->form->fill($this->getFilterState());
        $this->refreshKpis();
    }

    public function updated($propertyName): void
    {
        if (in_array($propertyName, ['date_from', 'date_to', 'tipo', 'prioridad', 'estado'])) {
            $this->resetPage();
            $this->refreshKpis();
        }
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Grid::make(5)->schema([
                Forms\Components\Select::make('tipo')
                    ->options(['transporte' => 'Transporte', 'combustible' => 'Combustible', 'mantenimiento' => 'Mantenimiento'])
                    ->native(false)->live()->placeholder('Todos'),
                Forms\Components\Select::make('prioridad')
                    ->options(collect(PrioridadSolicitudEnum::cases())->mapWithKeys(fn($c) => [$c->value => strtoupper($c->value)]))
                    ->native(false)->live()->placeholder('Todas'),
                Forms\Components\Select::make('estado')
                    ->options($this->estadosOptions())->native(false)->live()->placeholder('Todos'),
                Forms\Components\DatePicker::make('date_from')->label('Desde')->native(false)->live(),
                Forms\Components\DatePicker::make('date_to')->label('Hasta')->native(false)->live(),
            ]),
        ])->statePath('');
    }

    // --- ACCIÓN DE BANDEJA ---
    public function tomarParaRevision(string $tipo, int $id): void
    {
        try {
            // Llamamos al método correcto del Service según el código que enviaste
            app(BandejaOperativaService::class)->tomarParaRevision(
                tipo: $tipo,
                id: $id,
                userId: auth()->id()
            );

            $this->refreshKpis();
            Notification::make()->title('Solicitud tomada para revisión').success()->send();

        } catch (\Exception $e) {
            Notification::make()->title('Error')->body($e->getMessage())->danger()->send();
        }
    }

    // --- ACCIONES DE MODAL ---
    public function validarAction(): Action
    {
        return Action::make('validar')
            ->label('Validar')
            ->color('success')
            ->icon('heroicon-m-check-circle')
            ->form([
                Forms\Components\CheckboxList::make('check')
                    ->label('Revisiones Técnicas')
                    ->options([
                        'datos_completos' => 'Datos completos',
                        'fechas_validas' => 'Fechas válidas',
                        'recursos_disponibles' => 'Recursos disponibles',
                    ])->columns(2)->required(),
                Forms\Components\Textarea::make('comentario')->required(),
            ])
            ->action(function (array $data, array $arguments) {
                app(RevisionOperativaService::class)->validarYPreaprobar(
                    $arguments['tipo'], $arguments['id'], auth()->id(), $data['comentario'], $data
                );
                $this->refreshKpis();
                Notification::make()->title('Solicitud validada').success()->send();
            });
    }

    public function derivarAction(): Action
    {
        return Action::make('derivar')
            ->label('Derivar')
            ->color('warning')
            ->icon('heroicon-m-arrow-right-circle')
            ->form([
                Forms\Components\Select::make('derivado_a')
                    ->label('Asignar a')
                    ->options(User::pluck('name', 'id'))
                    ->required()->searchable(),
                Forms\Components\Textarea::make('comentario')->required(),
            ])
            ->action(function (array $data, array $arguments) {
                app(RevisionOperativaService::class)->derivar(
                    $arguments['tipo'], $arguments['id'], auth()->id(), (int)$data['derivado_a'], $data['comentario'], []
                );
                $this->refreshKpis();
                Notification::make()->title('Derivación completada').success()->send();
            });
    }

    public function aprobarAction(): Action
    {
        return Action::make('aprobar')
            ->label('Aprobación Final')
            ->color('success')
            ->icon('heroicon-m-check-badge')
            ->form([Forms\Components\Textarea::make('comentario')->required()])
            ->requiresConfirmation()
            ->action(function (array $data, array $arguments) {
                app(AprobacionesService::class)->aprobar($arguments['tipo'], $arguments['id'], auth()->id(), $data['comentario']);
                $this->refreshKpis();
                Notification::make()->title('Solicitud Aprobada').success()->send();
            });
    }

    public function getRowsProperty(): Collection
    {
        return match ($this->etapa) {
            'bandeja' => app(BandejaOperativaService::class)->obtenerSolicitudes($this->getFilterState()),
            'revision' => app(RevisionOperativaService::class)->obtenerSolicitudes($this->getFilterState()),
            'aprobaciones' => app(AprobacionesService::class)->obtenerSolicitudes($this->getFilterState()),
            default => collect(),
        };
    }

    public function getPaginatedRowsProperty()
    {
        $perPage = 8;
        return new \Illuminate\Pagination\LengthAwarePaginator(
            $this->rows->forPage($this->getPage(), $perPage)->values(),
            $this->rows->count(), $perPage, $this->getPage(), ['path' => request()->url()]
        );
    }

    public function cambiarEtapa(string $etapa): void
    {
        $this->etapa = $etapa;
        $this->estado = null;
        $this->resetPage();
        $this->refreshKpis();
    }

    private function refreshKpis(): void
    {
        $service = match ($this->etapa) {
            'bandeja' => app(BandejaOperativaService::class),
            'revision' => app(RevisionOperativaService::class),
            'aprobaciones' => app(AprobacionesService::class),
        };
        $kpis = $service->getKpis($this->getFilterState());
        $this->kpi_total = $kpis['total'] ?? 0;
        $this->kpi_a = $kpis['transporte'] ?? 0;
        $this->kpi_b = $kpis['combustible'] ?? 0;
        $this->kpi_c = $kpis['mantenimiento'] ?? 0;
    }

    public function limpiarFiltros(): void { $this->fill(['tipo' => null, 'prioridad' => null, 'estado' => null]); $this->refreshKpis(); }
    public function setMesActual(): void { $this->date_from = now()->startOfMonth()->toDateTimeString(); $this->refreshKpis(); }

    private function estadosOptions(): array {
        return match ($this->etapa) {
            'bandeja' => [EstadoSolicitudEnum::PENDIENTE->value => 'Pendiente'],
            'revision' => [EstadoSolicitudEnum::EN_REVISION->value => 'En revisión'],
            'aprobaciones' => [EstadoSolicitudEnum::PRE_APROBADA->value => 'Pre-aprobada'],
            default => [],
        };
    }

    private function getFilterState(): array {
        return ['date_from' => $this->date_from, 'date_to' => $this->date_to, 'tipo' => $this->tipo, 'prioridad' => $this->prioridad, 'estado' => $this->estado];
    }

    public function etapaLabel(): string {
        return match($this->etapa) { 'bandeja' => 'Recepción y Clasificación', 'revision' => 'Validación Técnica', 'aprobaciones' => 'Resolución Final', default => '' };
    }
}