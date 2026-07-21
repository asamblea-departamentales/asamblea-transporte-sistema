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

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Services\AuditoriaService;
use App\Domain\Solicitudes\Services\LdapAuthenticator;
use App\Http\Controllers\Controller;
use App\Http\Requests\TokenLoginRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TokenAuthController extends Controller
{
    public function login(TokenLoginRequest $request)
    {
        $credentials = $request->validated();

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

        app(AuditoriaService::class)->registrar(
            AccionBitacoraEnum::LOGIN,
            'users',
            $user->id,
            ['via' => 'token'],
        );

        return response()->json([
            'message' => 'Login exitoso',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'roles' => method_exists($user, 'getRoleNames') ? $user->getRoleNames() : [],
                'permissions' => method_exists($user, 'getAllPermissions') ? $user->getAllPermissions()->pluck('name') : [],
                'unidad' => $user->unidadSolicitante ? [
                    'id' => $user->unidadSolicitante->id,
                    'nombre' => $user->unidadSolicitante->nombre,
                    'transporte' => (bool) $user->unidadSolicitante->puede_solicitar_transporte,
                    'mantenimiento' => (bool) $user->unidadSolicitante->puede_solicitar_mantenimiento,
                    'combustible' => (bool) $user->unidadSolicitante->puede_solicitar_combustible,
                ] : null,
            ],
        ]);
    }

    protected function attemptLdapAndCreateUser(string $username, string $password): ?User
    {
        $ldapAuth = app(LdapAuthenticator::class);

        if (! $ldapAuth->authenticate($username, $password)) {
            return null;
        }

        $ldapUser = $ldapAuth->findUser($username);

        if (! $ldapUser) {
            return null;
        }

        $user = User::create([
            'username' => $username,
            'name' => $ldapUser['name'],
            'email' => $ldapUser['email'],
            'password' => Hash::make(Str::random(32)),
            'activo' => true,
        ]);

        $user->assignRole('solicitante');

        return $user;
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
            'permissions' => method_exists($user, 'getAllPermissions') ? $user->getAllPermissions()->pluck('name') : [],
            'unidad' => $user->unidadSolicitante ? [
                'id' => $user->unidadSolicitante->id,
                'nombre' => $user->unidadSolicitante->nombre,
                'transporte' => (bool) $user->unidadSolicitante->puede_solicitar_transporte,
                'mantenimiento' => (bool) $user->unidadSolicitante->puede_solicitar_mantenimiento,
                'combustible' => (bool) $user->unidadSolicitante->puede_solicitar_combustible,
            ] : null,
        ]);
    }

    public function logout(Request $request)
    {
        app(AuditoriaService::class)->registrar(
            AccionBitacoraEnum::LOGOUT,
            'users',
            $request->user()->id,
            ['via' => 'token'],
        );

        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logout exitoso']);
    }
}
