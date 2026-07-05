<?php

namespace App\Domain\Solicitudes\Services;

use App\Mail\NotificacionEventMail;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Servicio centralizado para el envío de correos electrónicos de notificación
 * sobre eventos de solicitudes (transporte, combustible, mantenimiento).
 *
 * Ofrece métodos para enviar al solicitante, a jefatura, a un correo arbitrario,
 * y también para encolar en lugar de enviar en línea.
 */
class SolicitudEmailDispatchService
{
    public function __construct(
        protected SolicitudEmailPayloadService $payloadService
    ) {}

    /**
     * Envía un correo al solicitante de la solicitud.
     *
     * @param  object  $record  Modelo de la solicitud
     * @param  string  $tipo  'transporte', 'combustible' o 'mantenimiento'
     * @param  string  $evento  Evento ocurrido (ej. 'solicitud_aprobada')
     * @param  string|null  $mensaje  Mensaje personalizado (opcional)
     */
    public function toSolicitante($record, string $tipo, string $evento, ?string $mensaje = null, array $attachments = []): void
    {
        $email = $record->solicitante?->email;
        if (empty($email)) {
            Log::warning("Correo no enviado [{$tipo}/{$evento}]: solicitante #{$record->solicitante_id} sin email");

            return;
        }

        [$subject, $payload] = $this->messageFor($record, $tipo, $evento, $mensaje, false, $attachments);
        $this->send($subject, $payload, $email);
    }

    /**
     * Encola un correo al solicitante en lugar de enviarlo en línea.
     * Requiere un worker de colas configurado (QUEUE_CONNECTION).
     *
     * @param  object  $record  Modelo de la solicitud
     * @param  string  $tipo  'transporte', 'combustible' o 'mantenimiento'
     * @param  string  $evento  Evento ocurrido
     * @param  string|null  $mensaje  Mensaje personalizado (opcional)
     */
    public function queueToSolicitante($record, string $tipo, string $evento, ?string $mensaje = null, array $attachments = []): void
    {
        $email = $record->solicitante?->email;
        if (empty($email)) {
            return;
        }

        [$subject, $payload] = $this->messageFor($record, $tipo, $evento, $mensaje, false, $attachments);
        $this->queue($subject, $payload, $email);
    }

    /**
     * Envía un correo a todos los usuarios con el rol 'jefe'.
     *
     * @param  object  $record  Modelo de la solicitud
     * @param  string  $tipo  'transporte', 'combustible' o 'mantenimiento'
     * @param  string  $evento  Evento ocurrido
     * @param  string|null  $mensaje  Mensaje personalizado (opcional)
     */
    public function toJefatura($record, string $tipo, string $evento, ?string $mensaje = null, array $attachments = []): void
    {
        // Obtiene todos los usuarios con rol 'jefe' que tengan correo
        $emails = User::role('jefe')
            ->whereNotNull('email')
            ->pluck('email')
            ->filter()
            ->unique()
            ->toArray();

        if (empty($emails)) {
            return;
        }

        [$subject, $payload] = $this->messageFor($record, $tipo, $evento, $mensaje, true, $attachments);
        $this->send($subject, $payload, $emails);
    }

    /**
     * Envía un correo a todos los usuarios con el rol 'liquidador'.
     */
    public function toLiquidadores($record, string $tipo, string $evento, ?string $mensaje = null, array $attachments = []): void
    {
        $emails = User::role('liquidador')
            ->whereNotNull('email')
            ->pluck('email')
            ->filter()
            ->unique()
            ->toArray();

        if (empty($emails)) {
            return;
        }

        [$subject, $payload] = $this->messageFor($record, $tipo, $evento, $mensaje, true, $attachments);
        $this->send($subject, $payload, $emails);
    }

    /**
     * Envía un correo a una o varias direcciones electrónicas específicas.
     *
     * @param  object  $record  Modelo de la solicitud
     * @param  string  $tipo  'transporte', 'combustible' o 'mantenimiento'
     * @param  string  $evento  Evento ocurrido
     * @param  string|array  $email  Dirección o arreglo de direcciones de correo
     * @param  string|null  $mensaje  Mensaje personalizado (opcional)
     */
    public function toEmail($record, string $tipo, string $evento, string|array $email, ?string $mensaje = null, array $attachments = []): void
    {
        [$subject, $payload] = $this->messageFor($record, $tipo, $evento, $mensaje, true, $attachments);
        $this->send($subject, $payload, $email);
    }

    private function messageFor($record, string $tipo, string $evento, ?string $mensaje, bool $mostrarSolicitante, array $attachments): array
    {
        $payload = $this->payloadService->build($record, $tipo, $evento, $mensaje);
        $payload['mostrar_solicitante'] = $mostrarSolicitante;

        if (! empty($attachments)) {
            $payload['attachments'] = $attachments;
        }

        return [$this->payloadService->subjectFor($tipo, $evento), $payload];
    }

    /**
     * Envía un correo usando un payload ya construido (sin pasar por el PayloadService).
     * Útil para casos donde el payload ya fue armado externamente.
     *
     * @param  string  $subject  Asunto del correo
     * @param  array  $payload  Datos estructurados para la vista
     * @param  string|array  $email  Dirección o arreglo de direcciones
     */
    public function withPayload(string $subject, array $payload, string|array $email): void
    {
        $this->send($subject, $payload, $email);
    }

    /**
     * Encola un correo con payload ya construido (versión async de withPayload).
     *
     * @param  string  $subject  Asunto del correo
     * @param  array  $payload  Datos estructurados para la vista
     * @param  string|array  $email  Dirección o arreglo de direcciones
     */
    public function queueWithPayload(string $subject, array $payload, string|array $email): void
    {
        $this->queue($subject, $payload, $email);
    }

    /**
     * Envía el correo de forma síncrona usando el Mailable NotificacionEventMail.
     */
    private function send(string $subject, array $payload, string|array $email): void
    {
        try {
            Mail::to($email)->send(
                new NotificacionEventMail($subject, $payload)
            );
        } catch (\Exception $e) {
            Log::error("Error enviando correo [{$payload['tipo']}/{$payload['evento']}]: ".$e->getMessage());
        }
    }

    /**
     * Encola el correo para ser enviado por el worker de colas.
     */
    private function queue(string $subject, array $payload, string|array $email): void
    {
        try {
            Mail::to($email)->queue(
                new NotificacionEventMail($subject, $payload)
            );
        } catch (\Exception $e) {
            Log::error("Error encolando correo [{$payload['tipo']}/{$payload['evento']}]: ".$e->getMessage());
        }
    }
}
