<?php

namespace App\Filament\Pages;

use App\Domain\Solicitudes\Services\Liquidaciones\LiquidacionUnifiedService;
use App\Domain\Solicitudes\Services\SolicitudCombustibleService;
use App\Domain\Solicitudes\Services\SolicitudMantenimientoService;
use App\Models\Motorista;
use App\Models\SolicitudCombustible;
use App\Models\SolicitudMantenimiento;
use App\Models\SolicitudTransporte;
use App\Models\User;
use Filament\Pages\Page;
use Livewire\Attributes\Url;

class PanelLiquidaciones extends Page
{
    protected static ?string $navigationGroup = 'Listado / Liquidaciones';

    protected static ?string $navigationLabel = 'Listado de Solicitudes';

    protected static ?string $navigationIcon = 'heroicon-o-check-badge';

    protected static string $view = 'filament.pages.panel-liquidaciones';

    #[Url]
    public string $fecha_desde = '';

    #[Url]
    public string $fecha_hasta = '';

    #[Url]
    public string $tipo = '';

    #[Url]
    public string $estado = '';

    #[Url]
    public string $modo = 'listado';

    #[Url]
    public ?int $solicitante_id = null;

    #[Url]
    public ?int $motorista_id = null;

    // Modal liquidar
    public bool $modalLiquidar = false;

    public ?int $liquidarId = null;

    public string $liquidarTipo = '';

    public string $monto_validado = '';

    public string $resultado = '';

    public string $observaciones = '';

    public array $liquidarData = [];

    // Drawer detalle
    public bool $drawerDetalle = false;

    public ?array $detalleItem = null;

    // Modal de Incidencias
    public bool $modalIncidencia = false;

    public ?int $incidencia_id = null;

    public ?string $incidencia_tipo = null;

    public $tipo_incidencia;

    public $severidad;

    public $descripcion;

    public $evidencia = [];

    public function getHeading(): string
    {
        return $this->modo === 'listado'
            ? 'Listado completo de Solicitudes'
            : 'Panel de Liquidaciones';
    }

    public function mount(): void
    {
        $this->fecha_desde = now()->startOfMonth()->format('Y-m-d');
        $this->fecha_hasta = now()->format('Y-m-d');
    }

    public function getData(): \Illuminate\Support\Collection
    {
        return app(LiquidacionUnifiedService::class)->getAll(
            fechaDesde: $this->fecha_desde ?: null,
            fechaHasta: $this->fecha_hasta ?: null,
            tipo: $this->tipo ?: null,
            estado: $this->estado ?: null,
            modo: $this->modo,
            solicitanteId: $this->solicitante_id,
            motoristaId: $this->motorista_id,
        );
    }

    public function getSolicitantes(): array
    {
        return User::query()
            ->whereHas('solicitudesTransporte')
            ->orWhereHas('solicitudesCombustible')
            ->orWhereHas('solicitudesMantenimiento')
            ->orderBy('name')
            ->pluck('name', 'id')
            ->toArray();
    }

    public function getMotoristas(): array
    {
        return Motorista::query()
            ->where('activo', true)
            ->orderBy('nombre')
            ->pluck('nombre', 'id')
            ->toArray();
    }

    public function getEstadoOptions(): array
    {
        return app(LiquidacionUnifiedService::class)->estadoOptions();
    }

    public function limpiarFiltros(): void
    {
        $this->fecha_desde = now()->startOfMonth()->format('Y-m-d');
        $this->fecha_hasta = now()->format('Y-m-d');
        $this->tipo = '';
        $this->estado = '';
        $this->solicitante_id = null;
        $this->motorista_id = null;
    }

    public function alternarModo(): void
    {
        $this->modo = $this->modo === 'liquidacion' ? 'listado' : 'liquidacion';
        $this->estado = '';
    }

    // ── MODAL LIQUIDAR ───────────────────────────────────────

    public function abrirModalLiquidar(int $id, string $tipo): void
    {
        $this->liquidarId = $id;
        $this->liquidarTipo = $tipo;
        $this->monto_validado = '';
        $this->resultado = '';
        $this->observaciones = '';
        $this->liquidarData = [];

        if ($tipo === 'combustible') {
            $record = SolicitudCombustible::with(['contrato', 'serieCarga'])->findOrFail($id);
            $this->liquidarData = [
                'codigo' => $record->codigo,
                'monto_solicitado' => $record->valor_total,
                'cantidad' => $record->cantidad_combustible,
                'unidad' => 'gal',
                'ticket' => $record->numero_vale_ticket ?? '—',
                'comprobantes' => $record->comprobantes ?? [],
            ];
        } elseif ($tipo === 'mantenimiento') {
            $record = SolicitudMantenimiento::with(['contratoMantenimiento'])->findOrFail($id);
            $this->liquidarData = [
                'codigo' => $record->codigo,
                'monto_solicitado' => $record->costo_real ?? $record->costo_estimado,
                'cantidad' => null,
                'unidad' => null,
                'comprobantes' => $record->adjuntos ?? [],
            ];
        }

        $this->modalLiquidar = true;
    }

