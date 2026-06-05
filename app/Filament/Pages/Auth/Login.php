<?php

namespace App\Filament\Pages\Auth;

use App\Models\User;
use App\Services\LdapAuthenticator;
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
            ->label('Contraseña')
            ->hint(filament()->hasPasswordReset() ? new HtmlString(Blade::render('<x-filament::link :href="filament()->getRequestPasswordResetUrl()" tabindex="3" class="text-sm font-medium text-primary-600 hover:text-primary-500"> ¿Olvidaste tu contraseña? </x-filament::link>')) : null)
            ->password()
            ->revealable(filament()->arePasswordsRevealable())
            ->autocomplete('current-password')
            ->required()
            ->extraInputAttributes(['tabindex' => 2])
            ->placeholder('Ingresa tu contraseña')
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
        return 'Sistema de Gestión de Transporte Institucional';
    }

    protected function getFormActions(): array
    {
        return [
            $this->getAuthenticateFormAction()
                ->label('Iniciar Sesión')
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
        } elseif (env('LDAP_ENABLED', false)) {
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

        return app(LoginResponse::class);
    }

    protected function attemptLdapAndCreateUser(string $username, string $password): bool
    {
        if (! env('LDAP_ENABLED', false)) {
            return false;
        }

        $ldapAuth = app(LdapAuthenticator::class);

        if (! $ldapAuth->authenticate($username, $password)) {
            return false;
        }

        try {
            $connection = \LdapRecord\Container::get('default');
            $search = $connection->query()
                ->where('samaccountname', '=', $username)
                ->first();

            if (! $search) {
                return false;
            }

            $name = $search->getFirstAttribute('displayname')
                ?? $search->getFirstAttribute('cn')
                ?? $username;

            $email = $search->getFirstAttribute('mail')
                ?? "{$username}@asamblea.gob.sv";

            User::create([
                'username' => $username,
                'name' => $name,
                'email' => $email,
                'password' => Hash::make(Str::random(32)),
                'activo' => true,
            ]);

            return true;
        } catch (\Exception $e) {
            return false;
        }
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
