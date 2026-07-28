<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

        $motorista = $request->user()->motorista;

        if (! $motorista) {
            return response()->json(['message' => 'No se encontró motorista asociado.'], 404);
        }

        $motorista->updatePushSubscription(
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

        $motorista = $request->user()->motorista;

        if (! $motorista) {
            return response()->json(['message' => 'No se encontró motorista asociado.'], 404);
        }

        $motorista->deletePushSubscription($validated['endpoint']);

        return response()->json(['message' => 'Suscripción eliminada correctamente.']);
    }

    public function publicKey(): JsonResponse
    {
        return response()->json([
            'public_key' => config('webpush.vapid.public_key'),
        ]);
    }
}