    public function cerrarModal(): void
    {
        $this->modalLiquidar = false;
        $this->liquidarId = null;
        $this->liquidarTipo = '';
        $this->liquidarData = [];
    }

    public function confirmarLiquidacion(): void
    {
        $this->validate([
            'monto_validado' => ['required', 'numeric', 'min:0'],
            'resultado' => ['required', 'in:coincide,discrepancia'],
        ]);

        $data = [
            'monto_validado' => $this->monto_validado,
            'resultado' => $this->resultado,
            'observaciones' => $this->observaciones,
        ];

        try {
            if ($this->liquidarTipo === 'combustible') {
                $record = SolicitudCombustible::findOrFail($this->liquidarId);
                app(SolicitudCombustibleService::class)->liquidar($record, auth()->id(), $data);
            } else {
                $record = SolicitudMantenimiento::findOrFail($this->liquidarId);
                app(SolicitudMantenimientoService::class)->liquidar($record, auth()->id(), $data);
            }

            $this->cerrarModal();

        } catch (\DomainException $e) {
            $this->addError('monto_validado', $e->getMessage());
        }
    }

    // ── DRAWER DETALLE ───────────────────────────────────────

    public function abrirDetalle(int $id, string $tipo): void
    {
        if ($tipo === 'transporte') {
            $record = SolicitudTransporte::with([
                'vehiculo.vehMarca',
                'vehiculo.vehModelo',
                'solicitante',
                'motorista',
                'unidad',
            ])->findOrFail($id);

            $this->detalleItem = [
                'id' => $record->id,
                'fecha' => $record->created_at?->format('d/m/Y'),
                'codigo' => $record->codigo,
                'tipo' => 'transporte',
                'vehiculo' => trim($record->vehiculo?->placa.' — '.$record->vehiculo?->vehMarca?->nombre.' '.$record->vehiculo?->vehModelo?->nombre),
                'solicitante' => $record->solicitante?->name,
                'motorista' => $record->motorista?->nombre ?? '—',
                'destino' => $record->destino ?? '—',
                'estado' => $record->estado?->value ?? $record->estado,
                'fecha_salida' => $record->fecha_salida?->format('d/m/Y H:i'),
                'fecha_retorno' => $record->fecha_retorno?->format('d/m/Y H:i'),
                'motivo_actividad' => $record->motivo_actividad ?? '—',
                'cantidad_personas' => $record->cantidad_personas ?? '—',
                'prioridad_grupo' => $record->prioridad_grupo ?? '—',
                'comentario_jefe' => $record->comentario_jefe ?? '—',
                'monto_solicitado' => 0,
                'monto_validado' => null,
                'resultado' => null,
                'observaciones' => $record->comentario_jefe,
                'fecha_liquidacion' => null,
                'comprobantes' => [],
                'tiene_comprobantes' => false,
                'liquidado' => false,
                'pdf_route' => null,
                'tiene_mision_oficial' => ! empty($record->vehiculo_id) && ! empty($record->motorista_id) && ! empty($record->decidido_por),
                'tiene_doc_oficial' => ! empty($record->vehiculo_id) && ! empty($record->motorista_id),
                'mision_oficial_route' => route('reportes.mision-oficial.pdf', ['solicitud_id' => $record->id]),
                'doc_oficial_route' => route('reportes.solicitud-autorizacion.pdf', ['solicitud' => $record->id]),
            ];
        } elseif ($tipo === 'combustible') {
            $record = SolicitudCombustible::with([
                'vehiculo.vehMarca',
                'vehiculo.vehModelo',
                'solicitante',
                'motorista',
                'liquidacion',
                'solicitudTransporte',
                'contrato',
                'serieCarga',
            ])->findOrFail($id);

            $this->detalleItem = [
                'id' => $record->id,
                'fecha' => $record->created_at?->format('d/m/Y'),
                'fecha_asignacion' => $record->fecha_asignacion?->format('d/m/Y'),
                'codigo' => $record->codigo,
                'tipo' => 'combustible',
                'vehiculo' => trim($record->vehiculo?->placa.' — '.$record->vehiculo?->vehMarca?->nombre.' '.$record->vehiculo?->vehModelo?->nombre),
                'solicitante' => $record->solicitante?->name,
                'motorista' => $record->motorista?->nombre ?? '—',
                'destino' => $record->destino_actividad ?? '—',
                'estado' => $record->estado?->value ?? $record->estado,
                'contrato_numero' => $record->contrato?->numero_contrato ?? '—',
                'serie_nombre' => $record->serieCarga?->nombre ?? '—',
                'correlativo_rango' => $record->correlativo_inicio
                    ? ($record->correlativo_inicio === $record->correlativo_fin
                        ? (string) $record->correlativo_inicio
                        : "{$record->correlativo_inicio} - {$record->correlativo_fin}")
                    : '—',
                'cantidad_vales' => $record->cantidad_vales ?? 0,
                'monto_solicitado' => $record->valor_total,
                'cantidad_galones' => $record->cantidad_combustible,
                'valor_unitario' => $record->valor_unitario ?? 1,
                'ticket' => $record->ticket ?? '—',
                'numero_vale_ticket' => $record->numero_vale_ticket ?? '—',
                'monto_validado' => $record->liquidacion?->monto_validado,
                'resultado' => $record->liquidacion?->resultado,
                'observaciones' => $record->liquidacion?->observaciones,
                'fecha_liquidacion' => $record->liquidacion?->fecha_liquidacion?->format('d/m/Y H:i'),
                'comprobantes' => $record->comprobantes ?? [],
                'tiene_comprobantes' => ! empty($record->comprobantes),
                'liquidado' => $record->liquidacion !== null,
                'pdf_route' => route('liquidacion.combustible.pdf', $record->id),
                'solicitud_transporte_id' => $record->solicitud_transporte_id,
            ];
        } else {
            $record = SolicitudMantenimiento::with([
                'vehiculo.vehMarca',
                'vehiculo.vehModelo',
                'solicitante',
                'liquidacion',
                'tipoMantenimiento',
                'contratoMantenimiento',
            ])->findOrFail($id);

            $this->detalleItem = [
                'id' => $record->id,
                'fecha' => $record->created_at?->format('d/m/Y'),
                'codigo' => $record->codigo,
                'tipo' => 'mantenimiento',
                'vehiculo' => trim($record->vehiculo?->placa.' — '.$record->vehiculo?->vehMarca?->nombre.' '.$record->vehiculo?->vehModelo?->nombre),
                'solicitante' => $record->solicitante?->name,
                'motorista' => '—',
                'estado' => $record->estado?->value ?? $record->estado,
                'tipo_mantenimiento' => $record->tipoMantenimiento?->nombre ?? '—',
                'contrato_numero' => $record->contratoMantenimiento?->numero_contrato ?? '—',
                'fecha_sugerida' => $record->fecha_sugerida?->format('d/m/Y'),
                'fecha_realizada' => $record->fecha_realizada?->format('d/m/Y'),
                'costo_estimado' => $record->costo_estimado,
                'monto_solicitado' => $record->costo_real ?? $record->costo_estimado,
                'costo_real' => $record->costo_real,
                'detalle' => $record->detalle ?? '—',
                'observaciones' => $record->liquidacion?->observaciones,
                'monto_validado' => $record->liquidacion?->monto_validado,
                'resultado' => $record->liquidacion?->resultado,
                'fecha_liquidacion' => $record->liquidacion?->fecha_liquidacion?->format('d/m/Y H:i'),
                'comprobantes' => $record->adjuntos ?? [],
                'tiene_comprobantes' => ! empty($record->adjuntos),
                'liquidado' => $record->liquidacion !== null,
                'pdf_route' => route('liquidacion.mantenimiento.pdf', $record->id),
                'tiene_orden_trabajo' => ! empty($record->vehiculo_id),
                'orden_trabajo_route' => route('reportes.orden-trabajo.pdf', ['solicitud_id' => $record->id]),
            ];
        }

        $this->drawerDetalle = true;
    }

