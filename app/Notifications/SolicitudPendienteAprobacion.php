<?php

namespace App\Notifications;

use App\Domain\Solicitudes\Contracts\Workflowable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Notifications\Notification;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class SolicitudPendienteAprobacion extends Notification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Workflowable $solicitud,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', WebPushChannel::class];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => 'solicitud_pendiente_aprobacion',
            'titulo' => 'Nueva solicitud por aprobar',
            'mensaje' => "La solicitud {$this->solicitud->codigo} requiere aprobación.",
            'solicitud_id' => $this->solicitud->getKey(),
            'solicitud_codigo' => $this->solicitud->codigo,
            'ticket' => $this->solicitud->ticket ?? null,
            'modulo' => $this->modulo(),
            'url' => $this->url(),
        ];
    }

    public function toWebPush(object $notifiable, Notification $notification): WebPushMessage
    {
        $data = $this->toArray($notifiable);

        return (new WebPushMessage)
            ->title($data['titulo'])
            ->body($data['mensaje'])
            ->icon('/icons/icon-192x192.png')
            ->data(['url' => $data['url']]);
    }

    private function modulo(): string
    {
        return match ($this->solicitud->getEntidadTipo()) {
            'solicitud_combustible' => 'combustible',
            'solicitud_mantenimiento' => 'mantenimiento',
            default => 'transporte',
        };
    }

    private function url(): string
    {
        return match ($this->modulo()) {
            'combustible' => "/combustible/aprobaciones/{$this->solicitud->codigo}",
            'mantenimiento' => "/mantenimiento/aprobaciones/{$this->solicitud->codigo}",
            default => "/aprobaciones/{$this->solicitud->codigo}",
        };
    }
}
