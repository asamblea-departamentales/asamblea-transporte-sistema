<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceso denegado</title>
    <link rel="icon" href="{{ asset('images/logo-blanco-fondo-transparente.png') }}">
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f3f4f6; }
        .card { text-align: center; padding: 3rem 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,.1); max-width: 420px; width: 90%; }
        .logo { height: 48px; margin-bottom: 1.5rem; }
        h1 { font-size: 4rem; margin: 0; color: #dc2626; font-weight: 800; line-height: 1; }
        p { color: #6b7280; margin: 1rem 0 1.5rem; font-size: 1rem; line-height: 1.5; }
        .btn { display: inline-block; background: #2563eb; color: white; padding: .75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 500; transition: background .2s; }
        .btn:hover { background: #1d4ed8; }
        .footer { margin-top: 2rem; font-size: .75rem; color: #9ca3af; }
    </style>
</head>
<body>
    <div class="card">
        <img src="{{ asset('images/logo-azul-fondo-transparente.png') }}" alt="Logo" class="logo">
        <h1>403</h1>
        @php
            $user = auth()->user();
            $isMotorista = $user?->hasRole('motorista');
            $isSolicitante = $user?->hasRole('solicitante');
        @endphp
        @if ($isMotorista)
            <p>No puedes acceder a el panel de gestión.<br>Ingresá a la aplicación de motoristas para continuar.</p>
            <a href="https://app-motoristas.asamblea.gob.sv" class="btn">Ir a App Motoristas</a>
        @elseif ($isSolicitante)
            <p>No puedes acceder a el panel de gestión.<br>Ingresá a la aplicación de solicitudes de transporte para continuar.</p>
            <a href="https://app-transporte.asamblea.gob.sv" class="btn">Ir a App Transporte</a>
        @else
            <p>No puedes acceder a el panel de gestión.<br>Si piensas que esto es un error, contactá a tu administrador.</p>
        @endif
        <div class="footer">Asamblea Legislativa de El Salvador</div>
    </div>
</body>
</html>
