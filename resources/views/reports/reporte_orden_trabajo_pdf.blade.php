<!doctype html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Orden de Trabajo</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            color: #111827;
            margin: 28px;
        }

        .logo {
            text-align: center;
            margin-bottom: 10px;
        }

        .logo img {
            width: 110px;
        }

        .titulo {
            text-align: center;
            font-size: 23px;
            margin-bottom: 18px;
        }

        .subtitulo {
            text-align: center;
            font-size: 12px;
            margin-bottom: 15px;
            color: #4b5563;
        }

        .tabla {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
        }

        .tabla td {
            border: 1px solid #d1d5db;
            padding: 6px 8px;
            vertical-align: top;
        }

        .tabla td:first-child {
            font-weight: bold;
            width: 30%;
            background: #f9fafb;
        }

        .bloque {
            border: 1px solid #d1d5db;
            padding: 10px;
            margin-bottom: 14px;
            text-align: justify;
        }

        .firma {
            margin-top: 45px;
            text-align: center;
        }

        .linea {
            margin: 0 auto;
            width: 60%;
            border-top: 1px solid #000;
            margin-top: 35px;
        }

        .salto {
            page-break-after: always;
        }
    </style>
</head>
<body>
    @foreach($rows as $r)
        <div class="logo">
            <img src="{{ public_path('images/logo-azul-fondo-transparente.png') }}" alt="Asamblea Legislativa">
        </div>

        <div class="titulo">ORDEN DE TRABAJO</div>
        <div class="subtitulo">Sistema de Gestión de Transporte - Mantenimiento</div>

        <table class="tabla">
            <tr>
                <td>N° Orden / Solicitud</td>
                <td>{{ $r->codigo }}</td>
            </tr>
            <tr>
                <td>Fecha sugerida</td>
                <td>{{ optional($r->fecha_sugerida)->format('d/m/Y') ?? '—' }}</td>
            </tr>
            <tr>
                <td>Fecha realizada</td>
                <td>{{ optional($r->fecha_realizada)->format('d/m/Y') ?? '—' }}</td>
            </tr>
            <tr>
                <td>Solicitante</td>
                <td>{{ $r->solicitante?->name ?? '—' }}</td>
            </tr>
            <tr>
                <td>Aprobado por</td>
                <td>{{ $r->aprobador?->name ?? '—' }}</td>
            </tr>
            <tr>
                <td>Estado</td>
                <td>{{ ucfirst(str_replace('_', ' ', ($r->estado instanceof \UnitEnum ? $r->estado->value : $r->estado))) }}</td>
            </tr>
        </table>

        <table class="tabla">
            <tr>
                <td>Placa</td>
                <td>{{ $r->vehiculo?->placa ?? '—' }}</td>
            </tr>
            <tr>
                <td>Clase</td>
                <td>{{ $service->resolverClaseVehiculo($r) }}</td>
            </tr>
            <tr>
                <td>Marca</td>
                <td>{{ $service->resolverMarca($r) }}</td>
            </tr>
            <tr>
                <td>Modelo</td>
                <td>{{ $service->resolverModelo($r) }}</td>
            </tr>
            <tr>
                <td>Color</td>
                <td>{{ $service->resolverColor($r) }}</td>
            </tr>
            <tr>
                <td>Año</td>
                <td>{{ $r->vehiculo?->anio ?? '—' }}</td>
            </tr>
        </table>

        <table class="tabla">
            <tr>
                <td>Tipo de mantenimiento</td>
                <td>{{ $service->resolverTipoMantenimiento($r) }}</td>
            </tr>
            <tr>
                <td>Tipo de solicitud</td>
                <td>{{ $service->resolverTipoSolicitud($r) }}</td>
            </tr>
            <tr>
                <td>Costo estimado</td>
                <td>${{ number_format((float) ($r->costo_estimado ?? 0), 2) }}</td>
            </tr>
            <tr>
                <td>Costo real</td>
                <td>${{ number_format((float) ($r->costo_real ?? 0), 2) }}</td>
            </tr>
            <tr>
                <td>Adjuntos</td>
                <td>{{ $service->resolverAdjuntos($r) }}</td>
            </tr>
        </table>

        <div class="bloque">
            <strong>Detalle del trabajo requerido:</strong><br><br>
            {{ $r->detalle ?? '—' }}
        </div>

        <div class="bloque">
            <strong>Observaciones:</strong><br><br>
            {{ $r->observaciones ?? 'Sin observaciones.' }}
        </div>

        <div class="firma">
            <div>{{ $r->aprobador?->name ?? '—' }}</div>
            <div class="linea"></div>
            <div>Autorizador</div>
        </div>

        @if(!$loop->last)
            <div class="salto"></div>
        @endif
    @endforeach
</body>
</html>