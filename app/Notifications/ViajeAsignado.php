<?php

namespace App\Notifications;

use App\Models\SolicitudTransporte;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class ViajeAsignado extends Notification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public SolicitudTransporte $solicitud,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', WebPushChannel::class];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'viaje_asignado',
            'titulo' => "Viaje asignado — Ticket #{$this->solicitud->ticket}",
            'mensaje' => "Se te asignó un viaje de {$this->solicitud->origen} a {$this->solicitud->destino}.",
            'solicitud_id' => $this->solicitud->id,
            'solicitud_codigo' => $this->solicitud->codigo,
            'ticket' => $this->solicitud->ticket,
        ];
    }

    public function toWebPush(object $notifiable, Notification $notification): WebPushMessage
    {
        $data = $notification->data;

        return (new WebPushMessage)
            ->title($data['titulo'])
            ->body($data['mensaje'])
            ->icon('/icons/icon-192x192.png')
            ->data(['url' => '/viajes']);
    }
}
