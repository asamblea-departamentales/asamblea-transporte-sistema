<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Motorista;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Auth;

class MotoristaNotificacionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $motorista = Auth::user()->motorista;

        if (! $motorista) {
            return response()->json(['message' => 'No se encontró motorista asociado.'], 404);
        }

        $perPage = max(1, min($request->integer('per_page', 20), 20));

        $notificaciones = $motorista->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($notificaciones);
    }

    public function marcarLeer(DatabaseNotification $notification): JsonResponse
    {
        $motorista = Auth::user()->motorista;

        if (! $motorista
            || $notification->notifiable_id !== $motorista->id
            || $notification->notifiable_type !== Motorista::class) {
            return response()->json(['message' => 'Notificación no encontrada.'], 404);
        }

        $notification->markAsRead();

        return response()->json(['message' => 'Notificación marcada como leída.']);
    }

    public function marcarTodasLeer(): JsonResponse
    {
        $motorista = Auth::user()->motorista;

        if (! $motorista) {
            return response()->json(['message' => 'No se encontró motorista asociado.'], 404);
        }

        $motorista->unreadNotifications->markAsRead();

        return response()->json(['message' => 'Todas las notificaciones marcadas como leídas.']);
    }
}
