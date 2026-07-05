<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TipoLicencia extends Model
{
    protected $table = 'tipo_licencias';

    protected $fillable = ['nombre', 'activo'];

    protected $casts = ['activo' => 'boolean'];

    public function motoristas(): HasMany
    {
        return $this->hasMany(Motorista::class);
    }
}
