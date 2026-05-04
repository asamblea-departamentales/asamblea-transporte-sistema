<?php

// Creado para fusion API y FRONTEND

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // Verificar si el usuario ya tiene una sesión activa
        $user = \App\Models\User::where('email', $credentials['email'])->first();

        if ($user && UserSession::where('user_id', $user->id)->exists()) {
            return response()->json([
                'message' => 'Sesión activa en otro dispositivo',
            ], 409);
        }

        if (! Auth::attempt($credentials)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        $request->session()->regenerate();

        // Registrar la nueva sesión
        UserSession::create([
            'user_id' => $user->id,
            'session_id' => $request->session()->getId(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'last_activity' => now(),
        ]);

        return response()->json([
            'message' => 'Login exitoso',
            'user' => $this->userPayload(Auth::user()),
        ]);
    }

    public function logout(Request $request)
    {
        $sessionId = $request->session()->getId();

        // Eliminar el registro de sesión
        UserSession::where('session_id', $sessionId)->delete();

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logout exitoso']);
    }

    public function user(Request $request)
    {
        return response()->json($this->userPayload($request->user()));
    }

    private function userPayload($user): array
    {
        if (! $user) {
            return [];
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => method_exists($user, 'getRoleNames') ? $user->getRoleNames() : [],
        ];
    }
}
