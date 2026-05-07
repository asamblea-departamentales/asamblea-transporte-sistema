<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 9px;
            color: #000;
            background: #fff;
        }

        /* ══ ENCABEZADO ══ */
        .header-wrapper {
            width: 100%;
            border: 1.5px solid #000;
            margin-bottom: 6px;
        }

        .header-top {
            display: table;
            width: 100%;
            border-bottom: 1px solid #000;
        }

        .header-top-logo,
        .header-top-title,
        .header-top-meta {
            display: table-cell;
            vertical-align: middle;
            padding: 6px 8px;
        }

        .header-top-logo {
            width: 90px;
            text-align: center;
            border-right: 1px solid #000;
        }

        .header-top-logo img {
            width: 75px;
            height: auto;
        }

        .header-top-title {
            text-align: center;
        }

        .header-top-title .institution {
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }

        .header-top-title .department {
            font-size: 8.5px;
            text-transform: uppercase;
            margin-top: 2px;
            color: #333;
        }

        .header-top-title .doc-title {
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 5px;
            letter-spacing: 0.5px;
            text-decoration: underline;
        }

        .header-top-meta {
            width: 120px;
            border-left: 1px solid #000;
            padding: 0;
        }

        .header-top-meta table {
            width: 100%;
            border-collapse: collapse;
            height: 100%;
        }

        .header-top-meta td {
            border-bottom: 1px solid #000;
            padding: 3px 5px;
            font-size: 8px;
        }

        .header-top-meta tr:last-child td {
            border-bottom: none;
        }

        .header-top-meta .meta-label {
            background: #e0e0e0;
            font-weight: bold;
            width: 45px;
            border-right: 1px solid #000;
        }

        .header-bottom {
            padding: 3px 10px;
            font-size: 8.5px;
            text-align: center;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        /* ══ KPIs ══ */
        .kpis-wrapper { margin-bottom: 6px; }

        .kpis-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
        }

        .kpis-table td {
            border: 1px solid #000;
            padding: 4px 6px;
            text-align: center;
            width: 25%;
        }

        .kpi-label {
            font-size: 7px;
            text-transform: uppercase;
            color: #444;
            margin-bottom: 1px;
        }

        .kpi-value {
            font-size: 15px;
            font-weight: bold;
        }

        /* ══ TABLA PRINCIPAL ══ */
        .main-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }

        .main-table thead tr {
            background-color: #d0d0d0;
        }

        .main-table th {
            border: 1px solid #000;
            padding: 5px 3px;
            text-align: center;
            font-size: 7.5px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.2px;
        }

        .main-table td {
            border: 1px solid #000;
            padding: 5px 3px;
            text-align: center;
            vertical-align: middle;
            font-size: 8px;
            color: #000;
        }

        .main-table td.destino {
            text-align: left;
            padding-left: 5px;
            font-size: 7.5px;
        }

        .main-table td.hora {
            font-weight: bold;
            white-space: nowrap;
        }

        .main-table td.vehiculo {
            font-family: 'DejaVu Sans Mono', monospace;
            font-size: 7.5px;
        }

        .main-table tr.empty-row td {
            height: 20px;
        }

        /* ══ PIE ══ */
        .footer {
            margin-top: 8px;
            border-top: 1.5px solid #000;
            padding-top: 5px;
            display: table;
            width: 100%;
        }

        .footer-left,
        .footer-center,
        .footer-right {
            display: table-cell;
            vertical-align: bottom;
            width: 33.33%;
        }

        .footer-left {
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .footer-center {
            text-align: center;
            font-size: 8px;
        }

        .firma-line {
            border-top: 1px solid #000;
            width: 130px;
            margin: 25px auto 3px;
        }

        .footer-right {
            text-align: right;
            font-size: 7.5px;
            color: #555;
        }
    </style>
</head>
<body>

    {{-- ══ ENCABEZADO ══ --}}
    <div class="header-wrapper">
        <div class="header-top">

            <div class="header-top-logo">
                <img src="{{ public_path('images/logo-azul-fondo-transparente.png') }}" alt="Logo Asamblea">
            </div>

            <div class="header-top-title">
                <div class="institution">Asamblea Legislativa de El Salvador</div>
                <div class="department">Departamento de Transporte</div>
                <div class="doc-title">Plan Diario de Transporte</div>
            </div>

            <div class="header-top-meta">
                <table>
                    <tr>
                        <td class="meta-label">Fecha</td>
                        <td>{{ $fecha->format('d/m/Y') }}</td>
                    </tr>
                    <tr>
                        <td class="meta-label">Día</td>
                        <td>{{ ucfirst($fecha->locale('es')->isoFormat('dddd')) }}</td>
                    </tr>
                    <tr>
                        <td class="meta-label">Turno</td>
                        <td>{{ $turno ?? '—' }}</td>
                    </tr>
                </table>
            </div>

        </div>

        <div class="header-bottom">
            {{ ucfirst($fecha->locale('es')->isoFormat('dddd, D [de] MMMM [de] YYYY')) }}
        </div>
    </div>

    {{-- ══ KPIs ══ --}}
    @if(isset($kpis))
    <div class="kpis-wrapper">
        <table class="kpis-table">
            <tr>
                <td>
                    <div class="kpi-label">Total Misiones</div>
                    <div class="kpi-value">{{ $kpis['total'] ?? 0 }}</div>
                </td>
                <td>
                    <div class="kpi-label">Programadas</div>
                    <div class="kpi-value">{{ $kpis['programadas'] ?? 0 }}</div>
                </td>
                <td>
                    <div class="kpi-label">Asignadas</div>
                    <div class="kpi-value">{{ $kpis['asignadas'] ?? 0 }}</div>
                </td>
                <td>
                    <div class="kpi-label">Completadas</div>
                    <div class="kpi-value">{{ $kpis['completadas'] ?? 0 }}</div>
                </td>
            </tr>
        </table>
    </div>
    @endif

    {{-- ══ TABLA PRINCIPAL ══ --}}
    <table class="main-table">
        <thead>
            <tr>
                <th style="width:9%">Hora de<br>Salida</th>
                <th style="width:15%">Unidad<br>Solicitante</th>
                <th style="width:31%">Destino</th>
                <th style="width:11%">Vehículo</th>
                <th style="width:11%">Motorista</th>
                <th style="width:11%">Usuario</th>
                <th style="width:6%">Estado</th>
                <th style="width:6%">Comuni-<br>cado</th>
            </tr>
        </thead>
        <tbody>
            @forelse($rows as $row)
                <tr>
                    <td class="hora">{{ $row['hora'] }}</td>
                    <td>{{ $row['unidad'] }}</td>
                    <td class="destino">{{ $row['destino'] }}</td>
                    <td class="vehiculo">{{ $row['vehiculo'] }}</td>
                    <td>{{ $row['motorista'] }}</td>
                    <td>{{ $row['solicitante'] }}</td>
                    <td>{{ ucfirst(str_replace('_', ' ', $row['estado'])) }}</td>
                    <td>{{ $row['comunicado'] ?? '' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" style="text-align:center; padding:15px; font-style:italic; color:#666;">
                        No hay misiones programadas para esta fecha.
                    </td>
                </tr>
            @endforelse

            @php $rellenar = max(0, 14 - count($rows)); @endphp
            @for($i = 0; $i < $rellenar; $i++)
                <tr class="empty-row">
                    <td></td><td></td><td></td><td></td>
                    <td></td><td></td><td></td><td></td>
                </tr>
            @endfor
        </tbody>
    </table>

    {{-- ══ PIE ══ --}}
    <div class="footer">
        <div class="footer-left">
            TURNO: {{ $turno ?? 'Sin asignar' }}
        </div>
        <div class="footer-center">
            <div class="firma-line"></div>
            Jefe de Transporte
        </div>
        <div class="footer-right">
            Generado: {{ now()->format('d/m/Y H:i') }}
        </div>
    </div>

</body>
</html>