<?php

namespace App\Http\Requests\Traits;

trait ValidaCancelacion
{
    public function reglasMotivoCancelacion(): array
    {
        return ['required', 'string', 'min:10', 'max:2000'];
    }
}
