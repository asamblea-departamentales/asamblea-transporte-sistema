<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NotificacionEventMail extends Mailable
{
    use Queueable, SerializesModels;

    public $subject;
    public $payload;

    /**
     * Create a new message instance.
     */
    public function __construct($subject, $payload)
    {
        $this->subject = $subject;
        $this->payload = $payload;
    }

    /**
     * Build the message. Cambios Henry
     */
    public function build()
    {
        $payload = $this->payload;

        $mapUrl = null;

        if (($payload['tipo'] ?? null) === 'transporte' && isset($payload['solicitud'])) {
            $mapService = app(\App\Domain\Solicitudes\Services\MapImageService::class);
            $mapUrl = $mapService->generateRouteImageUrl($payload['solicitud']);
        }

        return $this->subject($this->subject)
            ->view('emails.notificacion_event')
            ->with([
                'payload' => $payload,   // sin tocar
                'map_url' => $mapUrl,    // URL aparte
                'subject' => $this->subject,
            ]);
    } 

}
