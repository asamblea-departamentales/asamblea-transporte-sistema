<?php

namespace App\Domain\Solicitudes\Services;

use LdapRecord\Connection;
use LdapRecord\Auth\BindException;

class LdapAuthenticator
{
    public function authenticate(string $username, string $password): bool
    {
        if (empty($username) || empty($password)) {
            return false;
        }

        try {

            $connection = new Connection([
                'hosts'    => [env('LDAP_HOSTS')],
                'base_dn'  => env('LDAP_BASE_DN'),
                'username' => env('LDAP_USERNAME'),
                'password' => env('LDAP_PASSWORD'),
                'port'     => env('LDAP_PORT', 389),
            ]);

            $connection->connect();

            return $connection->auth()->attempt(
                "ASAMBLEA\\{$username}",
                $password
            );

        } catch (BindException $e) {
            return false;
        }
    }
}