    public function cerrarDetalle(): void
    {
        $this->drawerDetalle = false;
        $this->detalleItem = null;
    }

    // Metodos para las incidencias
    public function abrirModalIncidencia(int $id, string $tipo): void
    {
        $this->incidencia_id = $id;
        $this->incidencia_tipo = $tipo;

        $this->reset([
            'tipo_incidencia',
            'severidad',
            'descripcion',
            'evidencia',
        ]);

        $this->modalIncidencia = true;
    }

    public function cerrarModalIncidencia(): void
    {
        $this->modalIncidencia = false;

        $this->reset([
            'incidencia_id',
            'incidencia_tipo',
            'tipo_incidencia',
            'severidad',
            'descripcion',
            'evidencia',
        ]);
    }

    public function guardarIncidencia(): void
    {
        $this->validate([
            'tipo_incidencia' => ['required', 'string', 'max:100'],
            'severidad' => ['required', 'in:baja,media,alta,critica'],
            'descripcion' => ['required', 'string', 'max:1000'],
        ]);

        app(\App\Domain\Solicitudes\Services\IncidenciaService::class)
            ->crear([
                'entidad_tipo' => $this->incidencia_tipo,
                'entidad_id' => $this->incidencia_id,
                'tipo' => $this->tipo_incidencia,
                'severidad' => $this->severidad,
                'descripcion' => $this->descripcion,
                'user_id' => auth()->id(),
            ]);

        $this->cerrarModalIncidencia();

        $this->dispatch('$refresh');

        \Filament\Notifications\Notification::make()
            ->title('Incidencia registrada')
            ->success()
            ->send();
    }

    public static function canAccess(): bool
    {
        if (auth()->check()) {
            return auth()->user()->hasAnyRole(['liquidador', 'jefe', 'operativo', 'admin', 'super_admin', 'super-admin', 'superadmin']);
        }

        return false;
    }
}
