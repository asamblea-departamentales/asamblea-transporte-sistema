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
     * Build the message.
     */
    public function build()
    {
        return $this->subject($this->subject)
                    ->view('emails.notificacion_event')
                    ->with([
                        'subject' => $this->subject,
                        'payload' => $this->payload,
                    ]);
    }
}
