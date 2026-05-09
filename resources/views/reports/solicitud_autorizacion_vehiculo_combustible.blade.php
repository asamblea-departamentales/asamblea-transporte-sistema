<!doctype html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Documento Oficial de Autorización</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            color: #000;
            margin: 20px 30px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .header img {
            width: 90px;
        }

        .header h1 {
            font-size: 14px;
            margin: 6px 0 2px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .header h2 {
            font-size: 13px;
            margin: 0 0 4px;
            text-transform: uppercase;
        }

        .header .documento-titulo {
            font-size: 16px;
            font-weight: bold;
            margin-top: 10px;
            padding-top: 8px;
            border-top: 2px solid #000;
        }

        .header .codigo-fecha {
            font-size: 10px;
            margin-top: 4px;
        }

        .section-title {
            background: #d9d9d9;
            font-weight: bold;
            padding: 5px 8px;
            margin-top: 14px;
            margin-bottom: 6px;
            font-size: 11px;
            text-transform: uppercase;
        }

        table.info {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2px;
        }

        table.info th, table.info td {
            border: 1px solid #000;
            padding: 5px 7px;
            text-align: left;
            font-size: 11px;
        }

        table.info th {
            background: #d9d9d9;
            font-weight: bold;
            width: 30%;
        }

        table.info td {
            width: 70%;
        }

        .observaciones {
            border: 1px solid #000;
            padding: 8px;
            min-height: 40px;
            margin-bottom: 8px;
        }

        .firmas {
            margin-top: 30px;
            text-align: center;
            width: 100%;
        }

        .firmas table {
            width: 100%;
            border-collapse: collapse;
        }

        .firmas td {
            width: 33%;
            padding: 0 10px;
            text-align: center;
            vertical-align: top;
        }

        .firmas .linea {
            border-top: 1px solid #000;
            margin: 50px auto 6px;
            width: 85%;
        }

        .firmas .cargo {
            font-size: 10px;
            font-weight: bold;
        }

        .firmas .nombre {
            font-size: 10px;
        }

        .footer {
            position: fixed;
            bottom: -30px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 8px;
            color: #6b7280;
            border-top: 1px solid #d1d5db;
            padding-top: 4px;
        }
    </style>
</head>
<body>

    <div class="header">
        <img src="{{ public_path('images/logo-azul-fondo-transparente.png') }}" alt="Asamblea Legislativa">
        <h1>Asamblea Legislativa de El Salvador</h1>
        <h2>Dirección de Transporte y Logística</h2>
        <div class="documento-titulo">Documento Oficial de Autorización</div>
        <div class="codigo-fecha">
            Código: {{ $datos['codigo'] }} &nbsp;|&nbsp; Fecha de emisión: {{ $datos['fecha_emision'] }}
        </div>
    </div>

    <div class="section-title">I. Información General de la Misión</div>
    <table class="info">
        <tr><th>Unidad solicitante</th><td>{{ $datos['unidad'] }}</td></tr>
        <tr><th>Solicitante</th><td>{{ $datos['solicitante'] }}</td></tr>
        <tr><th>Destino</th><td>{{ $datos['destino'] }}</td></tr>
        @if ($datos['destino_adicional'] !== 'Sin destino adicional')
        <tr><th>Destino adicional</th><td>{{ $datos['destino_adicional'] }}</td></tr>
        @endif
        <tr><th>Motivo de la misión</th><td>{{ $datos['motivo'] }}</td></tr>
        <tr><th>Fecha de salida</th><td>{{ $datos['fecha_salida'] }}</td></tr>
        <tr><th>Fecha de regreso</th><td>{{ $datos['fecha_regreso'] }}</td></tr>
        <tr><th>Hora de salida</th><td>{{ $datos['hora_salida'] }}</td></tr>
        <tr><th>Hora de regreso</th><td>{{ $datos['hora_regreso'] }}</td></tr>
    </table>

    <div class="section-title">II. Información del Vehículo</div>
    <table class="info">
        <tr><th>Vehículo</th><td>{{ $datos['placa'] }}</td></tr>
        <tr><th>Placa</th><td>{{ $datos['placa'] }}</td></tr>
        <tr><th>Tipo de vehículo</th><td>{{ $datos['tipo_vehiculo'] }}</td></tr>
        <tr><th>Motorista</th><td>{{ $datos['motorista'] }}</td></tr>
    </table>

    <div class="section-title">III. Información de Combustible</div>
    <table class="info">
        <tr><th>Tipo de combustible</th><td>{{ $datos['tipo_combustible'] }}</td></tr>
        <tr><th>Ticket externo</th><td>{{ $datos['ticket'] }}</td></tr>
        <tr><th>Monto autorizado</th><td>$ {{ number_format($datos['monto_combustible'], 2) }}</td></tr>
    </table>

    <div class="section-title">IV. Observaciones</div>
    <div class="observaciones">{{ $datos['observaciones'] }}</div>

    <div class="section-title">V. Firmas de Autorización</div>
    <div class="firmas">
        <table>
            <tr>
                <td>
                    <div class="linea"></div>
                    <div class="cargo">Solicitante</div>
                    <div class="nombre">{{ $datos['solicitante'] }}</div>
                </td>
                <td>
                    <div class="linea"></div>
                    <div class="cargo">Jefe de Unidad</div>
                    <div class="nombre">&nbsp;</div>
                </td>
                <td>
                    <div class="linea"></div>
                    <div class="cargo">Autorizado Transporte</div>
                    <div class="nombre">&nbsp;</div>
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        Asamblea Legislativa de El Salvador &mdash; Sistema de Gestión de Transporte &mdash;
        Documento generado el {{ now()->format('d/m/Y H:i') }} &mdash;
        Página <script type="text/php">echo $PAGE_NUM . " de " . $PAGE_COUNT;</script>
    </div>

</body>
</html>
