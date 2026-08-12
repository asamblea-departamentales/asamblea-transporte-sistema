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

class SolicitudEstadoActualizada extends Notification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Workflowable $solicitud,
        public string $tipo,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', WebPushChannel::class];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'tipo' => $this->tipo,
            'titulo' => $this->titulo(),
            'mensaje' => $this->mensaje(),
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

    private function titulo(): string
    {
        return [
            'aprobada' => 'Solicitud aprobada',
            'pre_aprobada' => 'Solicitud pre-aprobada',
            'asignada' => 'Solicitud asignada',
            'programada' => 'Solicitud programada',
            'rechazada' => 'Solicitud rechazada',
            'observada' => 'Solicitud con observaciones',
            'en_revision' => 'Solicitud en revisión',
            'finalizada' => 'Solicitud finalizada',
            'cancelada' => 'Solicitud cancelada',
        ][$this->tipo] ?? 'Actualización de tu solicitud';
    }

    private function mensaje(): string
    {
        $verbo = [
            'aprobada' => 'aprobada',
            'pre_aprobada' => 'pre-aprobada',
            'asignada' => 'asignada',
            'programada' => 'programada',
            'rechazada' => 'rechazada',
            'observada' => 'marcada con observaciones',
            'en_revision' => 'puesta en revisión',
            'finalizada' => 'finalizada',
            'cancelada' => 'cancelada',
        ][$this->tipo] ?? 'actualizada';

        return "Tu solicitud {$this->solicitud->codigo} fue {$verbo}.";
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
            'combustible' => "/solicitudes-combustible/{$this->solicitud->getKey()}",
            'mantenimiento' => "/solicitudes-mantenimiento/{$this->solicitud->getKey()}",
            default => "/solicitudes-transporte/{$this->solicitud->getKey()}",
        };
    }
}
