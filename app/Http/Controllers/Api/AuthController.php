<?php

// -----------------------------------------------------------------------------
// CONTROLADOR DE INICIO DE SESIÓN (AUTENTICACIÓN)
// -----------------------------------------------------------------------------
// Este controlador maneja el inicio y cierre de sesión de los usuarios.
// Verifica que el correo y la contraseña sean correctos, revisa que no haya
// una sesión activa en otro dispositivo, y registra la sesión en el sistema.
// También permite consultar los datos del usuario que inició sesión.

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (! Auth::validate($credentials)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        $user = \App\Models\User::where('email', $credentials['email'])->first();

        if (! $user) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        // Atomic check-then-create with row lock to prevent race condition
        try {
            DB::transaction(function () use ($user, $request) {
                $existing = UserSession::where('user_id', $user->id)->lockForUpdate()->first();

                if ($existing) {
                    throw new \DomainException('Sesión activa en otro dispositivo');
                }

                UserSession::create([
                    'user_id' => $user->id,
                    'session_id' => $request->session()->getId(),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'last_activity' => now(),
                ]);
            });
        } catch (\DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }

        Auth::attempt($credentials);
        $request->session()->regenerate();

        UserSession::where('user_id', $user->id)->update([
            'session_id' => $request->session()->getId(),
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
