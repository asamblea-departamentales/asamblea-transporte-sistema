<?php

namespace App\Filament\Pages\Auth;

use App\Domain\Solicitudes\Services\LdapAuthenticator;
use App\Models\User;
use Filament\Forms\Components\Component;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Http\Responses\Auth\Contracts\LoginResponse;
use Filament\Pages\Auth\Login as BaseLogin;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\HtmlString;
use Illuminate\Support\Str;

class Login extends BaseLogin
{
    public function form(Form $form): Form
    {
        return $form
            ->schema([
                $this->getEmailFormComponent(),
                $this->getPasswordFormComponent(),
                $this->getRememberFormComponent(),
            ])
            ->statePath('data');
    }

    protected function getEmailFormComponent(): Component
    {
        return TextInput::make('username')
            ->label('Nombre de Usuario')
            ->required()
            ->autocomplete()
            ->autofocus()
            ->extraInputAttributes(['tabindex' => 1])
            ->placeholder('nombre de usuario')
            ->prefixIcon('heroicon-o-user')
            ->maxLength(255);
    }

    protected function getPasswordFormComponent(): Component
    {
        return TextInput::make('password')
            ->label('Contrasena')
            ->hint(filament()->hasPasswordReset() ? new HtmlString(Blade::render('<x-filament::link :href="filament()->getRequestPasswordResetUrl()" tabindex="3" class="text-sm font-medium text-primary-600 hover:text-primary-500"> Olvidaste tu contrasena? </x-filament::link>')) : null)
            ->password()
            ->revealable(filament()->arePasswordsRevealable())
            ->autocomplete('current-password')
            ->required()
            ->extraInputAttributes(['tabindex' => 2])
            ->placeholder('Ingresa tu contrasena')
            ->prefixIcon('heroicon-o-lock-closed')
            ->maxLength(255);
    }

    protected function getRememberFormComponent(): Component
    {
        return parent::getRememberFormComponent()
            ->label('Recordarme');
    }

    public function getTitle(): string
    {
        return 'Acceso al Sistema - Asamblea Legislativa';
    }

    public function getHeading(): string
    {
        return 'Bienvenido';
    }

    public function getSubHeading(): string
    {
        return 'Sistema de Gestion de Transporte Institucional';
    }

    protected function getFormActions(): array
    {
        return [
            $this->getAuthenticateFormAction()
                ->label('Iniciar Sesion')
                ->color('primary'),
        ];
    }

    public function authenticate(): ?LoginResponse
    {
        $data = $this->form->getState();
        $username = $data['username'];
        $password = $data['password'];

        $user = User::where('username', $username)->first();

        if (! $user) {
            if ($this->attemptLdapAndCreateUser($username, $password)) {
                $user = User::where('username', $username)->first();
            }
        }

        if (! $user) {
            $this->throwFailureValidationException();
        }

        $isSuperAdmin = $user->hasRole('super_admin') || $user->hasRole('SuperAdmin');

        if ($isSuperAdmin) {
            if (! $user->password || ! Hash::check($password, $user->password)) {
                $this->throwFailureValidationException();
            }
        } elseif (filter_var(env('LDAP_ENABLED', false), FILTER_VALIDATE_BOOLEAN)) {
            $ldapAuth = app(LdapAuthenticator::class);

            if (! $ldapAuth->authenticate($username, $password)) {
                $this->throwFailureValidationException();
            }
        } else {
            if (! $user->password || ! Hash::check($password, $user->password)) {
                $this->throwFailureValidationException();
            }
        }

        Auth::login($user, $data['remember'] ?? false);

        if (! $user->canAccessPanel(filament()->getCurrentPanel())) {
            Auth::logout();
            request()->session()->invalidate();
            request()->session()->regenerateToken();
            abort(403);
        }

        return app(LoginResponse::class);
    }

    protected function attemptLdapAndCreateUser(string $username, string $password): bool
    {
        if (! filter_var(env('LDAP_ENABLED', false), FILTER_VALIDATE_BOOLEAN)) {
            return false;
        }

        $ldapAuth = app(LdapAuthenticator::class);

        if (! $ldapAuth->authenticate($username, $password)) {
            return false;
        }

        $ldapUser = $ldapAuth->findUser($username);

        if (! $ldapUser) {
            return false;
        }

        $user = User::create([
            'username' => $username,
            'name' => $ldapUser['name'],
            'email' => $ldapUser['email'],
            'password' => Hash::make(Str::random(32)),
            'activo' => true,
        ]);

        $user->assignRole('solicitante');

        return true;
    }

    protected function getCredentialsFromFormData(array $data): array
    {
        return [
            'username' => $data['username'],
            'password' => $data['password'],
        ];
    }

    protected function hasFullWidthFormActions(): bool
    {
        return true;
    }
}
