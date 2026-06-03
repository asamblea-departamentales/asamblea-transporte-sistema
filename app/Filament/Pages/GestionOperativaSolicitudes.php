<?php

namespace App\Filament\Pages;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use App\Domain\Solicitudes\Services\Operativo\AprobacionesService;
use App\Domain\Solicitudes\Services\Operativo\BandejaOperativaService;
use App\Domain\Solicitudes\Services\Operativo\RevisionOperativaService;
use App\Domain\Solicitudes\Services\SolicitudCombustibleService;
use App\Domain\Solicitudes\Services\SolicitudTransporteService;
use App\Filament\Resources\SolicitudCombustibleResource;
use App\Models\SolicitudTransporte;
use App\Models\SugerenciaAsignacion;
use App\Models\User;
use App\Models\Vehiculo;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Collection;
use Livewire\WithPagination;

class GestionOperativaSolicitudes extends Page implements Forms\Contracts\HasForms
{
    use InteractsWithForms;
    use WithPagination;

    protected $listeners = [
        'asignarRecursos' => 'asignarRecursosDesdeFilament',
        'aprobarConDecision' => 'aprobarConDecision',
        'asignarCargaCombustible' => 'asignarCargaCombustibleDesdeFilament',
        'aprobarConDecisionCombustible' => 'aprobarConDecisionCombustible',
        'desbloquearTransporte' => 'desbloquearTransporte',
    ];

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

    public ?string $prioridad_grupo = null;

    public ?string $estado = null;

    public int $kpi_total = 0;

    public int $kpi_a = 0;

    public int $kpi_b = 0;

    public int $kpi_c = 0;

    public string $kpi_a_label = 'A';

    public string $kpi_b_label = 'B';

    public string $kpi_c_label = 'C';

