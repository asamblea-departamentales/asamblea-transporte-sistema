<!doctype html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Plan Diario de Transporte</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 12mm 10mm 22mm 10mm;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            color: #000;
            line-height: 1.3;
        }

        .page-container {
            width: 88%;
            margin: 0 auto;
        }

        /* =========================
           HEADER INSTITUCIONAL
        ========================== */

        .header {
            width: 100%;
            margin-bottom: 10px;
            border-bottom: 2.5px solid #000;
            padding-bottom: 10px;
        }

        .header:after {
            content: '';
            display: table;
            clear: both;
        }

        .header-logo {
            float: left;
            width: 85px;
        }

        .header-logo img {
            width: 75px;
            height: auto;
        }

        .header-meta {
            float: right;
            text-align: right;
            font-size: 8px;
            line-height: 1.7;
        }

        .header-meta strong {
            font-weight: bold;
        }

        .header-title {
            text-align: center;
            padding-top: 8px;
        }

        .header-institution {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .header-department {
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 2px;
        }

        .header-document {
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 5px;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            display: inline-block;
            padding: 2px 20px;
        }

        /* =========================
           KPIs
        ========================== */

        .kpi-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }

        .kpi-table td {
            border: 1px solid #000;
            padding: 4px;
            text-align: center;
            width: 25%;
        }

        .kpi-label {
            font-size: 7px;
            text-transform: uppercase;
            font-weight: bold;
        }

        .kpi-value {
            font-size: 16px;
            font-weight: bold;
        }

        /* =========================
           TABLA PRINCIPAL
        ========================== */

        .main-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .main-table th,
        .main-table td {
            border: 1px solid #000;
            padding: 3px 4px;
            vertical-align: middle;
            text-align: center;
            word-wrap: break-word;
        }

        .main-table th {
            font-size: 7.5px;
            font-weight: bold;
            text-transform: uppercase;
            background: #f0f0f0;
            height: 28px;
        }

        .main-table td {
            font-size: 8px;
            height: 52px;
        }

        .main-table tr:nth-child(even) td {
            background: #f7f7f7;
        }

        .col-hora {
            width: 8%;
            font-weight: bold;
        }

        .col-unidad {
            width: 14%;
        }

        .col-destino {
            width: 38%;
            text-align: left;
            padding-left: 5px;
        }

        .col-vehiculo {
            width: 13%;
        }

        .col-motorista {
            width: 12%;
        }

        .col-usuario {
            width: 10%;
        }

        .col-comunicado {
            width: 5%;
        }

        .empty-row td {
            height: 54px;
        }

        .no-data {
            padding: 30px;
            text-align: center;
            font-style: italic;
        }

        /* =========================
           FOOTER
        ========================== */

        .footer-section {
            margin-top: 28px;
            width: 100%;
        }

        .footer-section:after {
            content: '';
            display: table;
            clear: both;
        }

        .turno-section {
            float: left;
            width: 50%;
            font-size: 10px;
            font-weight: bold;
            padding-top: 6px;
        }

        .turno-line {
            display: inline-block;
            border-bottom: 1px solid #000;
            width: 160px;
            height: 14px;
            margin-left: 5px;
        }

        .signature-section {
            float: right;
            width: 50%;
            text-align: center;
        }

        .signature-line {
            border-top: 1px solid #000;
            width: 180px;
            margin: 25px auto 5px;
        }

        .signature-label {
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .page-footer {
            position: fixed;
            bottom: -20px;
            left: 0;
            right: 0;
            height: 20px;
            text-align: center;
            font-size: 7px;
            border-top: 0.5px solid #999;
            padding-top: 4px;
        }
    </style>
</head>
<body>

<div class="page-container">

    {{-- HEADER INSTITUCIONAL --}}
    <div class="header">
        <div class="header-logo">
            <img src="{{ public_path('images/logo-azul-fondo-transparente.png') }}" alt="Logo">
        </div>

        <div class="header-meta">
            <div><strong>Fecha:</strong> {{ $fecha->format('d/m/Y') }}</div>
            <div><strong>Día:</strong> {{ ucfirst($fecha->locale('es')->isoFormat('dddd')) }}</div>
            <div><strong>Generado:</strong> {{ now()->format('d/m/Y H:i') }}</div>
        </div>

        <div class="header-title">
            <div class="header-institution">Asamblea Legislativa de El Salvador</div>
            <div class="header-department">Departamento de Transporte</div>
            <div class="header-document">Plan Diario de Transporte</div>
        </div>
    </div>

    {{-- KPIs --}}
    @if(isset($kpis) && $kpis['total'] > 0)
    <table class="kpi-table">
        <tr>
            <td>
                <div class="kpi-label">Programadas</div>
                <div class="kpi-value">{{ $kpis['programadas'] }}</div>
            </td>
            <td>
                <div class="kpi-label">Asignadas</div>
                <div class="kpi-value">{{ $kpis['asignadas'] }}</div>
            </td>
            <td>
                <div class="kpi-label">Completadas</div>
                <div class="kpi-value">{{ $kpis['completadas'] }}</div>
            </td>
            <td>
                <div class="kpi-label">Total</div>
                <div class="kpi-value">{{ $kpis['total'] }}</div>
            </td>
        </tr>
    </table>
    @endif

    {{-- TABLA PRINCIPAL --}}
    <table class="main-table">
        <thead>
            <tr>
                <th class="col-hora">Hora</th>
                <th class="col-unidad">Unidad</th>
                <th class="col-destino">Destino</th>
                <th class="col-vehiculo">Vehículo</th>
                <th class="col-motorista">Motorista</th>
                <th class="col-usuario">Usuario</th>
                <th class="col-comunicado">Com.</th>
            </tr>
        </thead>
        <tbody>
            @forelse($rows as $row)
            <tr>
                <td class="col-hora">{{ $row['hora'] }}</td>
                <td>{{ $row['unidad'] }}</td>
                <td class="col-destino">{{ $row['destino'] }}</td>
                <td>{{ $row['vehiculo'] }}</td>
                <td>{{ $row['motorista'] }}</td>
                <td>{{ $row['solicitante'] }}</td>
                <td>{{ $row['comunicado'] ?? '' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="7" class="no-data">No hay registros para la fecha seleccionada.</td>
            </tr>
            @endforelse

            @php
                $relleno = max(0, 10 - count($rows));
            @endphp

            @for($i = 0; $i < $relleno; $i++)
            <tr class="empty-row">
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
            @endfor
        </tbody>
    </table>

    {{-- FOOTER --}}
    <div class="footer-section">
        <div class="turno-section">
            TURNO:
            <span class="turno-line"></span>
        </div>

        <div class="signature-section">
            <div class="signature-line"></div>
            <div class="signature-label">Jefe de Transporte</div>
        </div>
    </div>

</div>

<div class="page-footer">
    Asamblea Legislativa de El Salvador — Sistema de Gestión de Transporte —
    Pág. <script type="text/php">echo $PAGE_NUM . " de " . $PAGE_COUNT;</script>
</div>

</body>
</html>