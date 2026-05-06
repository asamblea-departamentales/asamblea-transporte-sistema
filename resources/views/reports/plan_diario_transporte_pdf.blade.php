<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            color: #1a1a1a;
            background: #fff;
        }

        /* ── ENCABEZADO ── */
        .header {
            width: 100%;
            margin-bottom: 8px;
        }

        .header-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #1a3a6b;
            padding-bottom: 8px;
            margin-bottom: 6px;
        }

        .header-logo {
            width: 90px;
        }

        .header-logo img {
            width: 80px;
            height: auto;
        }

        .header-title {
            flex: 1;
            text-align: center;
        }

        .header-title .institution {
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            color: #1a3a6b;
            letter-spacing: 0.5px;
        }

        .header-title .department {
            font-size: 9px;
            color: #555;
            text-transform: uppercase;
            margin-top: 2px;
        }

        .header-title .doc-title {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            color: #1a1a1a;
            margin-top: 4px;
            letter-spacing: 0.3px;
        }

        .header-meta {
            width: 130px;
            text-align: right;
        }

        .header-meta table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #aaa;
        }

        .header-meta td {
            border: 1px solid #aaa;
            padding: 2px 5px;
            font-size: 8px;
        }

        .header-meta .meta-label {
            background: #e8ecf0;
            font-weight: bold;
            color: #333;
        }

        /* ── FECHA Y FOLIO ── */
        .subheader {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            padding: 4px 6px;
            background: #f0f4f8;
            border: 1px solid #ccd6e0;
            border-radius: 2px;
        }

        .subheader .fecha {
            font-size: 9.5px;
            font-weight: bold;
            color: #1a3a6b;
            text-transform: uppercase;
        }

        .subheader .folio {
            font-size: 8.5px;
            color: #555;
        }

        /* ── TABLA PRINCIPAL ── */
        .main-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        .main-table thead tr {
            background-color: #1a3a6b;
            color: #fff;
        }

        .main-table thead th {
            border: 1px solid #0f2547;
            padding: 5px 4px;
            text-align: center;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .main-table tbody tr {
            border-bottom: 1px solid #dde3ea;
        }

        /* Filas alternas */
        .main-table tbody tr:nth-child(even) {
            background-color: #f7f9fc;
        }

        .main-table tbody td {
            border: 1px solid #c8d0da;
            padding: 6px 4px;
            text-align: center;
            vertical-align: middle;
            font-size: 8.5px;
            color: #222;
        }

        /* Celda destino: alineación izquierda */
        .main-table tbody td.destino {
            text-align: left;
            padding-left: 6px;
        }

        /* Fila vacía */
        .main-table tbody tr.empty-row td {
            height: 22px;
        }

        /* Celda hora con énfasis */
        .main-table tbody td.hora {
            font-weight: bold;
            white-space: nowrap;
            color: #1a3a6b;
        }

        /* Placa/vehículo */
        .main-table tbody td.vehiculo {
            font-family: 'DejaVu Sans Mono', monospace;
            font-size: 8px;
        }

        /* ── KPIs ── */
        .kpis {
            width: 100%;
            margin-bottom: 8px;
        }

        .kpis table {
            width: 100%;
            border-collapse: collapse;
        }

        .kpis td {
            border: 1px solid #c8d0da;
            padding: 5px 10px;
            text-align: center;
            width: 25%;
        }

        .kpi-label {
            font-size: 7.5px;
            text-transform: uppercase;
            color: #666;
            margin-bottom: 2px;
        }

        .kpi-value {
            font-size: 16px;
            font-weight: bold;
            color: #1a3a6b;
        }

        .kpi-programadas .kpi-value { color: #1d4ed8; }
        .kpi-asignadas   .kpi-value { color: #b45309; }
        .kpi-completadas .kpi-value { color: #15803d; }

        /* ── TURNO / PIE ── */
        .footer {
            margin-top: 10px;
            border-top: 1px solid #1a3a6b;
            padding-top: 6px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }

        .footer .turno {
            font-size: 8.5px;
            font-weight: bold;
            color: #1a3a6b;
            text-transform: uppercase;
        }

        .footer .firma-block {
            text-align: center;
            font-size: 8px;
        }

        .footer .firma-block .firma-line {
            border-top: 1px solid #333;
            width: 140px;
            margin: 20px auto 2px;
        }

        .footer .page-num {
            font-size: 8px;
            color: #888;
        }
    </style>
</head>
<body>

    {{-- ══════════════ ENCABEZADO ══════════════ --}}
    <div class="header">
        <div class="header-top">

            {{-- Logo --}}
            <div class="header-logo">
                <img src="{{ public_path('images/logo-azul-fondo-transparente.png') }}" alt="Logo Asamblea">
            </div>

            {{-- Título central --}}
            <div class="header-title">
                <div class="institution">Asamblea Legislativa de El Salvador</div>
                <div class="department">Departamento de Transporte</div>
                <div class="doc-title">Plan Diario de Transporte</div>
            </div>

            {{-- Metadatos (folio, fecha) --}}
            <div class="header-meta">
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
                        <td class="meta-label">Página</td>
                        <td>1</td>
                    </tr>
                </table>
            </div>

        </div>
    </div>

    {{-- ══════════════ KPIs ══════════════ --}}
    @if(isset($kpis))
    <div class="kpis">
        <table>
            <tr>
                <td>
                    <div class="kpi-label">Total Misiones</div>
                    <div class="kpi-value">{{ $kpis['total'] ?? 0 }}</div>
                </td>
                <td class="kpi-programadas">
                    <div class="kpi-label">Programadas</div>
                    <div class="kpi-value">{{ $kpis['programadas'] ?? 0 }}</div>
                </td>
                <td class="kpi-asignadas">
                    <div class="kpi-label">Asignadas</div>
                    <div class="kpi-value">{{ $kpis['asignadas'] ?? 0 }}</div>
                </td>
                <td class="kpi-completadas">
                    <div class="kpi-label">Completadas</div>
                    <div class="kpi-value">{{ $kpis['completadas'] ?? 0 }}</div>
                </td>
            </tr>
        </table>
    </div>
    @endif

    {{-- ══════════════ TABLA PRINCIPAL ══════════════ --}}
    <table class="main-table">
        <thead>
            <tr>
                <th style="width:9%">Hora de<br>Salida</th>
                <th style="width:14%">Unidad<br>Solicitante</th>
                <th style="width:30%">Destino</th>
                <th style="width:11%">Vehículo</th>
                <th style="width:11%">Motorista</th>
                <th style="width:11%">Usuario</th>
                <th style="width:8%">Estado</th>
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
                    <td colspan="8" style="text-align:center; padding: 15px; color:#888; font-style:italic;">
                        No hay misiones programadas para esta fecha.
                    </td>
                </tr>
            @endforelse

            {{-- Filas vacías para mantener formato tipo planilla --}}
            @if(count($rows) < 12)
                @for($i = count($rows); $i < 12; $i++)
                    <tr class="empty-row">
                        <td></td><td></td><td></td><td></td>
                        <td></td><td></td><td></td><td></td>
                    </tr>
                @endfor
            @endif
        </tbody>
    </table>

    {{-- ══════════════ PIE ══════════════ --}}
    <div class="footer">
        <div class="turno">
            TURNO: {{ $turno ?? 'Sin asignar' }}
        </div>

        <div class="firma-block">
            <div class="firma-line"></div>
            Jefe de Transporte
        </div>

        <div class="page-num">
            Generado: {{ now()->format('d/m/Y H:i') }}
        </div>
    </div>

</body>
</html>