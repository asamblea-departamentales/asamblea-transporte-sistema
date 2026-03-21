<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;
use App\Domain\Solicitudes\Services\Liquidaciones\LiquidacionUnifiedService;
use App\Domain\Solicitudes\Services\SolicitudCombustibleService;
use App\Domain\Solicitudes\Services\SolicitudMantenimientoService;
use App\Models\SolicitudCombustible;
use App\Models\SolicitudMantenimiento;
use Livewire\Attributes\Url;

class PanelLiquidaciones extends Page
{
    protected static ?string $navigationGroup = 'Liquidación';
    protected static ?string $navigationLabel = 'Panel de Liquidación';
    protected static ?string $navigationIcon  = 'heroicon-o-check-badge';
    protected static string  $view            = 'filament.pages.panel-liquidaciones';

    #[Url]
    public string $fecha_desde = '';
    #[Url]
    public string $fecha_hasta = '';
    #[Url]
    public string $tipo        = '';
    #[Url]
    public string $estado      = '';

    // Modal liquidar
    public bool   $modalLiquidar  = false;
    public ?int   $liquidarId     = null;
    public string $liquidarTipo   = '';
    public string $monto_validado = '';
    public string $resultado      = '';
    public string $observaciones  = '';

    // Drawer detalle
    public bool   $drawerDetalle = false;
    public ?array $detalleItem   = null;

    // Modal de Incidencias
    public bool $modalIncidencia = false;

public ?int $incidencia_id = null;
public ?string $incidencia_tipo = null;

public $tipo_incidencia;
public $severidad;
public $descripcion;
public $evidencia = []; // si usas uploads luego

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
            tipo:       $this->tipo        ?: null,
            estado:     $this->estado      ?: null,
        );
    }

    public function limpiarFiltros(): void
    {
        $this->fecha_desde = now()->startOfMonth()->format('Y-m-d');
        $this->fecha_hasta = now()->format('Y-m-d');
        $this->tipo        = '';
        $this->estado      = '';
    }

    // ── MODAL LIQUIDAR ───────────────────────────────────────

    public function abrirModalLiquidar(int $id, string $tipo): void
    {
        $this->liquidarId     = $id;
        $this->liquidarTipo   = $tipo;
        $this->monto_validado = '';
        $this->resultado      = '';
        $this->observaciones  = '';
        $this->modalLiquidar  = true;
    }

    public function cerrarModal(): void
    {
        $this->modalLiquidar = false;
        $this->liquidarId    = null;
        $this->liquidarTipo  = '';
    }

    public function confirmarLiquidacion(): void
    {
        $this->validate([
            'monto_validado' => ['required', 'numeric', 'min:0'],
            'resultado'      => ['required', 'in:coincide,discrepancia'],
        ]);

        $data = [
            'monto_validado' => $this->monto_validado,
            'resultado'      => $this->resultado,
            'observaciones'  => $this->observaciones,
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
        if ($tipo === 'combustible') {
            $record = SolicitudCombustible::with([
                'vehiculo.marca',
                'vehiculo.modelo',
                'solicitante',
                'motorista',
                'liquidacion',
            ])->findOrFail($id);

            $this->detalleItem = [
                'id'                => $record->id,
                'fecha'              => $record->created_at?->format('d/m/Y'),
                'codigo'            => $record->codigo,
                'tipo'              => 'combustible',
                'vehiculo'          => trim($record->vehiculo?->placa . ' — ' . $record->vehiculo?->marca?->nombre . ' ' . $record->vehiculo?->modelo?->nombre),
                'solicitante'       => $record->solicitante?->name,
                'motorista'         => $record->motorista?->nombre ?? '—',
                'monto_solicitado'  => $record->valor_total,
                'monto_validado'    => $record->liquidacion?->monto_validado,
                'resultado'         => $record->liquidacion?->resultado,
                'observaciones'     => $record->liquidacion?->observaciones,
                'fecha_liquidacion' => $record->liquidacion?->fecha_liquidacion?->format('d/m/Y H:i'),
                'comprobantes'      => $record->comprobantes ?? [],
                'tiene_comprobantes'=> !empty($record->comprobantes),  // ← agrega est
                'liquidado'         => $record->liquidacion !== null,
                'pdf_route'         => route('liquidacion.combustible.pdf', $record->id),
            ];
        } else {
            $record = SolicitudMantenimiento::with([
                'vehiculo.marca',
                'vehiculo.modelo',
                'solicitante',
                'liquidacion',
            ])->findOrFail($id);

            $this->detalleItem = [
                'id'                => $record->id,
                'fecha'              => $record->created_at?->format('d/m/Y'),
                'codigo'            => $record->codigo,
                'tipo'              => 'mantenimiento',
                'vehiculo'          => trim($record->vehiculo?->placa . ' — ' . $record->vehiculo?->marca?->nombre . ' ' . $record->vehiculo?->modelo?->nombre),
                'solicitante'       => $record->solicitante?->name,
                'motorista'         => '—',
                'monto_solicitado'  => $record->costo_real ?? $record->costo_estimado,
                'monto_validado'    => $record->liquidacion?->monto_validado,
                'resultado'         => $record->liquidacion?->resultado,
                'observaciones'     => $record->liquidacion?->observaciones,
                'fecha_liquidacion' => $record->liquidacion?->fecha_liquidacion?->format('d/m/Y H:i'),
                'comprobantes'      => $record->adjuntos ?? [],
                'tiene_comprobantes'=> !empty($record->comprobantes),  // ← agrega esto
                'liquidado'         => $record->liquidacion !== null,
                'pdf_route'         => route('liquidacion.mantenimiento.pdf', $record->id),
            ];
        }

        $this->drawerDetalle = true;
    }

    public function cerrarDetalle(): void
    {
        $this->drawerDetalle = false;
        $this->detalleItem   = null;
    }

    //Metodos para las incidencias
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

    app(\App\Domain\Incidencias\Services\IncidenciaService::class)
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
        return auth()->user()?->hasAnyRole(['liquidador', 'jefe', 'operativo']);
    }
}