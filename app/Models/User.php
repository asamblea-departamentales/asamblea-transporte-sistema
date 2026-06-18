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
use App\Models\Motorista;
use App\Models\SolicitudTransporte;
use App\Models\SolicitudCombustible;
use App\Models\SolicitudMantenimiento;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
        'username',
        'email',
        'password',
        'unidad_solicitante_id',
        'activo',
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
        if (request()->routeIs('filament.admin.auth.logout')) {
            return true;
        }

        if ($this->hasAnyRole(['super_admin', 'superadmin'])) {
            return true;
        }

        if (app()->environment('local')) {
            return true;
        }

        return !$this->hasAnyRole(['motorista', 'solicitante']);
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

    //Relacion para motorista
    public function motorista()
    {
        return $this->hasOne(Motorista::class);
    }

    // Relaciones con solicitudes
    public function solicitudesTransporte()
    {
        return $this->hasMany(SolicitudTransporte::class, 'solicitante_id');
    }

    public function solicitudesCombustible()
    {
        return $this->hasMany(SolicitudCombustible::class, 'solicitante_id');
    }

    public function solicitudesMantenimiento()
    {
        return $this->hasMany(SolicitudMantenimiento::class, 'solicitante_id');
    }

    //Relacion con grupo de prioridades
    public function grupo(): BelongsTo
    {
        return $this->belongsTo(Grupo::class);
    }

    // -------------------------------------------------------
    // Helpers para lo de prioridades
    // -------------------------------------------------------
     public function getPriorityLabel(): string
    {
        return $this->grupo?->label() ?? 'Baja';
    }

    public function getPriorityColor(): string
    {
        return $this->grupo?->color() ?? 'gray';
    }

    public function getPriorityOrder(): int
    {
        return $this->grupo?->orden ?? 999;
    }

    public function getPriorityEnum()
    {
        return $this->grupo?->nivelEnum() ?? \App\Domain\Solicitudes\Enums\NivelPrioridadEnum::BAJA;
    }
}

