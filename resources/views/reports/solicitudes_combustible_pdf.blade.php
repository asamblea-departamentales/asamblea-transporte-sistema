<!doctype html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Reporte Solicitudes de Combustible</title>
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
            border-bottom: 2px solid #92400e;
            padding-bottom: 10px;
        }
        .logo { width: 150px; float: left; }
        .title-container { float: right; text-align: right; width: 70%; }
        h2 { margin: 0; color: #92400e; font-size: 17px; text-transform: uppercase; }
        .clearfix { clear: both; }

        /* KPIs */
        .kpis { width: 100%; margin-bottom: 12px; }
        .kpi-box { background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 4px; padding: 6px; text-align: center; }
        .kpi-box.success { background-color: #d1fae5; border-color: #6ee7b7; }
        .kpi-box.danger  { background-color: #fef2f2; border-color: #fecaca; }
        .kpi-box.info    { background-color: #eff6ff; border-color: #bfdbfe; }
        .kpi-box.gray    { background-color: #f9fafb; border-color: #e5e7eb; }
        .kpi-label { font-size: 8px; color: #6b7280; text-transform: uppercase; display: block; margin-bottom: 2px; }
        .kpi-value { font-size: 16px; font-weight: bold; color: #92400e; }
        .kpi-box.success .kpi-value { color: #065f46; }
        .kpi-box.danger  .kpi-value { color: #991b1b; }
        .kpi-box.info    .kpi-value { color: #1e40af; }
        .kpi-box.gray    .kpi-value { color: #374151; }

        /* Meta */
        .meta {
            margin-bottom: 12px;
            padding: 7px 10px;
            background-color: #fffbeb;
            border-left: 3px solid #92400e;
        }
        .meta table { border: none; width: 100%; }
        .meta td { border: none; padding: 2px 0; }

        /* Tabla */
        table.main { width: 100%; border-collapse: collapse; margin-top: 8px; }
        table.main th, table.main td {
            border: 0.5px solid #d1d5db;
            padding: 5px 6px;
            text-align: left;
            word-wrap: break-word;
        }
        table.main th {
            background: #92400e;
            color: #ffffff;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 8px;
        }
        table.main tr:nth-child(even) { background: #fffbeb; }

        /* Badges */
        .badge {
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .s-pendiente    { background-color: #fef3c7; color: #92400e; }
        .s-en_revision  { background-color: #dbeafe; color: #1e40af; }
        .s-pre_aprobada { background-color: #fef3c7; color: #92400e; }
        .s-aprobada     { background-color: #d1fae5; color: #065f46; }
        .s-rechazada    { background-color: #fee2e2; color: #991b1b; }
        .s-en_ejecucion { background-color: #ede9fe; color: #5b21b6; }
        .s-completada   { background-color: #d1fae5; color: #065f46; }
        .s-cancelada    { background-color: #f3f4f6; color: #6b7280; }
        .p-alta  { background-color: #fee2e2; color: #991b1b; }
        .p-media { background-color: #fef3c7; color: #92400e; }
        .p-baja  { background-color: #d1fae5; color: #065f46; }

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
            <p style="margin:4px 0 0; color:#6b7280;">Reporte de Solicitudes de Combustible</p>
        </div>
        <div class="clearfix"></div>
    </div>

    {{-- KPIs --}}
    <table class="kpis" style="border-collapse: separate; border-spacing: 6px;">
        <tr>
            <td>
                <div class="kpi-box info">
                    <span class="kpi-label">Total</span>
                    <span class="kpi-value" style="color:#1e40af;">{{ $rows->count() }}</span>
                </div>
            </td>
            <td>
                <div class="kpi-box">
                    <span class="kpi-label">Pendientes</span>
                    <span class="kpi-value">
                        {{ $rows->whereIn('estado', ['pendiente','en_revision','pre_aprobada'])->count() }}
                    </span>
                </div>
            </td>
            <td>
                <div class="kpi-box success">
                    <span class="kpi-label">Aprobadas</span>
                    <span class="kpi-value">{{ $rows->where('estado', 'aprobada')->count() }}</span>
                </div>
            </td>
            <td>
                <div class="kpi-box danger">
                    <span class="kpi-label">Rechazadas</span>
                    <span class="kpi-value">{{ $rows->where('estado', 'rechazada')->count() }}</span>
                </div>
            </td>
            <td>
                <div class="kpi-box gray">
                    <span class="kpi-label">Total Galones</span>
                    <span class="kpi-value" style="color:#374151; font-size:13px;">
                        {{ number_format($rows->sum(fn($r) => $r->cantidad_combustible ?? 0), 2) }} gal
                    </span>
                </div>
            </td>
            <td>
                <div class="kpi-box success">
                    <span class="kpi-label">Valor Total</span>
                    <span class="kpi-value" style="font-size:13px;">
                        ${{ number_format($rows->sum(fn($r) => $r->valor_total ?? 0), 2) }}
                    </span>
                </div>
            </td>
        </tr>
    </table>

    {{-- Meta --}}
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

    {{-- Tabla --}}
    <table class="main">
        <thead>
            <tr>
                <th width="9%">Código</th>
                <th width="10%">Vehículo</th>
                <th width="10%">Motorista</th>
                <th width="8%">Fecha</th>
                <th>Destino / Actividad</th>
                <th width="7%">Galones</th>
                <th width="7%">$/gal</th>
                <th width="8%">Total</th>
                <th width="7%">Pago</th>
                <th width="7%">Prioridad</th>
                <th width="9%">Estado</th>
            </tr>
        </thead>
        <tbody>
            @foreach($rows as $r)
            @php
                $estado    = $r->estado instanceof \UnitEnum ? $r->estado->value : (string) $r->estado;
                $prioridad = $r->prioridad instanceof \UnitEnum ? $r->prioridad->value : (string) $r->prioridad;
            @endphp
            <tr>
                <td style="font-family:monospace; font-size:9px;">{{ $r->codigo }}</td>
                <td>
                    <strong>{{ $r->vehiculo?->placa ?? 'N/A' }}</strong><br>
                    <span style="font-size:8px; color:#6b7280;">
                        {{ trim("{$r->vehiculo?->marca?->nombre} {$r->vehiculo?->modelo?->nombre}") }}
                    </span>
                </td>
                <td style="font-size:9px;">{{ mb_convert_encoding($r->motorista?->nombre ?? '—', 'UTF-8', 'UTF-8') }}</td>
                <td>{{ optional($r->fecha_solicitud)->format('d/m/Y') ?? '—' }}</td>
                <td style="font-size:9px;">{{ mb_convert_encoding(mb_strimwidth($r->destino_actividad ?? '', 0, 60, '...'), 'UTF-8', 'UTF-8') }}</td>
                <td style="text-align:right;">{{ $r->cantidad_combustible ? number_format($r->cantidad_combustible, 2) : '—' }}</td>
                <td style="text-align:right;">${{ $r->valor_unitario ? number_format($r->valor_unitario, 2) : '—' }}</td>
                <td style="text-align:right; font-weight:bold;">${{ $r->valor_total ? number_format($r->valor_total, 2) : '—' }}</td>
                <td style="font-size:9px;">{{ ucfirst($r->forma_pago ?? '—') }}</td>
                <td><span class="badge p-{{ $prioridad }}">{{ strtoupper($prioridad) }}</span></td>
                <td><span class="badge s-{{ $estado }}">{{ ucfirst(str_replace('_', ' ', $estado)) }}</span></td>
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