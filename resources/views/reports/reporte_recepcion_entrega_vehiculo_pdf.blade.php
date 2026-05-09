<!doctype html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Recepción / Entrega de Vehículo</title>
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
            font-size: 22px;
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
            padding: 7px 8px;
            vertical-align: top;
        }

        .tabla td:first-child {
            font-weight: bold;
            width: 32%;
            background: #f9fafb;
        }

        .bloque {
            border: 1px solid #d1d5db;
            padding: 10px;
            margin-bottom: 14px;
            text-align: justify;
        }

        .firmas {
            margin-top: 40px;
            width: 100%;
        }

        .firma-box {
            width: 45%;
            display: inline-block;
            text-align: center;
            vertical-align: top;
        }

        .linea {
            width: 80%;
            border-top: 1px solid #000;
            margin: 35px auto 6px auto;
        }

        .seccion-titulo {
            font-size: 11px;
            font-weight: bold;
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-bottom: none;
            padding: 5px 8px;
            margin-top: 4px;
        }
    </style>
</head>
<body>
    <div class="logo">
        <img src="{{ public_path('images/logo-azul-fondo-transparente.png') }}" alt="Asamblea Legislativa">
    </div>

    <div class="titulo">RECEPCIÓN / ENTREGA DE VEHÍCULO</div>
    <div class="subtitulo">Control Operativo de Vehículos Institucionales</div>

    {{-- BLOQUE 1: Datos del movimiento --}}
    <table class="tabla">
        <tr>
            <td>Tipo de movimiento</td>
            <td>{{ $movimiento->tipo_movimiento === 'entrega' ? 'Entrega' : 'Recepción' }}</td>
        </tr>
        <tr>
            <td>Fecha y hora</td>
            <td>{{ optional($movimiento->fecha_hora)->format('d/m/Y H:i') ?? '—' }}</td>
        </tr>
        <tr>
            <td>Registrado por</td>
            <td>{{ $movimiento->usuario?->name ?? '—' }}</td>
        </tr>
        @if($movimiento->solicitud_transporte_id)
        <tr>
            <td>Solicitud vinculada</td>
            <td>{{ $movimiento->solicitud?->codigo ?? "# {$movimiento->solicitud_transporte_id}" }}</td>
        </tr>
        @endif
    </table>

    {{-- BLOQUE 2: Datos del vehículo --}}
    <table class="tabla">
        <tr>
            <td>Placa</td>
            <td>{{ $movimiento->vehiculo?->placa ?? '—' }}</td>
        </tr>
        <tr>
            <td>Marca</td>
            <td>{{ $movimiento->vehiculo?->vehMarca?->nombre ?? $movimiento->vehiculo?->marca ?? '—' }}</td>
        </tr>
        <tr>
            <td>Modelo</td>
            <td>{{ $movimiento->vehiculo?->vehModelo?->nombre ?? $movimiento->vehiculo?->modelo ?? '—' }}</td>
        </tr>
        <tr>
            <td>Color</td>
            <td>{{ $movimiento->vehiculo?->color?->nombre ?? '—' }}</td>
        </tr>
        <tr>
            <td>Motorista</td>
            <td>{{ $movimiento->motorista?->nombre ?? '—' }}</td>
        </tr>
    </table>

    {{-- BLOQUE 3: Condición del vehículo --}}
    <table class="tabla">
        <tr>
            <td>Kilometraje</td>
            <td>{{ $movimiento->kilometraje ?? '—' }}</td>
        </tr>
        <tr>
            <td>Nivel de combustible</td>
            <td>{{ $movimiento->nivel_combustible ? strtoupper($movimiento->nivel_combustible) : '—' }}</td>
        </tr>
        <tr>
            <td>Herramientas completas</td>
            <td>{{ $movimiento->herramientas_completas ? 'Sí' : 'No' }}</td>
        </tr>
        <tr>
            <td>Accesorios completos</td>
            <td>{{ $movimiento->accesorios_completos ? 'Sí' : 'No' }}</td>
        </tr>
    </table>

    {{-- BLOQUE 4: Fechas reales (solo si hay solicitud vinculada) --}}
    @if($movimiento->solicitud_transporte_id && $movimiento->solicitud)
    <div class="seccion-titulo">TRAZABILIDAD DE LA MISIÓN</div>
    <table class="tabla">
        <tr>
            <td>Fecha de salida programada</td>
            <td>{{ optional($movimiento->solicitud->fecha_salida)->format('d/m/Y H:i') ?? '—' }}</td>
        </tr>
        <tr>
            <td>Fecha de salida real</td>
            <td>{{ optional($movimiento->solicitud->fecha_salida_real)->format('d/m/Y H:i') ?? '—' }}</td>
        </tr>
        <tr>
            <td>Fecha de retorno programada</td>
            <td>{{ optional($movimiento->solicitud->fecha_retorno)->format('d/m/Y H:i') ?? '—' }}</td>
        </tr>
        <tr>
            <td>Fecha de retorno real</td>
            <td>{{ optional($movimiento->solicitud->fecha_retorno_real)->format('d/m/Y H:i') ?? '—' }}</td>
        </tr>
        @if($movimiento->solicitud->despachador)
        <tr>
            <td>Despachado por</td>
            <td>{{ $movimiento->solicitud->despachador?->name ?? '—' }}</td>
        </tr>
        @endif
    </table>
    @endif

    {{-- BLOQUE 5: Observaciones --}}
    <div class="bloque">
        <strong>Estado exterior:</strong><br><br>
        {{ $movimiento->estado_exterior ?? 'Sin observaciones.' }}
    </div>

    <div class="bloque">
        <strong>Estado interior:</strong><br><br>
        {{ $movimiento->estado_interior ?? 'Sin observaciones.' }}
    </div>

    <div class="bloque">
        <strong>Observaciones:</strong><br><br>
        {{ $movimiento->observaciones ?? 'Sin observaciones.' }}
    </div>

    {{-- FIRMAS --}}
    <div class="firmas">
        <div class="firma-box">
            <div>{{ $movimiento->entregado_por ?? '—' }}</div>
            <div class="linea"></div>
            <div>Entregado por</div>
        </div>

        <div class="firma-box" style="float:right;">
            <div>{{ $movimiento->recibido_por ?? '—' }}</div>
            <div class="linea"></div>
            <div>Recibido por</div>
        </div>
    </div>
</body>
</html>