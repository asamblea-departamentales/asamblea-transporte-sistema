<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TokenLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => ['required'],
            'password' => ['required'],
        ];
    }
}
