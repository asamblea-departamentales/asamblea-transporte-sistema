<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParametroSistema extends Model
{
    protected $table = 'parametros_sistema';

    protected $fillable = [
        'codigo', 'nombre', 'tipo',
        'valor', 'valor_default', 'data', 'es_sistema',
    ];

    protected $casts = ['es_sistema' => 'boolean'];

    public static function get(string $codigo, mixed $default = null): mixed
    {
        return static::where('codigo', $codigo)->value('valor') ?? $default;
    }

    public static function set(string $codigo, string $valor): void
    {
        static::where('codigo', $codigo)->update(['valor' => $valor]);
    }
}
