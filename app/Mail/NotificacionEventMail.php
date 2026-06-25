<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NotificacionEventMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $subject;
    public $payload;

    public function __construct($subject, $payload)
    {
        $this->subject = $subject;
        $this->payload = $payload;
    }

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

        // 🔥 LA VACUNA: Desactivamos esto porque causa el error de Undefined Method.
        // La vista Blade ya tiene un fallback inteligente usando asset() que cargará el logo perfectamente.
        // $this->embedLogo($mail);

        return $mail;
    }

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

    private function embedLogo($mail): void
    {
        // Función desactivada intencionalmente para evitar crashes.
    }

    public function emailImageSource(?string $url): ?string
    {
        if (empty($url)) {
            return null;
        }
        return $url;
    }
}
