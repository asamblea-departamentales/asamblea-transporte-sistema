<?php

namespace App\Providers\Filament;

use BezhanSalleh\FilamentShield\FilamentShieldPlugin;
use Illuminate\Support\Facades\Blade;
use Filament\View\PanelsRenderHook;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages;
use App\Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Widgets;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;
use Alareqi\FilamentPwa\FilamentPwaPlugin;
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
                    ->gridColumns([ 'default' => 1, 'sm' => 2, 'lg' => 3 ])
                    ->sectionColumnSpan(1)
                    ->checkboxListColumns([ 'default' => 1, 'sm' => 2, 'lg' => 4 ])
                    ->resourceCheckboxListColumns([ 'default' => 1, 'sm' => 2 ]),

                FilamentPwaPlugin::make(),
            ]) //Cierra el array de plugins

            ->colors([
                'primary' => Color::Blue,
            ])

            // Definición de Grupos de Navegación
            ->navigationGroups([
                'Administracion',
                'Transporte',
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
                //Widgets\AccountWidget::class,
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
                PanelsRenderHook::SIDEBAR_NAV_END,
                fn () => \Illuminate\Support\Facades\Blade::render('
                    @php
                        $manuales = [
                            ["label" => "Manual General de Uso",         "file" => "manual_General_De_Uso.pdf"],
                            ["label" => "Manual Operativo",         "file" => "manual_operativo.pdf"],
                            ["label" => "Manual del Motorista",     "file" => "manual_motorista.pdf"],
                            ["label" => "Roles y Accesos",          "file" => "manual_roles.pdf"],
                        ];
                    @endphp

                    <ul class="fi-sidebar-nav-groups -mx-2 flex flex-col gap-y-7">
                    <li
                        x-data="{ open: false }"
                        data-group-label="Manuales"
                        class="fi-sidebar-group flex flex-col gap-y-1"
                    >
                        <div
                            @click="open = !open"
                            class="fi-sidebar-group-button flex items-center gap-x-3 px-2 py-2 cursor-pointer"
                        >
                            <svg class="fi-sidebar-group-icon h-6 w-6 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                            </svg>
                            <span class="fi-sidebar-group-label flex-1 text-sm font-medium leading-6 text-gray-500 dark:text-gray-400">
                                Manuales
                            </span>
                            <svg class="fi-sidebar-group-collapse-button h-5 w-5 text-gray-400 transition-transform duration-200" :class="{ \'-rotate-180\': !open }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M14.78 5.22a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06L10 9.19l3.72-3.72a.75.75 0 011.06 0z" clip-rule="evenodd"/>
                            </svg>
                        </div>

                        <ul
                            x-show="open"
                            x-collapse.duration.200ms
                            class="fi-sidebar-group-items flex flex-col gap-y-1"
                        >
                            @foreach ($manuales as $m)
                                <li class="fi-sidebar-item">
                                    <a
                                        href="{{ asset("docs/{$m["file"]}") }}"
                                        target="_blank"
                                        class="fi-sidebar-item-button relative flex items-center justify-center gap-x-3 rounded-lg px-2 py-2 outline-none transition duration-75 hover:bg-gray-100 focus-visible:bg-gray-100 dark:hover:bg-white/5 dark:focus-visible:bg-white/5"
                                    >
                                        <span class="fi-sidebar-item-label flex-1 truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                                            {{ $m["label"] }}
                                        </span>
                                        <svg class="h-4 w-4 text-gray-400 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                        </svg>
                                    </a>
                                </li>
                            @endforeach
                        </ul>
                    </li>
                    </ul>
                '),
            );
    }
}