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
use App\Models\User;
use App\Domain\Solicitudes\Services\LdapAuthenticator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TokenAuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => ['required'],
            'password' => ['required'],
        ]);

        $username = $credentials['username'];
        $password = $credentials['password'];

        $user = User::where('username', $username)->first();

        if (! $user && env('LDAP_ENABLED', false)) {
            $user = $this->attemptLdapAndCreateUser($username, $password);
        }

        if (! $user) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        $isSuperAdmin = $user->hasRole('super_admin') || $user->hasRole('SuperAdmin');

        if ($isSuperAdmin) {
            if (! $user->password || ! Hash::check($password, $user->password)) {
                return response()->json(['message' => 'Credenciales inválidas'], 401);
            }
        } elseif (env('LDAP_ENABLED', false)) {
            $ldapAuth = app(LdapAuthenticator::class);
            if (! $ldapAuth->authenticate($username, $password)) {
                return response()->json(['message' => 'Credenciales inválidas'], 401);
            }
        } else {
            if (! $user->password || ! Hash::check($password, $user->password)) {
                return response()->json(['message' => 'Credenciales inválidas'], 401);
            }
        }

        $user->tokens()->where('name', 'vercel')->delete();

        $token = $user->createToken('vercel')->plainTextToken;

        return response()->json([
            'message' => 'Login exitoso',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'roles' => method_exists($user, 'getRoleNames') ? $user->getRoleNames() : [],
            ],
        ]);
    }

    protected function attemptLdapAndCreateUser(string $username, string $password): ?User
    {
        $ldapAuth = app(LdapAuthenticator::class);

        if (! $ldapAuth->authenticate($username, $password)) {
            return null;
        }

        try {
            $connection = \LdapRecord\Container::get('default');
            $search = $connection->query()
                ->where('samaccountname', '=', $username)
                ->first();

            if (! $search) {
                return null;
            }

            $name = $search->getFirstAttribute('displayname')
                ?? $search->getFirstAttribute('cn')
                ?? $username;

            $email = $search->getFirstAttribute('mail')
                ?? "{$username}@asamblea.gob.sv";

            return User::create([
                'username' => $username,
                'name' => $name,
                'email' => $email,
                'password' => Hash::make(Str::random(32)),
                'activo' => true,
            ]);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'username' => $user->username,
            'roles' => method_exists($user, 'getRoleNames') ? $user->getRoleNames() : [],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->json(['message' => 'Logout exitoso']);
    }
}
