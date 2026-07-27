<?php

namespace App\Notifications;

use App\Models\SolicitudTransporte;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DestinoAgregado extends Notification implements ShouldBroadcast, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public SolicitudTransporte $solicitud,
        public string $nombreDestino,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'destino_agregado',
            'titulo' => "Nuevo destino agregado — Ticket #{$this->solicitud->ticket}",
            'mensaje' => "Se agregó un nuevo destino a tu viaje en curso: {$this->nombreDestino}.",
            'solicitud_id' => $this->solicitud->id,
            'solicitud_codigo' => $this->solicitud->codigo,
            'ticket' => $this->solicitud->ticket,
            'nombre_destino' => $this->nombreDestino,
        ];
    }

    public function broadcastOn(): array
    {
        return [new \Illuminate\Broadcasting\PrivateChannel('motorista.'.$this->notifiable->id)];
    }

    public function broadcastType(): string
    {
        return 'notification.received';
    }
}
