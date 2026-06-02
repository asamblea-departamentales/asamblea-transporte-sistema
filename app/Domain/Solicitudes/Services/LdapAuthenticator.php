<?php

namespace App\Domain\Solicitudes\Services;

use LdapRecord\Container;
use LdapRecord\Auth\BindException;

class LdapAuthenticator
{
    public function authenticate(string $username, string $password): bool
    {
        if (empty($username) || empty($password)) {
            return false;
        }

        try {
            $connection = Container::get('default');

            $success = $connection->auth()->attempt(
                "ASAMBLEA\\{$username}",
                $password
            );

            return $success;
        } catch (BindException $e) {
            return false;
        }
    }
}
