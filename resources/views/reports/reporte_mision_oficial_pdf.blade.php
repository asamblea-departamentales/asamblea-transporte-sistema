<!doctype html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Misión Oficial</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 18px;
            color: #111827;
            margin: 30px;
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
            font-size: 24px;
            margin-bottom: 18px;
        }

        .bloque-texto {
            border: 1px dashed #9ca3af;
            padding: 8px 10px;
            margin-bottom: 16px;
        }

        .tabla {
            width: 55%;
            margin: 0 auto 20px auto;
            border-collapse: collapse;
        }

        .tabla td {
            border: 1px solid #d1d5db;
            padding: 6px 8px;
        }

        .tabla td:first-child {
            font-weight: bold;
            width: 42%;
        }

        .centrado {
            text-align: center;
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
    @foreach($rows as $index => $r)
        <div class="logo">
            <img src="{{ public_path('images/logo-azul-fondo-transparente.png') }}" alt="Asamblea Legislativa">
        </div>

        <div class="titulo">MISIÓN OFICIAL</div>

        <div class="bloque-texto">
            EL SUSCRITO SEÑOR <strong>{{ mb_strtoupper($r->autorizador?->name ?? '—') }}</strong>,
            EN SU CALIDAD DE <strong>{{ mb_strtoupper($service->resolverAutorizadorCargo($r)) }}</strong>
            DE LA ASAMBLEA LEGISLATIVA.
        </div>

        <div class="bloque-texto">
            EL VEHÍCULO CON LAS SIGUIENTES CARACTERÍSTICAS:
        </div>

        <table class="tabla">
            <tr>
                <td>PLACAS</td>
                <td>{{ $r->vehiculo?->placa ?? '—' }}</td>
            </tr>
            <tr>
                <td>CLASE</td>
                <td>{{ $service->resolverClaseVehiculo($r) }}</td>
            </tr>
            <tr>
                <td>AÑO</td>
                <td>{{ $r->vehiculo?->anio ?? '—' }}</td>
            </tr>
            <tr>
                <td>CAPACIDAD</td>
                <td>{{ $r->vehiculo?->capacidad_personas ?? '—' }}</td>
            </tr>
            <tr>
                <td>MARCA</td>
                <td>{{ $service->resolverMarca($r) }}</td>
            </tr>
            <tr>
                <td>MODELO</td>
                <td>{{ $service->resolverModelo($r) }}</td>
            </tr>
            <tr>
                <td>COLOR</td>
                <td>{{ $service->resolverColor($r) }}</td>
            </tr>
        </table>

        <div class="bloque-texto" style="text-align: justify;">
            {{ $service->construirTextoMision($r) }}
        </div>

        <div class="bloque-texto centrado">
            <strong>Fecha de salida:</strong>
            {{ optional($r->fecha_salida)->format('d/m/Y H:i') ?? '—' }}
            <br>
            <strong>Fecha de retorno:</strong>
            {{ optional($r->fecha_retorno)->format('d/m/Y H:i') ?? '—' }}
        </div>

        <div class="firma">
            <div>{{ $r->autorizador?->name ?? '—' }}</div>
            <div class="linea"></div>
            <div>{{ $service->resolverAutorizadorCargo($r) }}</div>
        </div>

        @if(!$loop->last)
            <div class="salto"></div>
        @endif
    @endforeach
</body>
</html>