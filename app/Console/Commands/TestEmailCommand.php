<?php

namespace App\Console\Commands;

use App\Mail\NotificacionEventMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmailCommand extends Command
{
    protected $signature = 'test:email {email}';
    protected $description = 'Enviar email de prueba';

    public function handle()
    {
        $email = $this->argument('email');

        $payload = [
            'tipo' => 'transporte',
            'evento' => 'solicitud_aprobada',
            'mensaje' => 'Tu solicitud de transporte ha sido APROBADA y programada exitosamente. (ESTO ES UNA PRUEBA)',
            'solicitud' => [
                'codigo' => 'TR-2026-000001',
                'estado' => 'aprobado',
                'tipo_vehiculo_nombre' => 'sedan',
                'cantidad_personas' => 5,
                'origen' => 'San Salvador Centro',
                'destino' => 'Santa Tecla',
                'destino_adicional' => 'La Libertad - Antiguo Cuscatlán',
                'fecha_salida' => now()->addDay(),
                'fecha_retorno' => now()->addDays(2),
                'motivo_actividad' => 'Reunión con autoridades locales',
                'vehiculo_placa' => 'P123456',
                'motorista_nombre' => 'Juan Pérez',
            ],
            'solicitante' => [
                'name' => 'Usuario de Prueba',
                'email' => $email,
                'unidad' => [
                    'nombre' => 'Recursos Humanos',
                    'siglas' => 'RRHH',
                ],
            ],
            'timestamp' => now()->toISOString(),
        ];

        Mail::to($email)->send(
            new NotificacionEventMail('Solicitud de Transporte APROBADA (PRUEBA)', $payload)
        );

        $this->info(" Email enviado a: {$email}");
        $this->info("Revisa Mailtrap o tus logs");
    }
}