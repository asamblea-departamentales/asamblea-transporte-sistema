<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Liquidación {{ $solicitud->codigo }}</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.5; font-size: 11px; margin: 0; padding: 0; }
        .header-table { width: 100%; border-bottom: 2px solid #1a56db; margin-bottom: 20px; padding-bottom: 10px; }
        .header-logo { width: 80px; }
        .header-logo img { width: 75px; }
        .header-title { text-align: center; }
        .header-title h1 { margin: 0; color: #1a56db; text-transform: uppercase; font-size: 18px; }
        .header-title p { margin: 2px 0; color: #666; font-size: 9px; }
        
        .section-title { background: #f3f4f6; padding: 6px 10px; font-weight: bold; margin-bottom: 12px; border-left: 4px solid #1a56db; text-transform: uppercase; font-size: 10px; }
        
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-table td { padding: 4px 0; vertical-align: top; }
        .label { font-weight: bold; color: #555; width: 20%; }
        .value { width: 30%; }
        
        .totals-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .totals-table th { background: #1a56db; color: white; padding: 8px; text-align: left; font-size: 10px; }
        .totals-table td { padding: 8px; border-bottom: 1px solid #eee; }
        .bg-gray { background: #f9fafb; }
        
        .status-badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
        .status-success { background: #dcfce7; color: #166534; }
        .status-alert { background: #fee2e2; color: #991b1b; }
        
        .footer-signatures { margin-top: 50px; width: 100%; }
        .signature-box { text-align: center; width: 45%; vertical-align: bottom; }
        .signature-line { border-top: 1px solid #333; margin: 0 20px; padding-top: 5px; font-weight: bold; }

        .diferencia-negativa { color: #dc2626; font-weight: bold; }
        .diferencia-positiva { color: #16a34a; font-weight: bold; }
        .obs-box { background: #f9fafb; padding: 10px; border: 1px solid #eee; border-radius: 4px; min-height: 40px; margin-top: 5px; }
    </style>
</head>
<body>

    <table class="header-table">
        <tr>
            <td class="header-logo">
                <img src="{{ public_path('images/logo-azul-fondo-transparente.png') }}" alt="Logo">
            </td>
            <td class="header-title">
                <h1>Comprobante de Liquidación</h1>
                <p>Asamblea Legislativa de El Salvador | Sistema de Gestión de Combustible</p>
            </td>
            <td style="text-align: right; width: 100px; color: #666; font-size: 8px;">
                Generado:<br>
                <strong>{{ now()->format('d/m/Y') }}</strong><br>
                {{ now()->format('H:i') }} hrs
            </td>
        </tr>
    </table>

    <div class="section-title">Datos de la Solicitud</div>
    <table class="info-table">
        <tr>
            <td class="label">Código Control:</td>
            <td class="value"><strong>{{ $solicitud->codigo }}</strong></td>
            <td class="label">Fecha Solicitud:</td>
            <td class="value">{{ $solicitud->created_at->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <td class="label">Vehículo / Placa:</td>
            <td class="value">
                {{ $solicitud->vehiculo?->marca?->nombre }} {{ $solicitud->vehiculo?->modelo?->nombre }} 
                ({{ $solicitud->vehiculo?->placa ?? '-' }})
            </td>
            <td class="label">Solicitante:</td>
            <td class="value">{{ $solicitud->solicitante?->name ?? 'N/A' }}</td>
        </tr>
        <tr>
            <td class="label">Motorista:</td>
            <td class="value" colspan="3">{{ $solicitud->motorista?->nombre ?? 'Asignado a Solicitante' }}</td>
        </tr>
    </table>

    <div class="section-title">Resumen Financiero</div>
    <table class="totals-table">
        <thead>
            <tr>
                <th>Concepto</th>
                <th style="text-align: right;">Monto</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Valor Total de Vales Asignados</td>
                <td style="text-align: right;">${{ number_format($solicitud->valor_total, 2) }}</td>
            </tr>
            <tr class="bg-gray">
                <td>Monto Real Validado (Facturas)</td>
                <td style="text-align: right;"><strong>${{ number_format($liquidacion?->monto_validado ?? 0, 2) }}</strong></td>
            </tr>
            @php
                $diferencia = ($liquidacion?->monto_validado ?? 0) - $solicitud->valor_total;
            @endphp
            <tr>
                <td>Diferencia / Remanente</td>
                <td style="text-align: right;" class="{{ $diferencia < 0 ? 'diferencia-negativa' : 'diferencia-positiva' }}">
                    {{ $diferencia > 0 ? '+' : '' }}${{ number_format($diferencia, 2) }}
                </td>
            </tr>
        </tbody>
    </table>

    <div style="margin-top: 15px;">
        <strong>Resultado:</strong> 
        <span class="status-badge {{ ($liquidacion?->resultado === 'discrepancia') ? 'status-alert' : 'status-success' }}">
            {{ $liquidacion?->resultado ?? 'PENDIENTE' }}
        </span>
    </div>

    <div style="margin-top: 15px;">
        <strong>Observaciones Contables:</strong>
        <div class="obs-box">
            {{ $liquidacion?->observaciones ?? 'Sin observaciones adicionales registradas.' }}
        </div>
    </div>

    <table class="footer-signatures">
        <tr>
            <td class="signature-box">
                <div class="signature-line">Firma Liquidador</div>
                <small>{{ auth()->user()->name }}</small>
            </td>
            <td style="width: 10%;"></td>
            <td class="signature-box">
                <div class="signature-line">Firma Solicitante</div>
                <small>{{ $solicitud->solicitante?->name ?? 'Responsable' }}</small>
            </td>
        </tr>
    </table>

</body>
</html>