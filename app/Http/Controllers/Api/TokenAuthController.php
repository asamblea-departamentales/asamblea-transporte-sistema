<?php

// -----------------------------------------------------------------------------
// CONTROLADOR DE AUTENTICACIÓN POR TOKEN (API)
// -----------------------------------------------------------------------------
// Este controlador permite el inicio de sesión usando un "token" (una llave
// digital) en lugar de sesiones del navegador. Se usa para que aplicaciones
// externas, como una página web en Vercel, puedan conectarse al sistema.
// Al iniciar sesión devuelve un token que la aplicación debe guardar y
// enviar en cada petición para identificarse.

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TokenAuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (! Auth::attempt($credentials)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        $user = $request->user();

        //Solo borra tokens dentro de la misma app (ej: si tienes app móvil y web, no se matan entre sí)
        $user->tokens()->where('name', 'vercel')->delete();

        $token = $user->createToken('vercel')->plainTextToken;

        return response()->json([
            'message' => 'Login exitoso',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => method_exists($user, 'getRoleNames') ? $user->getRoleNames() : [],
            ],
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => method_exists($user, 'getRoleNames') ? $user->getRoleNames() : [],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->json(['message' => 'Logout exitoso']);
    }
}
