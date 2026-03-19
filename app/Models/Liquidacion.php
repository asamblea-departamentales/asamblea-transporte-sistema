<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Liquidacion extends Model
{
    protected $table = 'liquidaciones';

    protected $fillable = [
        'liquidable_id',
        'liquidable_type',
        'user_id',
        'monto_solicitado',
        'monto_validado',
        'resultado',
        'observaciones',
        'fecha_liquidacion',
    ];

    protected $casts = [
        'monto_solicitado'  => 'decimal:2',
        'monto_validado'    => 'decimal:2',
        'fecha_liquidacion' => 'datetime',
    ];

    public function liquidable(): MorphTo
    {
        return $this->morphTo();
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}