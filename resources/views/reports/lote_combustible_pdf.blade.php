<!doctype html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Lote de Combustible</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 10px; color: #1f2937; margin: 0; padding: 0; }
        .header { width: 100%; border-bottom: 2px solid #0891b2; padding-bottom: 10px; margin-bottom: 16px; }
        .logo { width: 150px; float: left; }
        .title-container { float: right; text-align: right; }
        h2 { margin: 0; color: #0891b2; font-size: 17px; text-transform: uppercase; }
        .clearfix { clear: both; }
        .meta { margin-bottom: 12px; padding: 7px 10px; background: #ecfeff; border-left: 3px solid #0891b2; }
        .fecha { color: #6b7280; margin: 4px 0 0; }
        table.main { width: 100%; border-collapse: collapse; margin-top: 8px; }
        table.main th, table.main td { border: 0.5px solid #d1d5db; padding: 5px 6px; text-align: left; }
        table.main th { background: #0891b2; color: #fff; font-weight: bold; text-transform: uppercase; font-size: 8px; text-align: center; }
        table.main tr:nth-child(even) { background: #f5fdff; }
        .total-row { font-weight: bold; background: #e0f2fe !important; }
        .text-right { text-align: right; }
        .footer { position: fixed; bottom: -30px; left: 0; right: 0; text-align: center; font-size: 8px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">
            <img src="{{ public_path('images/logo-azul-fondo-transparente.png') }}" alt="Asamblea Legislativa" style="width:150px;">
        </div>
        <div class="title-container">
            <h2>Transporte y Logística</h2>
            <p class="fecha">Lote de Combustible — {{ $lote->fecha->format('d/m/Y') }}</p>
        </div>
        <div class="clearfix"></div>
    </div>

    <div class="meta">
        <strong>Estado:</strong> {{ ucfirst($lote->estado->value) }} &nbsp;|&nbsp;
        <strong>Creado por:</strong> {{ $lote->creador->name ?? '—' }} &nbsp;|&nbsp;
        <strong>Fecha:</strong> {{ $lote->fecha->format('d/m/Y') }}
        @if ($lote->observaciones)
            <br><strong>Observaciones:</strong> {{ $lote->observaciones }}
        @endif
    </div>

    <table class="main">
        <thead>
            <tr>
                <th width="8%">#</th>
                <th width="15%">Placa</th>
                <th width="30%">Ticket</th>
                <th width="22%">Monto</th>
                <th width="25%">Solicitud</th>
            </tr>
        </thead>
        <tbody>
            @forelse($lote->detalles as $i => $d)
                <tr>
                    <td class="text-right">{{ $i + 1 }}</td>
                    <td>{{ $d->placa_cache ?? $d->vehiculo->placa ?? '—' }}</td>
                    <td>{{ $d->numero_ticket }}</td>
                    <td class="text-right">${{ number_format($d->monto_asignado, 2) }}</td>
                    <td>{{ $d->solicitudCombustible?->codigo ?? '—' }}</td>
                </tr>
            @empty
                <tr><td colspan="5" class="text-right">Sin vehículos asignados.</td></tr>
            @endforelse
        </tbody>
        @if ($lote->detalles->count() > 0)
        <tfoot>
            <tr class="total-row">
                <td colspan="2" class="text-right">Total {{ $lote->detalles->count() }} vehículos</td>
                <td colspan="3" class="text-right">${{ number_format($lote->total_monto, 2) }}</td>
            </tr>
        </tfoot>
        @endif
    </table>

    <div class="footer">
        Asamblea Legislativa de El Salvador &mdash; Sistema de Gestión de Transporte &mdash;
        Página <script type="text/php">echo $PAGE_NUM . " de " . $PAGE_COUNT;</script>
    </div>
</body>
</html>
