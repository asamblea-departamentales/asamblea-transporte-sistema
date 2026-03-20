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

    // Modal
    public bool   $modalLiquidar  = false;
    public ?int   $liquidarId     = null;
    public string $liquidarTipo   = '';
    public string $monto_validado = '';
    public string $resultado      = '';
    public string $observaciones  = '';

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

            $this->dispatch('notify', [
                'type'    => 'success',
                'message' => 'Liquidación registrada correctamente.',
            ]);

        } catch (\DomainException $e) {
            $this->addError('monto_validado', $e->getMessage());
        }
    }

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['liquidador', 'jefe', 'operativo']);
    }
}