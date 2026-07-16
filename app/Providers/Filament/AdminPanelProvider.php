<?php

namespace App\Providers\Filament;

use Alareqi\FilamentPwa\FilamentPwaPlugin;
use App\Filament\Pages\Dashboard;
use BezhanSalleh\FilamentShield\FilamentShieldPlugin;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\View\PanelsRenderHook;
use Filament\Widgets;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Blade;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->darkMode(false)

            // Marca y Logo
            ->brandLogo(asset('images/logo-azul-fondo-transparente.png'))
            ->brandLogoHeight('3rem')
            ->favicon(asset('images/logo-blanco-fondo-transparente.png'))

            ->login(\App\Filament\Pages\Auth\Login::class)

            // Registro de Plugins
            ->plugins([
                FilamentShieldPlugin::make()
                    ->gridColumns(['default' => 1, 'sm' => 2, 'lg' => 3])
                    ->sectionColumnSpan(1)
                    ->checkboxListColumns(['default' => 1, 'sm' => 2, 'lg' => 4])
                    ->resourceCheckboxListColumns(['default' => 1, 'sm' => 2]),

                FilamentPwaPlugin::make(),
            ]) // Cierra el array de plugins

            ->colors([
                'primary' => Color::Blue,
            ])

            // Definición de Grupos de Navegación
            ->navigationGroups([
                'Procesos',
                'Listado de Solicitudes',
                'Operatividad Diaria',
                'Gestión Operativa',
                'Operación',
                'Gestión',
                'Flota',
                'Gestión de Vehículos',
                'Reportes',
                'Catálogos',
                'Catálogos de Vehículos',
                'Catálogos Globales',
                'Auditoría',
                'Administración',
            ])

            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->discoverClusters(in: app_path('Filament/Clusters'), for: 'App\\Filament\\Clusters')
            ->pages([
                Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->widgets([
                \App\Filament\Widgets\SolicitudesPorPrioridadStats::class,
                // Widgets\AccountWidget::class,
            ])

            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ])

            ->renderHook(
                PanelsRenderHook::AUTH_LOGIN_FORM_AFTER,
                fn () => Blade::render('
                    <div class="text-center text-xs text-gray-500 mt-6">
                        <p>© {{ date("Y") }} Asamblea Legislativa de El Salvador.</p>
                        <p>Todos los derechos reservados.</p>
                    </div>
                '),
            )

            ->renderHook(
                PanelsRenderHook::HEAD_START,
                fn () => '
        <meta name="color-scheme" content="light">
        <style>
            :root { color-scheme: light !important; }
            html, body {
                background-color: #ffffff !important;
                color: #111827 !important;
            }
        </style>
    ',
            )

            ->renderHook(
                PanelsRenderHook::USER_MENU_BEFORE,
                fn () => \Illuminate\Support\Facades\Blade::render(<<<'BLADE'
                    @php
                        $manuales = [
                            ["label" => "Manual de Uso General",         "file" => "Manual_General_de_Uso.pdf"],
                            ["label" => "Manual del Rol Operativo",      "file" => "manual_rol_operativo.pdf"],
                            ["label" => "Manual del Rol Super Admin",    "file" => "manual_super_admin.html"],
                            ["label" => "Roles y Accesos",               "file" => "manual_roles_acceso.pdf"],
                        ];
                    @endphp

                    <x-filament::dropdown placement="bottom-end" teleport>
                        <x-slot name="trigger">
                            <button type="button" title="Manuales" class="shrink-0">
                                <x-filament::icon
                                    icon="heroicon-o-book-open"
                                    class="h-6 w-6 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                />
                            </button>
                        </x-slot>

                        <x-filament::dropdown.header>
                            Manuales
                        </x-filament::dropdown.header>

                        <x-filament::dropdown.list>
                            @foreach ($manuales as $manual)
                                <x-filament::dropdown.list.item
                                    tag="a"
                                    href="{{ asset('docs/' . $manual['file']) }}"
                                    target="_blank"
                                    icon="heroicon-m-document-arrow-down"
                                >
                                    {{ $manual['label'] }}
                                </x-filament::dropdown.list.item>
                            @endforeach
                        </x-filament::dropdown.list>
                    </x-filament::dropdown>
BLADE),
            );
    }
}
