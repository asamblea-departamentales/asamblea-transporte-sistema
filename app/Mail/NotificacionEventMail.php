<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class NotificacionEventMail extends Mailable
{
    public $subject;

    public $payload;

    public function __construct($subject, $payload)
    {
        $this->subject = $subject;
        $this->payload = $payload;
    }

    public function build()
    {
        $mapUrl = null;

        if (($this->payload['tipo'] ?? null) === 'transporte' && isset($this->payload['solicitud'])) {
            $mapService = app(\App\Domain\Solicitudes\Services\MapImageService::class);
            $mapUrl = $mapService->generateRouteImageUrl($this->payload['solicitud']);
        }

        $logoPath = public_path('images/logo-blanco-fondo-transparente.png');
        $logoSrc = null;
        if (file_exists($logoPath)) {
            $logoSrc = $this->embed($logoPath);
        }

        $mapFallbackPath = public_path('images/mapa-el-salvador.png');
        $mapFallbackSrc = null;
        if (! $mapUrl && file_exists($mapFallbackPath)) {
            $data = base64_encode(file_get_contents($mapFallbackPath));
            $mapFallbackSrc = 'data:image/png;base64,'.$data;
        }

        $evidenciaSrc = $this->resolveEvidenciaSrc($this->payload);

        $mail = $this->subject($this->subject)
            ->view('emails.notificacion_event')
            ->with([
                'payload' => $this->payload,
                'map_url' => $mapUrl,
                'map_fallback_src' => $mapFallbackSrc,
                'evidencia_src' => $evidenciaSrc,
                'subject' => $this->subject,
                'logoSrc' => $logoSrc,
            ]);

        $this->attachFilesFromPayload($this->payload, $mail);

        return $mail;
    }

    private function attachFilesFromPayload(array $payload, $mail): void
    {
        $attachments = $payload['attachments'] ?? [];
        if (empty($attachments)) {
            return;
        }

        foreach ($attachments as $file) {
            if (is_array($file)) {
                $path = $this->resolveAttachmentPath($file['path'] ?? '');
                $name = $file['name'] ?? null;
            } else {
                $path = $this->resolveAttachmentPath($file);
                $name = null;
            }
            if ($path && file_exists($path)) {
                $options = [];
                if ($name) {
                    $options['as'] = $name;
                }
                $mail->attach($path, $options);
            }
        }
    }

    private function resolveAttachmentPath($file): ?string
    {
        if (empty($file)) {
            return null;
        }

        $candidates = [
            storage_path('app/public/'.ltrim((string) $file, '/')),
            storage_path('app/'.ltrim((string) $file, '/')),
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

    private function resolveEvidenciaSrc(array $payload): ?string
    {
        $evidencia = $payload['evidencia'] ?? null;
        if (empty($evidencia)) {
            return null;
        }

        $path = $this->resolveAttachmentPath($evidencia['ruta'] ?? '');
        if (! $path) {
            return null;
        }

        $mime = mime_content_type($path);
        if (! $mime || ! str_starts_with($mime, 'image/')) {
            return null;
        }

        $body = file_get_contents($path);
        if ($body === false) {
            return null;
        }

        return 'data:'.$mime.';base64,'.base64_encode($body);
    }
}
