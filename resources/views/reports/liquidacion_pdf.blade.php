<!doctype html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Liquidación {{ $solicitud->codigo }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            color: #1f2937;
            background: #ffffff;
        }

        /* ── HEADER ─────────────────────────── */
        .header {
            display: table;
            width: 100%;
            padding-bottom: 12px;
        }

        .header-logo {
            display: table-cell;
            width: 85px;
            vertical-align: middle;
        }

        .header-logo img {
            width: 75px;
        }

        .header-center {
            display: table-cell;
            vertical-align: middle;
            text-align: center;
        }

        .header-center .inst {
            font-size: 8px;
            color: #6b7280;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 3px;
        }

        .header-center .titulo {
            font-size: 15px;
            font-weight: bold;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .header-center .subtitulo {
            font-size: 8px;
            color: #6b7280;
            margin-top: 3px;
        }

        .header-right {
            display: table-cell;
            width: 110px;
            vertical-align: middle;
            text-align: right;
            font-size: 8px;
            color: #6b7280;
            line-height: 1.7;
        }

        .header-right strong {
            color: #1f2937;
        }

        .rule-thick {
            border: none;
            border-top: 2px solid #1e3a8a;
            margin-bottom: 4px;
        }

        .rule-thin {
            border: none;
            border-top: 0.5px solid #d1d5db;
            margin-bottom: 14px;
        }

        /* ── BADGE DE CÓDIGO ────────────────── */
        .codigo-badge {
            background: #eff6ff;
            border: 0.5px solid #bfdbfe;
            border-radius: 4px;
            padding: 7px 12px;
            margin-bottom: 14px;
            display: table;
            width: 100%;
        }

        .codigo-badge td {
            border: none;
            vertical-align: middle;
            padding: 0;
        }

        .codigo-badge .cod-label {
            font-size: 8px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.4px;
        }

        .codigo-badge .cod-value {
            font-size: 13px;
            font-weight: bold;
            color: #1e3a8a;
            letter-spacing: 1px;
        }

        .codigo-badge .estado {
            display: inline-block;
            background: #dcfce7;
            color: #166534;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            padding: 3px 8px;
            border-radius: 3px;
            letter-spacing: 0.3px;
        }

        /* ── SECCIÓN TÍTULO ─────────────────── */
        .section-title {
            font-size: 8.5px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #1e3a8a;
            border-left: 3px solid #1e3a8a;
            padding: 3px 0 3px 8px;
            margin-bottom: 10px;
            background: #f8faff;
        }

        /* ── TABLA INFO ─────────────────────── */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
        }

        .info-table td {
            padding: 5px 8px;
            border-bottom: 0.5px solid #e5e7eb;
            vertical-align: top;
        }

        .info-table tr:last-child td {
            border-bottom: none;
        }

        .info-table .label {
            width: 22%;
            color: #6b7280;
            font-size: 8.5px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .info-table .value {
            width: 28%;
            color: #1f2937;
            font-size: 9.5px;
        }

        /* ── TABLA TOTALES ──────────────────── */
        .totals-table {
            width: 60%;
            margin-left: auto;
            border-collapse: collapse;
            margin-bottom: 16px;
        }

        .totals-table thead tr {
            background: #1e3a8a;
        }

        .totals-table th {
            color: #ffffff;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
            padding: 7px 10px;
            letter-spacing: 0.3px;
            border: none;
        }

        .totals-table th:first-child { border-radius: 3px 0 0 0; }
        .totals-table th:last-child  { border-radius: 0 3px 0 0; }

        .totals-table td {
            padding: 7px 10px;
            border-bottom: 0.5px solid #e5e7eb;
            font-size: 9.5px;
            color: #1f2937;
        }

        .totals-table tr.alt td {
            background: #f0f4ff;
        }

        .totals-table td.monto {
            text-align: right;
            font-weight: bold;
        }

        .totals-table tr.total-row td {
            background: #1e3a8a;
            color: #ffffff;
            font-weight: bold;
            font-size: 10px;
            border: none;
        }

        .totals-table tr.total-row td:first-child { border-radius: 0 0 0 3px; }
        .totals-table tr.total-row td:last-child  { border-radius: 0 0 3px 0; }

        .dif-negativa { color: #dc2626; font-weight: bold; }
        .dif-positiva { color: #16a34a; font-weight: bold; }

        /* ── BLOQUE OBSERVACIONES ───────────── */
        .obs-block {
            background: #f9fafb;
            border: 0.5px solid #e5e7eb;
            border-radius: 4px;
            padding: 9px 11px;
            font-size: 9px;
            color: #374151;
            margin-bottom: 18px;
            line-height: 1.6;
        }

        /* ── FIRMAS ─────────────────────────── */
        .firmas {
            margin-top: 50px;
            width: 100%;
            display: table;
        }

        .firma-box {
            display: table-cell;
            width: 45%;
            text-align: center;
            vertical-align: bottom;
        }

        .firma-nombre {
            font-size: 9px;
            color: #1f2937;
            margin-bottom: 2px;
        }

        .firma-linea {
            border-top: 1px solid #374151;
            margin: 32px auto 5px auto;
            width: 80%;
        }

        .firma-cargo {
            font-size: 8px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        /* ── FOOTER ─────────────────────────── */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 20px;
            background: #f8fafc;
            border-top: 0.5px solid #d1d5db;
            display: table;
            width: 100%;
            padding: 0 14px;
        }

        .footer-left {
            display: table-cell;
            vertical-align: middle;
            font-size: 7.5px;
            color: #9ca3af;
        }

        .footer-right {
            display: table-cell;
            vertical-align: middle;
            text-align: right;
            font-size: 7.5px;
            color: #9ca3af;
        }
    </style>
</head>
<body>

    {{-- ENCABEZADO --}}
    <div class="header">
        <div class="header-logo">
            <img src="{{ public_path('images/logo-azul-fondo-transparente.png') }}" alt="Asamblea Legislativa">
        </div>
        <div class="header-center">
            <div class="inst">Asamblea Legislativa de El Salvador</div>
            <div class="titulo">Comprobante de Liquidación</div>
            <div class="subtitulo">Sistema de Gestión de Combustible</div>
        </div>
        <div class="header-right">
            Generado<br>
            <strong>{{ now()->format('d/m/Y') }}</strong><br>
            {{ now()->format('H:i') }} hrs
        </div>
    </div>

    <hr class="rule-thick">
    <hr class="rule-thin">

    {{-- BADGE CÓDIGO + ESTADO --}}
    <table class="codigo-badge">
        <tr>
            <td>
                <div class="cod-label">Código de Control</div>
                <div class="cod-value">{{ $solicitud->codigo }}</div>
            </td>
            <td style="text-align:right;">
                <span class="estado">{{ $liquidacion->resultado ?? 'PROCESADO' }}</span>
            </td>
        </tr>
    </table>

    {{-- DATOS DE LA SOLICITUD --}}
    <div class="section-title">Datos de la Solicitud</div>
    <table class="info-table">
        <tr>
            <td class="label">Fecha solicitud</td>
            <td class="value">{{ $solicitud->created_at->format('d/m/Y') }}</td>
            <td class="label">Solicitante</td>
            <td class="value">{{ $solicitud->solicitante?->name ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td class="label">Vehículo</td>
            <td class="value">
                {{ $solicitud->vehiculo?->marca?->nombre ?? '' }}
                {{ $solicitud->vehiculo?->modelo?->nombre ?? '' }}
            </td>
            <td class="label">Placa</td>
            <td class="value"><strong>{{ $solicitud->vehiculo?->placa ?? '—' }}</strong></td>
        </tr>
        <tr>
            <td class="label">Motorista</td>
            <td class="value" colspan="3">{{ $solicitud->motorista?->nombre ?? '—' }}</td>
        </tr>
    </table>

    {{-- RESUMEN FINANCIERO --}}
    <div class="section-title">Resumen Financiero</div>

    @php
        $diferencia = ($liquidacion->monto_validado ?? 0) - $solicitud->valor_total;
    @endphp

    <table class="totals-table">
        <thead>
            <tr>
                <th>Concepto</th>
                <th style="text-align:right;">Monto</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Vales asignados</td>
                <td class="monto">${{ number_format($solicitud->valor_total, 2) }}</td>
            </tr>
            <tr class="alt">
                <td>Monto validado (facturas)</td>
                <td class="monto">${{ number_format($liquidacion->monto_validado ?? 0, 2) }}</td>
            </tr>
            <tr class="total-row">
                <td>Diferencia / Remanente</td>
                <td style="text-align:right;">
                    ${{ number_format($diferencia, 2) }}
                </td>
            </tr>
        </tbody>
    </table>

    {{-- OBSERVACIONES --}}
    <div class="section-title">Observaciones Contables</div>
    <div class="obs-block">
        {{ $liquidacion->observaciones ?? 'Sin observaciones adicionales.' }}
    </div>

    {{-- FIRMAS --}}
    <table class="firmas">
        <tr>
            <td class="firma-box">
                <div class="firma-nombre">{{ auth()->user()->name }}</div>
                <div class="firma-linea"></div>
                <div class="firma-cargo">Firma Liquidador</div>
            </td>
            <td style="width:10%;"></td>
            <td class="firma-box">
                <div class="firma-nombre">{{ $solicitud->solicitante?->name ?? 'Responsable' }}</div>
                <div class="firma-linea"></div>
                <div class="firma-cargo">Firma Solicitante / Motorista</div>
            </td>
        </tr>
    </table>

    {{-- FOOTER --}}
    <div class="footer">
        <div class="footer-left">
            Asamblea Legislativa de El Salvador &mdash; Sistema de Gestión de Combustible
        </div>
        <div class="footer-right">
            Página <script type="text/php">echo $PAGE_NUM . " de " . $PAGE_COUNT;</script>
        </div>
    </div>

</body>
</html>