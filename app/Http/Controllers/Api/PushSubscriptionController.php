<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Motorista;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => 'required|string|max:500',
            'keys' => 'required|array',
            'keys.auth' => 'required|string',
            'keys.p256dh' => 'required|string',
        ]);

        $notifiable = $this->resolveNotifiable($request);

        if (! $notifiable) {
            return response()->json(['message' => 'No se encontró motorista asociado.'], 404);
        }

        $notifiable->updatePushSubscription(
            $validated['endpoint'],
            $validated['keys']['p256dh'],
            $validated['keys']['auth'],
        );

        return response()->json(['message' => 'Suscripción registrada correctamente.']);
    }

    public function destroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => 'required|string|max:500',
        ]);

        $notifiable = $this->resolveNotifiable($request);

        if (! $notifiable) {
            return response()->json(['message' => 'No se encontró motorista asociado.'], 404);
        }

        $notifiable->deletePushSubscription($validated['endpoint']);

        return response()->json(['message' => 'Suscripción eliminada correctamente.']);
    }

    public function publicKey(): JsonResponse
    {
        return response()->json([
            'public_key' => config('webpush.vapid.public_key'),
        ]);
    }

    private function resolveNotifiable(Request $request): User|Motorista|null
    {
        $esRutaMotorista = $request->routeIs(
            'api.motoristas.me.push-subscribe',
            'api.motoristas.me.push-unsubscribe',
        );

        return $esRutaMotorista ? $request->user()->motorista : $request->user();
    }
}
