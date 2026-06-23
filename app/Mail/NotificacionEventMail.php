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
     * Construye el mensaje: asigna la vista, pasa las variables,
     * adjunta archivos si los hay y embeble el logo institucional.
     */
    public function build()
    {
        $payload = $this->payload;

        // Genera la URL del mapa estático para solicitudes de transporte
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

        $this->embedLogo($mail);

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

    /**
     * Embeble el logo institucional en el cuerpo del correo usando
     * el método embed() de Laravel, lo que permite mostrar la imagen
     * sin necesidad de URLs externas.
     */
    private function embedLogo($mail): void
    {
        $logoPath = public_path('images/logo-blanco-fondo-transparente.png');
        if (file_exists($logoPath)) {
            $mail->with([
                'email_logo_embedded' => $mail->embed($logoPath),
            ]);
        }
    }

    /**
     * Devuelve una fuente de imagen para usar en el correo.
     * En entorno local usa una imagen embebida; en producción usa la URL real.
     *
     * NOTA: Actualmente este método no está siendo llamado desde la build().
     *       Se mantiene por compatibilidad con futuros usos.
     *
     * @param  string|null $url URL externa de la imagen
     * @return string|null      Ruta embebida o URL
     */
    public function emailImageSource(?string $url): ?string
    {
        if (empty($url)) {
            return null;
        }

        if (app()->environment('local')) {
            $mapFallback = public_path('images/mapa_correo.png');
            if (file_exists($mapFallback)) {
                return $mail->embed($mapFallback);
            }
            return null;
        }

        return $url;
    }
}
