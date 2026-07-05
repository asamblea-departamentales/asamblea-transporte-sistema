<?php

namespace App\Jobs;

use App\Domain\Solicitudes\Services\SolicitudEmailDispatchService;
use App\Models\SolicitudCombustible;
use App\Models\SolicitudMantenimiento;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RecordatorioLiquidacionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        protected SolicitudCombustible|SolicitudMantenimiento $solicitud,
        protected string $tipo
    ) {}

    public function handle(): void
    {
        $solicitud = $this->solicitud->fresh();

        if (!$solicitud) {
            return;
        }

        if ($solicitud->liquidacion()->exists()) {
            return;
        }

        $estadosLiquidables = match ($this->tipo) {
            'combustible' => ['asignada', 'completada'],
            'mantenimiento' => ['completada'],
        };

        $estado = $solicitud->estado?->value ?? $solicitud->estado;
        if (!in_array($estado, $estadosLiquidables, true)) {
            return;
        }

        try {
            app(SolicitudEmailDispatchService::class)->toLiquidadores(
                $solicitud,
                $this->tipo,
                'solicitud_pendiente_liquidacion'
            );
            Log::info("Recordatorio liquidación enviado: {$this->tipo} #{$solicitud->id} ({$solicitud->codigo})");
        } catch (\Exception $e) {
            Log::error("Error recordatorio {$this->tipo} #{$solicitud->id}: " . $e->getMessage());
        }
    }
}
