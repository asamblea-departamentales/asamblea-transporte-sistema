<?php

namespace App\Filament\Pages;

use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use App\Domain\Solicitudes\Services\Operativo\AprobacionesService;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Collection;
use Livewire\WithPagination;

class AprobacionesSolicitudes extends Page implements Forms\Contracts\HasForms
{
    use InteractsWithForms;
    use WithPagination;

    protected static bool $shouldRegisterNavigation = false;

    protected static ?string $navigationGroup = 'Gestión Operativa';

    protected static ?string $navigationLabel = 'Aprobaciones';

    protected static ?string $navigationIcon = 'heroicon-o-check-badge';

    protected static ?int $navigationSort = 3;

    protected static string $view = 'filament.pages.aprobaciones-solicitudes';

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
        $this->date_to = now()->endOfMonth()->endOfDay()->toDateTimeString();

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
                    ->description('Solicitudes listas para aprobación administrativa.')
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
        return app(AprobacionesService::class)
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

    public function aprobar(string $tipo, int $id, array $data): void
    {
        app(AprobacionesService::class)->aprobar(
            $tipo,
            $id,
            auth()->id(),
            $data['comentario'],
            $data['firma'] ?? null,
        );

        $this->refreshKpis();
        $this->resetPage();

        // Notificación enriquecida para transporte
        if ($tipo === 'transporte') {
            $urlAsignacion = \App\Filament\Resources\SolicitudTransporteResource::getUrl('view', ['record' => $id]);

            Notification::make()
                ->title('Solicitud de transporte aprobada')
                ->body('El vehículo y motorista pueden asignarse desde el detalle de la solicitud.')
                ->success()
                ->actions([
                    \Filament\Notifications\Actions\Action::make('ir_a_asignacion')
                        ->label('Asignar transporte ahora →')
                        ->url($urlAsignacion)
                        ->button()
                        ->color('primary'),
                ])
                ->persistent()
                ->send();

            return;
        }

        // Notificación enriquecida para combustible
        if ($tipo === 'combustible') {
            $urlAsignacion = \App\Filament\Resources\SolicitudCombustibleResource::getUrl('view', ['record' => $id]);

            Notification::make()
                ->title('Solicitud de combustible aprobada')
                ->body('Los vales/cupones pueden asignarse desde el módulo de Solicitudes de Combustible.')
                ->success()
                ->actions([
                    \Filament\Notifications\Actions\Action::make('ir_a_asignacion')
                        ->label('Asignar vales ahora →')
                        ->url($urlAsignacion)
                        ->button()
                        ->color('primary'),
                ])
                ->persistent()
                ->send();

            return;
        }

        // Notificación enriquecida para mantenimiento
        if ($tipo === 'mantenimiento') {
            $urlOrden = route('reportes.orden-trabajo.pdf', ['solicitud_id' => $id]);

            Notification::make()
                ->title('Solicitud de mantenimiento aprobada')
                ->body('La orden de trabajo puede generarse desde el detalle de la solicitud.')
                ->success()
                ->actions([
                    \Filament\Notifications\Actions\Action::make('ir_orden')
                        ->label('Generar orden de trabajo →')
                        ->url($urlOrden)
                        ->openUrlInNewTab()
                        ->button()
                        ->color('primary'),
                ])
                ->persistent()
                ->send();

            return;
        }

        // Notificación genérica para otros tipos
        Notification::make()
            ->title('Solicitud aprobada correctamente')
            ->success()
            ->send();
    }

    public function rechazar(string $tipo, int $id, array $data): void
    {
        app(AprobacionesService::class)->rechazar(
            $tipo,
            $id,
            auth()->id(),
            $data['comentario'],
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
            $data['comentario'],
        );

        $this->refreshKpis();
        $this->resetPage();

        Notification::make()
            ->title('Solicitud condicionada y devuelta a revisión')
            ->success()
            ->send();
    }

    public function reabrir(string $tipo, int $id, array $data): void
    {
        app(AprobacionesService::class)->reabrir(
            $tipo,
            $id,
            auth()->id(),
            $data['comentario'],
        );

        $this->refreshKpis();
        $this->resetPage();

        Notification::make()
            ->title('Solicitud reabierta')
            ->success()
            ->send();
    }

    private function refreshKpis(): void
    {
        $kpis = app(AprobacionesService::class)
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
}
