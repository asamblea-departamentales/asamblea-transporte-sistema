<!doctype html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Liquidación {{ $solicitud->codigo }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            color: #333;
            line-height: 1.5;
            font-size: 11px;
        }

        .header {
            display: table;
            width: 100%;
            padding-bottom: 12px;
            margin-bottom: 4px;
        }

        .header-logo {
            display: table-cell;
            width: 80px;
            vertical-align: middle;
        }

        .header-logo img {
            width: 70px;
        }

        .header-content {
            display: table-cell;
            vertical-align: middle;
            text-align: center;
        }

        .header-content h1 {
            margin: 0 0 3px 0;
            color: #1a56db;
            text-transform: uppercase;
            font-size: 18px;
        }

        .header-content p {
            margin: 0;
            color: #666;
            font-size: 10px;
        }

        .header-right {
            display: table-cell;
            width: 80px;
            vertical-align: middle;
        }

        hr { border: none; border-top: 2px solid #eee; margin-bottom: 18px; }

        .section-title {
            background: #f3f4f6;
            padding: 6px 8px;
            font-weight: bold;
            margin-bottom: 12px;
            border-left: 4px solid #1a56db;
            font-size: 10.5px;
        }

        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
        .info-table td { padding: 4px 2px; vertical-align: top; }
        .label { font-weight: bold; color: #555; width: 22%; font-size: 10px; }

        .totals-table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 16px; }
        .totals-table th { background: #1a56db; color: white; padding: 8px 10px; text-align: left; font-size: 10px; }
        .totals-table td { padding: 8px 10px; border-bottom: 1px solid #eee; }
        .bg-gray { background: #f9fafb; }

        .status-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-success { background: #dcfce7; color: #166534; }

        .obs-block {
            background: #f9fafb;
            padding: 9px 11px;
            border: 0.5px solid #e5e7eb;
            border-radius: 4px;
            font-size: 10px;
            color: #374151;
            margin-top: 6px;
        }

        .diferencia-negativa { color: #dc2626; font-weight: bold; }
        .diferencia-positiva { color: #16a34a; font-weight: bold; }

        .firmas { margin-top: 55px; width: 100%; }
        .firma-box { text-align: center; width: 45%; }
        .firma-linea { border-top: 1px solid #333; margin-top: 38px; padding-top: 5px; font-size: 10px; }
    </style>
</head>
<body>

    {{-- ENCABEZADO --}}
    <div class="header">
        <div class="header-logo">
            <img src="{{ public_path('images/logo-azul-fondo-transparente.png') }}" alt="Asamblea Legislativa">
        </div>
        <div class="header-content">
            <h1>Comprobante de Liquidación</h1>
            <p>Sistema de Gestión de Combustible &nbsp;|&nbsp; {{ now()->format('d/m/Y H:i') }}</p>
        </div>
        <div class="header-right"></div>
    </div>

    <hr>

    {{-- DATOS DE LA SOLICITUD --}}
    <div class="section-title">Datos de la Solicitud</div>
    <table class="info-table">
        <tr>
            <td class="label">Código de Control:</td>
            <td><strong>{{ $solicitud->codigo }}</strong></td>
            <td class="label">Fecha Solicitud:</td>
            <td>{{ $solicitud->created_at->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <td class="label">Vehículo / Placa:</td>
            <td>{{ $solicitud->vehiculo?->marca?->nombre ?? '' }} {{ $solicitud->vehiculo?->modelo?->nombre ?? '' }} ({{ $solicitud->vehiculo?->placa ?? '—' }})</td>
            <td class="label">Solicitante:</td>
            <td>{{ $solicitud->solicitante?->name ?? 'N/A' }}</td>
        </tr>
    </table>

    {{-- RESUMEN FINANCIERO --}}
    <div class="section-title">Resumen Financiero</div>
    <table class="totals-table">
        <thead>
            <tr>
                <th>Concepto</th>
                <th style="text-align:right;">Monto</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Valor Total de Vales Asignados</td>
                <td style="text-align:right;">${{ number_format($solicitud->valor_total, 2) }}</td>
            </tr>
            <tr class="bg-gray">
                <td>Monto Real Validado (Facturas)</td>
                <td style="text-align:right;"><strong>${{ number_format($liquidacion->monto_validado ?? 0, 2) }}</strong></td>
            </tr>
            @php $diferencia = ($liquidacion->monto_validado ?? 0) - $solicitud->valor_total; @endphp
            <tr>
                <td>Diferencia / Remanente</td>
                <td style="text-align:right;" class="{{ $diferencia < 0 ? 'diferencia-negativa' : 'diferencia-positiva' }}">
                    ${{ number_format($diferencia, 2) }}
                </td>
            </tr>
        </tbody>
    </table>

    <p style="margin-bottom: 16px;">
        <strong>Resultado de Liquidación:</strong>&nbsp;
        <span class="status-badge status-success">{{ $liquidacion->resultado ?? 'PROCESADO' }}</span>
    </p>

    {{-- OBSERVACIONES --}}
    <div class="section-title">Observaciones Contables</div>
    <div class="obs-block">
        {{ $liquidacion->observaciones ?? 'Sin observaciones adicionales.' }}
    </div>

    {{-- FIRMAS --}}
    <table class="firmas">
        <tr>
            <td class="firma-box">
                <div class="firma-linea">Firma Liquidador</div>
                <small>{{ auth()->user()->name }}</small>
            </td>
            <td style="width:10%;"></td>
            <td class="firma-box">
                <div class="firma-linea">Firma Solicitante / Motorista</div>
                <small>{{ $solicitud->solicitante?->name ?? 'Responsable' }}</small>
            </td>
        </tr>
    </table>

</body>
</html>