<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class BitacoraEvento extends Model
{
    protected $fillable = [
        'entidad_tipo',
        'entidad_id',
        'accion',
        'user_id',
        'datos_extras',
    ];

    protected $casts = [
        'datos_extras' => 'array',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
