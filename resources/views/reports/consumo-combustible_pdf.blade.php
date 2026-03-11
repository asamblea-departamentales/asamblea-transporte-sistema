<!doctype html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Control Mensual de Combustible</title>
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
            font-size: 15px;
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
            word-wrap: break-word;
            vertical-align: top;
        }

        table.main th {
            background: #0891b2;
            color: #ffffff;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 8px;
        }

        table.main tr:nth-child(even) { background: #f5fdff; }

        .badge {
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
        }

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
    </style>
</head>
<body>

    <div class="header">
        <div class="logo">
            <img src="{{ public_path('images/logo-azul-fondo-transparente.png') }}" alt="Asamblea Legislativa" style="width:150px;">
        </div>
        <div class="title-container">
            <h2>Transporte y Logística</h2>
            <p style="margin:4px 0 0; color:#6b7280;">Control Mensual de Combustible</p>
        </div>
        <div class="clearfix"></div>
    </div>

    <table class="kpis" style="border-collapse: separate; border-spacing: 6px;">
        <tr>
            <td><div class="kpi-box"><span class="kpi-label">Total</span><span class="kpi-value">{{ $rows->count() }}</span></div></td>
            <td><div class="kpi-box"><span class="kpi-label">Galones</span><span class="kpi-value">{{ number_format($rows->sum('cantidad_combustible'), 2) }}</span></div></td>
            <td><div class="kpi-box"><span class="kpi-label">Valor total</span><span class="kpi-value">${{ number_format($rows->sum('valor_total'), 2) }}</span></div></td>
            <td><div class="kpi-box"><span class="kpi-label">Monto asignado</span><span class="kpi-value">${{ number_format($rows->sum('monto_asignado'), 2) }}</span></div></td>
            <td><div class="kpi-box"><span class="kpi-label">Asignadas</span><span class="kpi-value">{{ $rows->where('estado', 'asignada')->count() }}</span></div></td>
            <td><div class="kpi-box"><span class="kpi-label">Completadas</span><span class="kpi-value">{{ $rows->where('estado', 'completada')->count() }}</span></div></td>
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
                <th width="7%">Fecha</th>
                <th width="9%">Código</th>
                <th width="13%">Vehículo</th>
                <th width="10%">Motorista</th>
                <th>Destino / Actividad</th>
                <th width="8%">Contrato</th>
                <th width="8%">Serie</th>
                <th width="8%">Correlativo</th>
                <th width="6%">Vales</th>
                <th width="8%">Monto Asignado</th>
                <th width="7%">Galones</th>
                <th width="8%">Valor Total</th>
                <th width="8%">Estado</th>
            </tr>
        </thead>
        <tbody>
            @foreach($rows as $r)
            @php
                $estado = $r->estado instanceof \UnitEnum ? $r->estado->value : (string) $r->estado;
            @endphp
            <tr>
                <td>{{ optional($r->fecha_solicitud)->format('d/m/Y') ?? '—' }}</td>
                <td style="font-family:monospace;">{{ $r->codigo }}</td>
                <td>{{ $service->resolverVehiculo($r) }}</td>
                <td>{{ $r->motorista?->nombre ?? '—' }}</td>
                <td>{{ mb_convert_encoding(mb_strimwidth($r->destino_actividad ?? '', 0, 50, '...'), 'UTF-8', 'UTF-8') }}</td>
                <td>{{ $r->contrato?->numero_contrato ?? '—' }}</td>
                <td>{{ $r->serieVale?->nombre ?? '—' }}</td>
                <td>{{ $service->resolverCorrelativo($r) }}</td>
                <td style="text-align:right;">{{ $r->cantidad_vales ?? '—' }}</td>
                <td style="text-align:right;">${{ $r->monto_asignado ? number_format($r->monto_asignado, 2) : '—' }}</td>
                <td style="text-align:right;">{{ $r->cantidad_combustible ? number_format($r->cantidad_combustible, 2) : '—' }}</td>
                <td style="text-align:right; font-weight:bold;">${{ $r->valor_total ? number_format($r->valor_total, 2) : '—' }}</td>
                <td><span class="badge">{{ ucfirst(str_replace('_', ' ', $estado)) }}</span></td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Asamblea Legislativa de El Salvador &mdash; Sistema de Gestión de Transporte &mdash;
        Página <script type="text/php">echo $PAGE_NUM . " de " . $PAGE_COUNT;</script>
    </div>

</body>
</html>