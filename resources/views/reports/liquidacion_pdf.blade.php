<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Liquidación {{ $solicitud->codigo }}</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.5; font-size: 12px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #1a56db; text-transform: uppercase; font-size: 20px; }
        .header p { margin: 5px 0; color: #666; }
        
        .section-title { background: #f3f4f6; padding: 8px; font-weight: bold; margin-bottom: 15px; border-left: 4px solid #1a56db; }
        
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-table td { padding: 5px 0; vertical-align: top; }
        .label { font-weight: bold; color: #555; width: 30%; }
        
        .totals-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .totals-table th { background: #1a56db; color: white; padding: 10px; text-align: left; }
        .totals-table td { padding: 10px; border-bottom: 1px solid #eee; }
        .bg-gray { background: #f9fafb; }
        
        .status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
        .status-success { background: #dcfce7; color: #166534; }
        
        .footer-signatures { margin-top: 60px; width: 100%; }
        .signature-box { text-align: center; width: 45%; }
        .signature-line { border-top: 1px solid #333; margin-top: 40px; padding-top: 5px; }

        .diferencia-negativa { color: #dc2626; font-weight: bold; }
        .diferencia-positiva { color: #16a34a; font-weight: bold; }
    </style>
</head>
<body>

    <div class="header">
        <h1>Comprobante de Liquidación</h1>
        <p>Sistema de Gestión de Combustible | Fecha: {{ now()->format('d/m/Y H:i') }}</p>
    </div>

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
            <td>{{ $solicitud->vehiculo->marca->nombre ?? '' }} {{ $solicitud->vehiculo->modelo->nombre ?? '' }} ({{ $solicitud->vehiculo->placa ?? '-' }})</td>
            <td class="label">Solicitante:</td>
            <td>{{ $solicitud->solicitante->name ?? 'N/A' }}</td>
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
                <td style="text-align: right;"><strong>${{ number_format($liquidacion->monto_validado ?? 0, 2) }}</strong></td>
            </tr>
            @php
                $diferencia = ($liquidacion->monto_validado ?? 0) - $solicitud->valor_total;
            @endphp
            <tr>
                <td>Diferencia / Remanente</td>
                <td style="text-align: right;" class="{{ $diferencia < 0 ? 'diferencia-negativa' : 'diferencia-positiva' }}">
                    ${{ number_format($diferencia, 2) }}
                </td>
            </tr>
        </tbody>
    </table>

    <div style="margin-top: 20px;">
        <strong>Resultado de Liquidación:</strong> 
        <span class="status-badge status-success">{{ $liquidacion->resultado ?? 'PROCESADO' }}</span>
    </div>

    <div style="margin-top: 20px;">
        <strong>Observaciones Contables:</strong>
        <p style="background: #f9fafb; padding: 10px; border: 1px border #eee; border-radius: 4px;">
            {{ $liquidacion->observaciones ?? 'Sin observaciones adicionales.' }}
        </p>
    </div>

    <table class="footer-signatures">
        <tr>
            <td class="signature-box">
                <div class="signature-line">Firma Liquidador</div>
                <small>{{ auth()->user()->name }}</small>
            </td>
            <td style="width: 10%;"></td>
            <td class="signature-box">
                <div class="signature-line">Firma Solicitante / Motorista</div>
                <small>{{ $solicitud->solicitante->name ?? 'Responsable' }}</small>
            </td>
        </tr>
    </table>

</body>
</html>