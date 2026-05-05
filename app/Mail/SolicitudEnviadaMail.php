<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SolicitudEnviadaMail extends Mailable
{
    use Queueable, SerializesModels;

    public $subject;

    public $solicitud;

    public $tipo;

    public function __construct($tipo, $solicitud)
    {
        $this->tipo = $tipo;
        $this->solicitud = $solicitud;

        $this->subject = match ($tipo) {
            'transporte' => 'Solicitud de Transporte Enviada',
            'combustible' => 'Solicitud de Combustible Enviada',
            'mantenimiento' => 'Solicitud de Mantenimiento Enviada',
            default => 'Solicitud Enviada',
        };
    }

    public function build()
    {
        return $this->subject($this->subject)
            ->view('emails.solicitud_enviada')
            ->with([
                'tipo' => $this->tipo,
                's' => $this->solicitud,
            ]);
    }
}
