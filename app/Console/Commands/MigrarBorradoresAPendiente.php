<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SolicitudTransporte;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Services\SolicitudTransporteService;

class MigrarBorradoresAPendiente extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'solicitudes:migrar-borradores-a-pendiente';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migra solicitudes en estado BORRADOR a PENDIENTE usando el service (con historial y bitácora)';

    /**
     * Execute the console command.
     */
    public function handle(SolicitudTransporteService $service)
    {
        $borradores = SolicitudTransporte::where(
            'estado',
            EstadoSolicitudEnum::BORRADOR
        )->get();

        if ($borradores->isEmpty()) {
            $this->info('No hay solicitudes en estado BORRADOR.');
            return Command::SUCCESS;
        }

        $this->info('Migrando solicitudes BORRADOR → PENDIENTE...');
        $count = 0;

        foreach ($borradores as $solicitud) {
            try {
                // Usamos el solicitante como quien envió la solicitud
                $service->enviarSolicitud(
                    $solicitud,
                    $solicitud->solicitante_id
                );

                $this->line("✔ Solicitud {$solicitud->id} migrada");
                $count++;
            } catch (\Throwable $e) {
                $this->error("✖ Solicitud {$solicitud->id} falló: {$e->getMessage()}");
            }
        }

        $this->info("Proceso finalizado. Total migradas: {$count}");

        return Command::SUCCESS;
    }
}
