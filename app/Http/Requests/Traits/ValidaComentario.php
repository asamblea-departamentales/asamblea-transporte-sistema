<?php

namespace App\Http\Requests\Traits;

trait ValidaComentario
{
    public function reglasComentario(): array
    {
        return ['required', 'string', 'max:2000'];
    }
}