    // FIX #1: operativo también necesita acceder a esta página
    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole([
            'super_admin',
            'ti',
            'jefe',
            'operativo',
        ]) ?? false;
    }

    public function mount(): void
    {
        $this->date_from = now()->startOfMonth()->startOfDay()->toDateTimeString();
        $this->date_to = now()->endOfMonth()->endOfDay()->toDateTimeString();

        // Redirigir al jefe directo a aprobaciones al entrar
        if (auth()->user()?->hasRole('jefe') && ! auth()->user()?->hasAnyRole(['super_admin', 'ti'])) {
            $this->etapa = 'aprobaciones';
        }

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
            'prioridad_grupo',
            'estado',
        ], true)) {
            $this->resetPage();
            $this->refreshKpis();
        }
    }

    // FIX #2: Método centralizado para verificar acceso a etapa por rol
    protected function puedeAccederEtapa(string $etapa): bool
    {
        $user = auth()->user();

        if ($user->hasAnyRole(['super_admin', 'ti'])) {
            return true;
        }

        if ($user->hasRole('operativo')) {
            return in_array($etapa, ['bandeja', 'revision'], true);
        }

        if ($user->hasRole('jefe')) {
            return $etapa === 'aprobaciones';
        }

        return false;
    }

    // FIX #3: Bloquear cambio de etapa si el rol no tiene permiso
    public function cambiarEtapa(string $etapa): void
    {
        if (! $this->puedeAccederEtapa($etapa)) {
            Notification::make()
                ->title('No tienes permiso para acceder a esta etapa')
                ->danger()
                ->send();

            return;
        }

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

                Forms\Components\Select::make('prioridad_grupo')
                    ->label('Prioridad Grupo')
                    ->options([
                        'critica' => 'CRÍTICA',
                        'alta' => 'ALTA',
                        'media' => 'MEDIA',
                        'baja' => 'BAJA',
                    ])
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

    // FIX #4a: tomarParaRevision — solo operativo
    public function tomarParaRevision(string $tipo, int $id): void
    {
        if (! auth()->user()->hasAnyRole(['operativo', 'super_admin', 'ti'])) {
            Notification::make()->title('Sin permiso')->danger()->send();

            return;
        }

        app(BandejaOperativaService::class)
            ->tomarParaRevision($tipo, $id, auth()->id(), 'Tomada desde flujo operativo.');

        $this->refreshKpis();
        $this->resetPage();

        Notification::make()
            ->title('Solicitud enviada a revisión')
            ->success()
            ->send();
    }

    // cambiarPrioridad — operativo y superiores
    public function cambiarPrioridad(string $tipo, int $id, string $prioridad): void
    {
        if (! auth()->user()->hasAnyRole(['operativo', 'super_admin', 'ti'])) {
            Notification::make()->title('Sin permiso')->danger()->send();

            return;
        }

        app(BandejaOperativaService::class)
            ->actualizarPrioridad($tipo, $id, $prioridad, auth()->id());

        Notification::make()
            ->title('Prioridad actualizada')
            ->success()
            ->send();

        $this->refreshKpis();
    }

    // observarRevision — operativo y superiores
    public function observarRevision(string $tipo, int $id, array $data): void
    {
        if (! auth()->user()->hasAnyRole(['operativo', 'super_admin', 'ti'])) {
            Notification::make()->title('Sin permiso')->danger()->send();

            return;
        }

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

    // FIX #4c: validar — solo operativo
    public function validar(string $tipo, int $id, array $data): void
    {
        if (! auth()->user()->hasAnyRole(['operativo', 'super_admin', 'ti'])) {
            Notification::make()->title('Sin permiso')->danger()->send();
            return;
        }

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

    // FIX #4d: aprobar — solo jefe
    public function aprobar(string $tipo, int $id, array $data): void
    {
        if (! auth()->user()->hasAnyRole(['jefe', 'super_admin', 'ti'])) {
            Notification::make()->title('Sin permiso')->danger()->send();
            return;
        }

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
            $urlAsignacion = SolicitudCombustibleResource::getUrl('view', ['record' => $id]);

            Notification::make()
                ->title('Solicitud de combustible aprobada')
                ->body('Las cargas/cupones pueden asignarse desde el módulo de Solicitudes de Combustible.')
                ->success()
                ->actions([
                    \Filament\Notifications\Actions\Action::make('ir_a_asignacion')
                        ->label('Asignar cargas ahora →')
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
            ->title('Solicitud aprobada')
            ->success()
            ->send();
    }

    // FIX #4e: rechazar — solo jefe
    public function rechazar(string $tipo, int $id, array $data): void
    {
        if (! auth()->user()->hasAnyRole(['jefe', 'super_admin', 'ti'])) {
            Notification::make()->title('Sin permiso')->danger()->send();

            return;
        }

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

    // FIX #4f: condicionar — solo jefe
    public function condicionar(string $tipo, int $id, array $data): void
    {
        if (! auth()->user()->hasAnyRole(['jefe', 'super_admin', 'ti'])) {
            Notification::make()->title('Sin permiso')->danger()->send();

            return;
        }

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

    // reabrir — solo jefe (acción de resolución administrativa)
    public function reabrir(string $tipo, int $id, array $data): void
    {
        if (! auth()->user()->hasAnyRole(['jefe', 'super_admin', 'ti'])) {
            Notification::make()->title('Sin permiso')->danger()->send();
            return;
        }

        if ($tipo === 'transporte') {
            $solicitud = SolicitudTransporte::findOrFail($id);
            app(SolicitudTransporteService::class)->desbloquear($solicitud, auth()->id());
        } else {
            app(AprobacionesService::class)->reabrir(
                $tipo,
                $id,
                auth()->id(),
                $data['comentario']
            );
        }

        $this->refreshKpis();
        $this->resetPage();

        Notification::make()
            ->title('Solicitud reabierta')
            ->success()
            ->send();
    }

    // ═════════════════════════════════════════════════════
    // NUEVOS — Módulo de Aprobación (Filament)
    // ═════════════════════════════════════════════════════

    public function asignarRecursosDesdeFilament(int $id, int $vehiculoId, int $motoristaId, ?string $justificacion = null): void
    {
        if (!auth()->user()->hasAnyRole(['operativo', 'super_admin', 'ti'])) {
            Notification::make()->title('Sin permiso')->danger()->send();
            return;
        }

        $solicitud = SolicitudTransporte::findOrFail($id);

        try {
            $result = app(SolicitudTransporteService::class)->asignarRecursos(
                $solicitud, auth()->id(), $vehiculoId, $motoristaId, $justificacion
            );

            $this->refreshKpis();
            $this->resetPage();

            Notification::make()
                ->title('Recursos asignados. Solicitud enviada a pre-aprobación.')
                ->success()
                ->send();
        } catch (\DomainException $e) {
            Notification::make()->title($e->getMessage())->danger()->send();
        }
    }

    public function aprobarConDecision(int $id, string $decisionFinal, string $comentario, ?string $firma = null): void
    {
        if (!auth()->user()->hasAnyRole(['jefe', 'super_admin', 'ti'])) {
            Notification::make()->title('Sin permiso')->danger()->send();
            return;
        }

        $solicitud = SolicitudTransporte::findOrFail($id);

        try {
            $result = app(SolicitudTransporteService::class)->aprobarConDecision(
                $solicitud, auth()->id(), $decisionFinal, $comentario, $firma
            );

            $this->refreshKpis();
            $this->resetPage();

            Notification::make()
                ->title('Solicitud aprobada con decisión')
                ->success()
                ->send();
        } catch (\DomainException $e) {
            Notification::make()->title($e->getMessage())->danger()->send();
        }
    }

    public function asignarCargaCombustibleDesdeFilament(int $id, float $monto, ?string $justificacion = null): void
    {
        if (!auth()->user()->hasAnyRole(['operativo', 'super_admin', 'ti'])) {
            Notification::make()->title('Sin permiso')->danger()->send();
            return;
        }

        $solicitud = \App\Models\SolicitudCombustible::findOrFail($id);

        try {
            $result = app(SolicitudCombustibleService::class)->asignarCarga(
                $solicitud, auth()->id(), $monto, $justificacion
            );

            $this->refreshKpis();
            $this->resetPage();

            Notification::make()
                ->title('Carga asignada. La solicitud queda en revisión.')
                ->success()
                ->send();
        } catch (\DomainException $e) {
            Notification::make()->title($e->getMessage())->danger()->send();
        }
    }

    public function aprobarConDecisionCombustible(int $id, string $decisionFinal, ?float $monto = null, ?string $comentario = null): void
    {
        if (!auth()->user()->hasAnyRole(['jefe', 'super_admin', 'ti'])) {
            Notification::make()->title('Sin permiso')->danger()->send();
            return;
        }

        $solicitud = \App\Models\SolicitudCombustible::findOrFail($id);

        try {
            $result = app(SolicitudCombustibleService::class)->aprobarConDecision(
                $solicitud, auth()->id(), $decisionFinal, $monto, $comentario
            );

            $this->refreshKpis();
            $this->resetPage();

            Notification::make()
                ->title('Solicitud de combustible aprobada con decisión')
                ->success()
                ->send();
        } catch (\DomainException $e) {
            Notification::make()->title($e->getMessage())->danger()->send();
        }
    }

    public function desbloquearTransporte(int $id): void
    {
        if (!auth()->user()->hasAnyRole(['jefe', 'super_admin', 'ti'])) {
            Notification::make()->title('Sin permiso')->danger()->send();
            return;
        }

        $solicitud = SolicitudTransporte::findOrFail($id);

        try {
            app(SolicitudTransporteService::class)->desbloquear($solicitud, auth()->id());

            $this->refreshKpis();
            $this->resetPage();

            Notification::make()
                ->title('Solicitud desbloqueada para re-asignación')
                ->success()
                ->send();
        } catch (\DomainException $e) {
            Notification::make()->title($e->getMessage())->danger()->send();
        }
    }

    public function vehiculosDisponibles(): array
    {
        return \App\Models\Vehiculo::disponibles()
            ->orderBy('placa')
            ->get()
            ->pluck('placa', 'id')
            ->toArray();
    }

    public function motoristasDisponibles(): array
    {
        return \App\Models\Motorista::disponibles()
            ->orderBy('nombre')
            ->get()
            ->pluck('nombre', 'id')
            ->toArray();
    }

    public function getVehiculosConMotorista(): array
    {
        return Vehiculo::with('asignacionVigenteMotorista.motorista')
            ->disponibles()
            ->orderBy('placa')
            ->get()
            ->map(fn ($v) => [
                'id' => $v->id,
                'placa' => $v->placa,
                'motorista_id' => $v->asignacionVigenteMotorista?->motorista_id,
                'motorista_nombre' => $v->asignacionVigenteMotorista?->motorista?->nombre,
            ])
            ->keyBy('id')
            ->toArray();
    }

    public function getSugerencia(int $solicitudId): ?array
    {
        $sug = SugerenciaAsignacion::where('solicitud_id', $solicitudId)->first();
        if (!$sug) return null;

        return [
            'vehiculo_sugerido_id' => $sug->vehiculo_sugerido_id,
            'vehiculo_sugerido_placa' => $sug->vehiculoSugerido?->placa,
            'motorista_sugerido_id' => $sug->motorista_sugerido_id,
            'motorista_sugerido_nombre' => $sug->motoristaSugerido?->nombre,
        ];
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
        $this->prioridad_grupo = null;
        $this->estado = null;

        $this->form->fill($this->getFilterState());
        $this->resetPage();
        $this->refreshKpis();
    }

    public function setMesActual(): void
    {
        $this->date_from = now()->startOfMonth()->startOfDay()->toDateTimeString();
        $this->date_to = now()->endOfMonth()->endOfDay()->toDateTimeString();

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

    // FIX: estadosOptions ahora varía según rol además de etapa
    private function estadosOptions(): array
    {
        $user = auth()->user();

        // TI y super_admin ven todos los estados relevantes
        if ($user?->hasAnyRole(['super_admin', 'ti'])) {
            return [
                EstadoSolicitudEnum::PENDIENTE->value => 'Pendiente',
                EstadoSolicitudEnum::EN_REVISION->value => 'En revisión',
                EstadoSolicitudEnum::PRE_APROBADA->value => 'Pre-aprobada',
                EstadoSolicitudEnum::APROBADA->value => 'Aprobada',
                EstadoSolicitudEnum::RECHAZADA->value => 'Rechazada',
            ];
        }

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
            'prioridad_grupo' => $this->prioridad_grupo,
            'estado' => $this->estado,
        ];
    }

    // FIX: ahora sí incluye la etapa para que los servicios puedan filtrar por ella
    private function getFilterStateWithStage(): array
    {
        return array_merge($this->getFilterState(), [
            'etapa' => $this->etapa,
        ]);
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

    // Método auxiliar para la vista — qué etapas puede ver el usuario actual
    public function etapasDisponibles(): array
    {
        $user = auth()->user();

        if ($user?->hasAnyRole(['super_admin', 'ti'])) {
            return ['bandeja', 'revision', 'aprobaciones'];
        }

        if ($user?->hasRole('operativo')) {
            return ['bandeja', 'revision'];
        }

        if ($user?->hasRole('jefe')) {
            return ['aprobaciones'];
        }

        return [];
    }
}
