<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceso denegado</title>
    <link rel="icon" href="{{ asset('images/logo-blanco-fondo-transparente.png') }}">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex; justify-content: center; align-items: center;
            min-height: 100vh; background: #f3f4f6;
        }
        .card {
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            padding: 2.5rem 2rem 2rem;
            max-width: 400px; width: 90%;
            text-align: center;
        }
        .logo-wrap { margin-bottom: 1.75rem; }
        .logo-wrap img { height: 40px; }
        .code-block {
            display: flex; align-items: center; justify-content: center;
            gap: 1rem; margin-bottom: 1.5rem;
        }
        .code-num { font-size: 3.5rem; font-weight: 600; color: #dc2626; line-height: 1; }
        .divider-v { width: 1px; height: 48px; background: #e5e7eb; }
        .code-label { text-align: left; }
        .code-label p:first-child { font-size: 14px; font-weight: 500; color: #111827; }
        .code-label p:last-child { font-size: 12px; color: #6b7280; margin-top: 2px; }
        .message { font-size: 14px; color: #6b7280; line-height: 1.6; margin-bottom: 1.75rem; padding: 0 0.5rem; }
        .actions { display: flex; flex-direction: column; gap: 10px; }
        .actions form { width: 100%; }
        .btn {
            display: flex; align-items: center; justify-content: center;
            gap: 8px; padding: 0.65rem 1.25rem;
            border-radius: 8px; font-size: 14px; font-weight: 500;
            text-decoration: none; border: none; cursor: pointer;
            transition: background .2s, color .2s;
            width: 100%;
        }
        .btn-primary { background: #1d4ed8; color: #fff; }
        .btn-primary:hover { background: #1e40af; }
        .btn-ghost { background: transparent; color: #6b7280; border: 1px solid #d1d5db; }
        .btn-ghost:hover { background: #f9fafb; }
        .footer {
            margin-top: 1.75rem; padding-top: 1.25rem;
            border-top: 1px solid #f3f4f6;
            font-size: 11px; color: #9ca3af;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="logo-wrap">
            <img src="{{ asset('images/logo-azul-fondo-transparente.png') }}" alt="Logo">
        </div>

        <div class="code-block">
            <span class="code-num">403</span>
            <div class="divider-v"></div>
            <div class="code-label">
                <p>Acceso denegado</p>
                <p>Sin permiso para esta sección</p>
            </div>
        </div>

        @php
            $user = auth()->user();
            $isMotorista = $user?->hasRole('motorista');
            $isSolicitante = $user?->hasRole('solicitante');
            $sinRoles = $user && $user->roles->isEmpty();
        @endphp

        @if ($isMotorista)
            <p class="message">No podés acceder al panel de gestión.<br>Ingresa a la aplicación de motoristas para continuar.</p>
            <div class="actions">
                <a href="https://asamble-transporte-motorista.vercel.app/login" class="btn btn-primary">
                    <i class="ti ti-steering-wheel"></i>
                    Ir a App Motoristas
                </a>
                <form method="POST" action="{{ route('filament.admin.auth.logout') }}">
                    @csrf
                    <button type="submit" class="btn btn-ghost">
                        <i class="ti ti-arrow-left"></i>
                        Regresar al inicio de sesión
                    </button>
                </form>
            </div>
        @elseif ($isSolicitante)
            <p class="message">No podés acceder al panel de gestión.<br>Ingresa a la aplicación de solicitudes de transporte para continuar.</p>
            <div class="actions">
                <a href="https://asamblea-transporte.vercel.app/login" class="btn btn-primary">
                    <i class="ti ti-bus"></i>
                    Ir a Solicitudes de Transporte
                </a>
                <form method="POST" action="{{ route('filament.admin.auth.logout') }}">
                    @csrf
                    <button type="submit" class="btn btn-ghost">
                        <i class="ti ti-arrow-left"></i>
                        Regresar al inicio de sesión
                    </button>
                </form>
            </div>
        @elseif ($sinRoles)
            <p class="message">No poseés roles asignados.<br>Contactá a tu administrador para que te asigne los permisos necesarios.</p>
            <div class="actions">
                <form method="POST" action="{{ route('filament.admin.auth.logout') }}">
                    @csrf
                    <button type="submit" class="btn btn-ghost">
                        <i class="ti ti-arrow-left"></i>
                        Regresar al inicio de sesión
                    </button>
                </form>
            </div>
        @else
            <p class="message">No podés acceder al panel de gestión con esta cuenta.</p>
            <div class="actions">
                <form method="POST" action="{{ route('filament.admin.auth.logout') }}">
                    @csrf
                    <button type="submit" class="btn btn-ghost">
                        <i class="ti ti-arrow-left"></i>
                        Regresar al inicio de sesión
                    </button>
                </form>
            </div>
        @endif

        <div class="footer">Asamblea Legislativa de El Salvador</div>
    </div>
</body>
</html>
