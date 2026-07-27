<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('motorista.{id}', function ($user, $id) {
    $motorista = $user->motorista;

    return $motorista && $motorista->id === (int) $id;
});
