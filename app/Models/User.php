<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Domain\Solicitudes\Enums\NivelPrioridadEnum;
use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use NotificationChannels\WebPush\HasPushSubscriptions;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasPushSubscriptions, HasRoles, Notifiable;

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
        'debe_cambiar_password',
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
            'debe_cambiar_password' => 'boolean',
        ];
    }

    /**
     * Control de acceso a Filament.
     */
    public function canAccessPanel(Panel $panel): bool
    {
        if (request()->routeIs('filament.admin.auth.logout')) {
            return true;
        }

        if (app()->environment('local')) {
            return true;
        }

        if (! $this->activo) {
            return false;
        }

        return $this->hasAnyRole([
            'super_admin',
            'superadmin',
            'admin',
            'jefe',
            'operativo',
        ]);
    }

    // Relaciones
    public function unidadSolicitante()
    {
        return $this->belongsTo(UnidadSolicitante::class, 'unidad_solicitante_id');
    }

    public function departamental()
    {
        return $this->belongsTo(Departamental::class, 'departamental_id');
    }

    // Relacion para motorista
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

    // Relacion con grupo de prioridades
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
        return $this->grupo?->nivelEnum() ?? NivelPrioridadEnum::BAJA;
    }
}
