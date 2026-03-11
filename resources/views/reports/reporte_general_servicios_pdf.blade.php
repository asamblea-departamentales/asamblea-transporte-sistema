<!doctype html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Informe General de Servicios</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            color: #1f2937;
            margin: 0;
            padding: 0;
        }

        .header {
            width: 100%;
            margin-bottom: 16px;
            border-bottom: 2px solid #0891b2;
            padding-bottom: 10px;
        }

        .logo { width: 150px; float: left; }
        .title-container { float: right; text-align: right; width: 70%; }
        h2 { margin: 0; color: #0891b2; font-size: 17px; text-transform: uppercase; }
        .clearfix { clear: both; }

        .kpis { width: 100%; margin-bottom: 12px; }
        .kpi-box {
            background-color: #ecfeff;
            border: 1px solid #a5f3fc;
            border-radius: 4px;
            padding: 6px;
            text-align: center;
        }
        .kpi-label {
            font-size: 8px;
            color: #6b7280;
            text-transform: uppercase;
            display: block;
            margin-bottom: 2px;
        }
        .kpi-value {
            font-size: 13px;
            font-weight: bold;
            color: #0891b2;
        }

        .meta {
            margin-bottom: 12px;
            padding: 7px 10px;
            background-color: #ecfeff;
            border-left: 3px solid #0891b2;
        }
        .meta table { border: none; width: 100%; }
        .meta td { border: none; padding: 2px 0; }

        table.main {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }
        table.main th, table.main td {
            border: 0.5px solid #d1d5db;
            padding: 5px 6px;
            text-align: left;
            vertical-align: top;
            word-wrap: break-word;
        }
        table.main th {
            background: #0891b2;
            color: #ffffff;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 8px;
        }
        table.main tr:nth-child(even) { background: #f5fdff; }

        .footer {
            position: fixed;
            bottom: -30px;
            left: 0; right: 0;
            height: 30px;
            text-align: center;
            font-size: 8px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
        }

        .text-right { text-align: right; }
    </style>
</head>
<body>

    <div class="header">
        <div class="logo">
            <img src="{{ public_path('images/logo-azul-fondo-transparente.png') }}" alt="Asamblea Legislativa" style="width:150px;">
        </div>
        <div class="title-container">
            <h2>Transporte y Logística</h2>
            <p style="margin:4px 0 0; color:#6b7280;">Informe General de Servicios</p>
        </div>
        <div class="clearfix"></div>
    </div>

    <table class="kpis" style="border-collapse: separate; border-spacing: 6px;">
        <tr>
            <td><div class="kpi-box"><span class="kpi-label">Total</span><span class="kpi-value">{{ $kpis['total'] }}</span></div></td>
            <td><div class="kpi-box"><span class="kpi-label">Transporte</span><span class="kpi-value">{{ $kpis['transporte'] }}</span></div></td>
            <td><div class="kpi-box"><span class="kpi-label">Combustible</span><span class="kpi-value">{{ $kpis['combustible'] }}</span></div></td>
            <td><div class="kpi-box"><span class="kpi-label">Mantenimiento</span><span class="kpi-value">{{ $kpis['mantenimiento'] }}</span></div></td>
            <td><div class="kpi-box"><span class="kpi-label">Aprobadas/Completadas</span><span class="kpi-value">{{ $kpis['aprobadas'] }}</span></div></td>
            <td><div class="kpi-box"><span class="kpi-label">Rechazadas/Canceladas</span><span class="kpi-value">{{ $kpis['rechazadas'] }}</span></div></td>
            <td><div class="kpi-box"><span class="kpi-label">Monto total</span><span class="kpi-value">${{ number_format((float) $kpis['monto_total'], 2) }}</span></div></td>
        </tr>
    </table>

    <div class="meta">
        <table>
            <tr>
                <td width="15%"><strong>Rango:</strong></td>
                <td>{{ $rangeLabel }}</td>
                <td width="15%" style="text-align:right;"><strong>Generado:</strong></td>
                <td width="22%" style="text-align:right;">{{ now()->format('d/m/Y H:i') }}</td>
            </tr>
        </table>
    </div>

    <table class="main">
        <thead>
            <tr>
                <th width="8%">Tipo</th>
                <th width="10%">Código</th>
                <th width="10%">Fecha</th>
                <th width="12%">Solicitante</th>
                <th width="8%">Vehículo</th>
                <th width="10%">Motorista</th>
                <th>Detalle</th>
                <th width="8%">Estado</th>
                <th width="7%">Prioridad</th>
                <th width="8%">Monto</th>
            </tr>
        </thead>
        <tbody>
            @forelse($rows as $row)
                <tr>
                    <td>{{ $row['tipo_servicio'] }}</td>
                    <td style="font-family:monospace;">{{ $row['codigo'] }}</td>
                    <td>
                        {{ $row['fecha'] ? \Carbon\Carbon::parse($row['fecha'])->format('d/m/Y H:i') : '—' }}
                    </td>
                    <td>{{ mb_convert_encoding($row['solicitante'] ?? '—', 'UTF-8', 'UTF-8') }}</td>
                    <td>{{ $row['vehiculo'] ?? '—' }}</td>
                    <td>{{ mb_convert_encoding($row['motorista'] ?? '—', 'UTF-8', 'UTF-8') }}</td>
                    <td>{{ mb_convert_encoding(mb_strimwidth($row['detalle'] ?? '', 0, 80, '...'), 'UTF-8', 'UTF-8') }}</td>
                    <td>{{ ucfirst(str_replace('_', ' ', $row['estado'] ?? '')) }}</td>
                    <td>{{ strtoupper($row['prioridad'] ?? '—') }}</td>
                    <td class="text-right">${{ number_format((float) ($row['monto'] ?? 0), 2) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="10" style="text-align:center;">No hay registros para mostrar.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Asamblea Legislativa de El Salvador &mdash; Sistema de Gestión de Transporte &mdash;
        Página <script type="text/php">echo $PAGE_NUM . " de " . $PAGE_COUNT;</script>
    </div>

</body>
</html>