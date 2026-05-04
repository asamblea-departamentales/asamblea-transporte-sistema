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

        /* KPIs mejorados */
        .kpis { width: 100%; margin-bottom: 12px; }
        .kpi-box {
            border-radius: 4px;
            padding: 8px 6px;
            text-align: center;
            border: 1px solid;
        }
        .kpi-box.cyan { background-color: #ecfeff; border-color: #a5f3fc; }
        .kpi-box.blue { background-color: #eff6ff; border-color: #bfdbfe; }
        .kpi-box.green { background-color: #f0fdf4; border-color: #bbf7d0; }
        .kpi-box.red { background-color: #fef2f2; border-color: #fecaca; }
        .kpi-box.amber { background-color: #fefce8; border-color: #fde68a; }
        
        .kpi-label {
            font-size: 8px;
            color: #6b7280;
            text-transform: uppercase;
            display: block;
            margin-bottom: 2px;
        }
        .kpi-value {
            font-size: 16px;
            font-weight: bold;
        }
        .kpi-box.cyan .kpi-value { color: #0891b2; }
        .kpi-box.blue .kpi-value { color: #1e40af; }
        .kpi-box.green .kpi-value { color: #065f46; }
        .kpi-box.red .kpi-value { color: #991b1b; }
        .kpi-box.amber .kpi-value { color: #92400e; }

        .meta {
            margin-bottom: 12px;
            padding: 7px 10px;
            background-color: #ecfeff;
            border-left: 3px solid #0891b2;
        }
        .meta table { border: none; width: 100%; }
        .meta td { border: none; padding: 2px 0; }

        /* Tabla principal */
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

        /* Badges para tipos de servicio */
        .badge {
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .tipo-transporte { background-color: #dbeafe; color: #1e40af; }
        .tipo-combustible { background-color: #ecfeff; color: #0891b2; }
        .tipo-mantenimiento { background-color: #f0fdf4; color: #065f46; }

        /* Badges para estados */
        .s-pendiente { background-color: #fef3c7; color: #92400e; }
        .s-en_revision { background-color: #dbeafe; color: #1e40af; }
        .s-pre_aprobada { background-color: #fef3c7; color: #92400e; }
        .s-aprobada { background-color: #d1fae5; color: #065f46; }
        .s-rechazada { background-color: #fee2e2; color: #991b1b; }
        .s-en_ejecucion { background-color: #ede9fe; color: #5b21b6; }
        .s-completada { background-color: #d1fae5; color: #065f46; }
        .s-cancelada { background-color: #f3f4f6; color: #6b7280; }

        /* Badges para prioridad */
        .p-alta { background-color: #fee2e2; color: #991b1b; }
        .p-media { background-color: #fef3c7; color: #92400e; }
        .p-baja { background-color: #d1fae5; color: #065f46; }

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
        .mono { font-family: monospace; font-size: 9px; }
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

    {{-- KPIs con colores distintivos --}}
    <table class="kpis" style="border-collapse: separate; border-spacing: 6px;">
        <tr>
            <td><div class="kpi-box cyan"><span class="kpi-label">Total Solicitudes</span><span class="kpi-value">{{ $kpis['total'] }}</span></div></td>
            <td><div class="kpi-box blue"><span class="kpi-label">Transporte</span><span class="kpi-value">{{ $kpis['transporte'] }}</span></div></td>
            <td><div class="kpi-box cyan"><span class="kpi-label">Combustible</span><span class="kpi-value">{{ $kpis['combustible'] }}</span></div></td>
            <td><div class="kpi-box green"><span class="kpi-label">Mantenimiento</span><span class="kpi-value">{{ $kpis['mantenimiento'] }}</span></div></td>
            <td><div class="kpi-box green"><span class="kpi-label">Aprob/Completadas</span><span class="kpi-value">{{ $kpis['aprobadas'] }}</span></div></td>
            <td><div class="kpi-box red"><span class="kpi-label">Rechaz/Canceladas</span><span class="kpi-value">{{ $kpis['rechazadas'] }}</span></div></td>
            <td><div class="kpi-box amber"><span class="kpi-label">Monto Total</span><span class="kpi-value">${{ number_format((float) $kpis['monto_total'], 2) }}</span></div></td>
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
                <th width="9%">Tipo</th>
                <th width="10%">Código</th>
                <th width="10%">Fecha</th>
                <th width="12%">Solicitante</th>
                <th width="8%">Vehículo</th>
                <th width="10%">Motorista</th>
                <th>Detalle</th>
                <th width="9%">Estado</th>
                <th width="7%">Prioridad</th>
                <th width="8%">Monto</th>
            </tr>
        </thead>
        <tbody>
            @forelse($rows as $row)
                @php
                    $estado = $row['estado'] ?? '';
                    $prioridad = $row['prioridad'] ?? '';
                    $tipo = $row['tipo_servicio'] ?? '';
                    $estadoClass = 's-' . str_replace(' ', '_', strtolower($estado));
                    $prioridadClass = 'p-' . strtolower($prioridad);
                    $tipoClass = 'tipo-' . strtolower($tipo);
                @endphp
                <tr>
                    <td><span class="badge {{ $tipoClass }}">{{ $tipo }}</span></td>
                    <td class="mono">{{ $row['codigo'] }}</td>
                    <td>{{ $row['fecha'] ? \Carbon\Carbon::parse($row['fecha'])->format('d/m/Y H:i') : '—' }}</td>
                    <td>{{ mb_convert_encoding($row['solicitante'] ?? '—', 'UTF-8', 'UTF-8') }}</td>
                    <td>{{ $row['vehiculo'] ?? '—' }}</td>
                    <td>{{ mb_convert_encoding($row['motorista'] ?? '—', 'UTF-8', 'UTF-8') }}</td>
                    <td>{{ mb_convert_encoding(mb_strimwidth($row['detalle'] ?? '', 0, 80, '...'), 'UTF-8', 'UTF-8') }}</td>
                    <td><span class="badge {{ $estadoClass }}">{{ ucfirst(str_replace('_', ' ', $estado)) }}</span></td>
                    <td><span class="badge {{ $prioridadClass }}">{{ strtoupper($prioridad) }}</span></td>
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