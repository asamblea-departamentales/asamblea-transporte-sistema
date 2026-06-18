<?php

namespace App\Domain\Solicitudes\Services;

use Illuminate\Support\Facades\Log;
use LdapRecord\Auth\BindException;
use LdapRecord\Connection;
use Throwable;

class LdapAuthenticator
{
    protected function connection(): Connection
    {
        return new Connection([
            'hosts' => array_map('trim', explode(',', env('LDAP_HOSTS', ''))),
            'base_dn' => env('LDAP_BASE_DN'),
            'username' => env('LDAP_USERNAME'),
            'password' => env('LDAP_PASSWORD'),
            'port' => (int) env('LDAP_PORT', 389),
            'version' => 3,
            'timeout' => 5,
            'follow_referrals' => false,
        ]);
    }

    public function authenticate(string $username, string $password): bool
    {
        if (empty($username) || empty($password)) {
            return false;
        }

        try {
            $connection = $this->connection();

            $connection->connect();

            return $connection->auth()->attempt(
                "ASAMBLEA\\{$username}",
                $password
            );
        } catch (BindException $e) {
            Log::warning('LDAP credenciales invalidas', [
                'user' => $username,
                'error' => $e->getMessage(),
            ]);

            return false;
        } catch (Throwable $e) {
            Log::error('LDAP error general', [
                'user' => $username,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    public function findUser(string $username): ?array
    {
        try {
            $connection = $this->connection();

            $connection->connect();

            $user = $connection->query()
                ->where('samaccountname', '=', $username)
                ->first();

            if (! $user || ! is_array($user)) {
                return null;
            }

            $name = $this->getLdapAttribute($user, 'displayname')
                ?? $this->getLdapAttribute($user, 'cn')
                ?? $username;

            $email = $this->getLdapAttribute($user, 'mail')
                ?? "{$username}@asamblea.gob.sv";

            return [
                'username' => $username,
                'name' => $name,
                'email' => $email,
            ];
        } catch (Throwable $e) {
            Log::error('LDAP busqueda de usuario fallo', [
                'user' => $username,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    private function getLdapAttribute(array $entry, string $attribute): ?string
    {
        $attribute = strtolower($attribute);

        if (! array_key_exists($attribute, $entry)) {
            return null;
        }

        $value = $entry[$attribute];

        if (is_array($value)) {
            return $value[0] ?? null;
        }

        return $value ?: null;
    }
}
