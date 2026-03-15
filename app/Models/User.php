<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Testing\Fluent\Concerns\Has;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'unidad_solicitante_id',
        'activo', //Agregado para el campo 'activo'
        'departamental_id',

    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Control de acceso a Filament.
     * 
     */
    public function canAccessPanel(Panel $panel): bool
    {
        //Permite el acceso si estamos en local
        if (app()->environment('local')) {
            return true;
        }
        return $this->hasAnyRole(['jefe', 'admin', 'ti', 'superadmin', 'operativo', 'liquidador']);
    }

    //Relaciones
    public function unidadSolicitante()
    {
        return $this->belongsTo(UnidadSolicitante::class, 'unidad_solicitante_id');
    }

    public function departamental()
    {
        return $this->belongsTo(Departamental::class, 'departamental_id');
    }

}
