<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/**
 * Mailable utilizado para todas las notificaciones de eventos sobre solicitudes
 * (transporte, combustible, mantenimiento).
 *
 * Implementa ShouldQueue para que los correos se envíen de forma asíncrona
 * a través de un worker de colas. Esto evita demoras en la respuesta HTTP
 * cuando se disparan notificaciones.
 *
 * NOTA: El logo institucional no se embeble con embed() para evitar correos
 * pesados y problemas de SPAM. La plantilla Blade usa asset() como fallback.
 */
class NotificacionEventMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $subject;
    public $payload;

    /**
     * @param string $subject Asunto del correo
     * @param array  $payload Datos estructurados que se pasan a la vista Blade
     */
    public function __construct($subject, $payload)
    {
        $this->subject = $subject;
        $this->payload = $payload;
    }

    /**
     * Construye el mensaje: asigna la vista, pasa las variables
     * y adjunta archivos si los hay.
     */
    public function build()
    {
        $payload = $this->payload;

        $mapUrl = null;

        if (($payload['tipo'] ?? null) === 'transporte' && isset($payload['solicitud'])) {
            $mapService = app(\App\Domain\Solicitudes\Services\MapImageService::class);
            $mapUrl = $mapService->generateRouteImageUrl($payload['solicitud']);
        }

        $mail = $this->subject($this->subject)
            ->view('emails.notificacion_event')
            ->with([
                'payload' => $payload,
                'map_url' => $mapUrl,
                'subject' => $this->subject,
            ]);

        $this->attachFilesFromPayload($payload, $mail);

        return $mail;
    }

    /**
     * Adjunta archivos al correo si el payload contiene una clave 'attachments'.
     * Cada elemento puede ser una ruta relativa a storage/app/public/,
     * storage/app/, public/, o una ruta absoluta.
     */
    private function attachFilesFromPayload(array $payload, $mail): void
    {
        $attachments = $payload['attachments'] ?? [];
        if (empty($attachments)) {
            return;
        }

        foreach ($attachments as $file) {
            $path = $this->resolveAttachmentPath($file);
            if ($path && file_exists($path)) {
                $mail->attach($path);
            }
        }
    }

    /**
     * Resuelve la ruta real de un archivo buscando en varias ubicaciones posibles:
     *
     * 1. storage/app/public/{file}
     * 2. storage/app/{file}
     * 3. public/{file}
     * 4. La ruta tal cual
     *
     * @param  mixed       $file Nombre/ruta del archivo
     * @return string|null       Ruta absoluta si se encuentra, null en caso contrario
     */
    private function resolveAttachmentPath($file): ?string
    {
        if (empty($file)) {
            return null;
        }

        $candidates = [
            storage_path('app/public/' . ltrim((string) $file, '/')),
            storage_path('app/' . ltrim((string) $file, '/')),
            public_path(ltrim((string) $file, '/')),
            (string) $file,
        ];

        foreach ($candidates as $candidate) {
            if (file_exists($candidate)) {
                return $candidate;
            }
        }

        return null;
    }

}
