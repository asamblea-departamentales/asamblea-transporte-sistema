<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificacionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = max(1, min($request->integer('per_page', 20), 20));

        $notificaciones = $request->user()->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($notificaciones);
    }

    public function marcarLeer(Request $request, DatabaseNotification $notification): JsonResponse
    {
        $user = $request->user();

        if ($notification->notifiable_id !== $user->id || $notification->notifiable_type !== User::class) {
            return response()->json(['message' => 'Notificación no encontrada.'], 404);
        }

        $notification->markAsRead();

        return response()->json(['message' => 'Notificación marcada como leída.']);
    }

    public function marcarTodasLeer(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'Todas las notificaciones marcadas como leídas.']);
    }
}
