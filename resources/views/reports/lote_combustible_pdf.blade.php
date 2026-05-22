<!doctype html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Lote de Combustible</title>

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
            border-bottom: 2px solid #0891b2;
            padding-bottom: 10px;
            margin-bottom: 16px;
        }

        .logo {
            width: 150px;
            float: left;
        }

        .title-container {
            float: right;
            text-align: right;
        }

        h2 {
            margin: 0;
            color: #0891b2;
            font-size: 17px;
            text-transform: uppercase;
        }

        .clearfix {
            clear: both;
        }

        .meta {
            margin-bottom: 12px;
            padding: 7px 10px;
            background: #ecfeff;
            border-left: 3px solid #0891b2;
            line-height: 1.6;
        }

        table.main {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }

        table.main th,
        table.main td {
            border: 0.5px solid #d1d5db;
            padding: 5px 6px;
            text-align: left;
            vertical-align: middle;
        }

        table.main th {
            background: #0891b2;
            color: #fff;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 8px;
            text-align: center;
        }

        table.main tr:nth-child(even) {
            background: #f5fdff;
        }

        .total-row {
            font-weight: bold;
            background: #e0f2fe !important;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .firma-table {
            width: 100%;
            margin-top: 50px;
        }

        .firma-table td {
            text-align: center;
            vertical-align: top;
        }

        .footer {
            position: fixed;
            bottom: -25px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 8px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
            padding-top: 5px;
        }
    </style>
</head>

<body>

    {{-- HEADER --}}
    <div class="header">

        <div class="logo">
            <img
                src="{{ public_path('images/logo-azul-fondo-transparente.png') }}"
                alt="Asamblea Legislativa"
                style="width:150px;"
            >
        </div>

        <div class="title-container">
            <h2>Transporte y Logística</h2>

            <p style="margin:4px 0 0; color:#6b7280;">
                Lote de Combustible —
                {{ $lote->fecha->format('d/m/Y') }}
            </p>
        </div>

        <div class="clearfix"></div>
    </div>

    {{-- META --}}
    <div class="meta">

        <strong>Estado:</strong>
        {{ $lote->estado->label() }}

        &nbsp;|&nbsp;

        <strong>Creado por:</strong>
        {{ $lote->creador->name ?? '—' }}

        &nbsp;|&nbsp;

        <strong>Fecha del lote:</strong>
        {{ $lote->fecha->format('d/m/Y') }}

        <br><br>

        <strong>Total vehículos:</strong>
        {{ $lote->detalles->count() }}

        &nbsp;|&nbsp;

        <strong>Total monto:</strong>
        ${{ number_format($lote->total_monto, 2) }}

        &nbsp;|&nbsp;

        <strong>Total galones:</strong>
        {{ number_format($lote->total_galones ?? 0, 2) }}

        &nbsp;|&nbsp;

        <strong>Generado:</strong>
        {{ now()->format('d/m/Y H:i') }}

        @if ($lote->observaciones)
            <br><br>

            <strong>Observaciones:</strong>
            {{ $lote->observaciones }}
        @endif
    </div>

    {{-- TABLA --}}
    <table class="main">

        <thead>
            <tr>
                <th width="4%">#</th>
                <th width="10%">Placa</th>
                <th width="12%">Ticket</th>
                <th width="10%">Monto</th>
                <th width="12%">Serie</th>
                <th width="12%">Contrato</th>
                <th width="14%">Combustible</th>
                <th width="8%">Galones</th>
                <th width="10%">Estado</th>
                <th width="8%">Solicitud</th>
            </tr>
        </thead>

        <tbody>

            @forelse($lote->detalles as $i => $d)

                <tr>

                    <td class="text-right">
                        {{ $i + 1 }}
                    </td>

                    <td>
                        {{ $d->placa_cache ?? $d->vehiculo->placa ?? '—' }}
                    </td>

                    <td>
                        {{ $d->numero_ticket }}
                    </td>

                    <td class="text-right">
                        ${{ number_format($d->monto_asignado, 2) }}
                    </td>

                    <td>
                        {{ $d->numero_serie ?? '—' }}
                    </td>

                    <td>
                        {{ $d->numero_contrato ?? '—' }}
                    </td>

                    <td>
                        {{ $d->tipoCombustible?->nombre ?? '—' }}
                    </td>

                    <td class="text-right">
                        {{
                            $d->cantidad_galones
                                ? number_format($d->cantidad_galones, 2)
                                : '—'
                        }}
                    </td>

                    <td class="text-center">
                        {{ ucfirst($d->estado_asignacion ?? 'pendiente') }}
                    </td>

                    <td>
                        {{ $d->solicitudCombustible?->codigo ?? '—' }}
                    </td>

                </tr>

            @empty

                <tr>
                    <td colspan="10" class="text-center">
                        Sin vehículos asignados.
                    </td>
                </tr>

            @endforelse

        </tbody>

        @if ($lote->detalles->count() > 0)

            <tfoot>

                <tr class="total-row">

                    <td colspan="4" class="text-right">
                        Vehículos:
                        {{ $lote->detalles->count() }}
                    </td>

                    <td colspan="3" class="text-right">
                        Galones:
                        {{ number_format($lote->total_galones ?? 0, 2) }}
                    </td>

                    <td colspan="3" class="text-right">
                        Total:
                        ${{ number_format($lote->total_monto, 2) }}
                    </td>

                </tr>

            </tfoot>

        @endif

    </table>

    {{-- FIRMAS --}}
    <table class="firma-table">

        <tr>

            <td width="45%">
                <br><br><br>

                ___________________________________

                <br>

                Jefe de Transporte
            </td>

            <td width="10%"></td>

            <td width="45%">
                <br><br><br>

                ___________________________________

                <br>

                Operativo Responsable
            </td>

        </tr>

    </table>

    {{-- FOOTER --}}
    <div class="footer">

        Asamblea Legislativa de El Salvador
        &mdash;
        Sistema de Gestión de Transporte
        &mdash;

        Página
        <script type="text/php">
            echo $PAGE_NUM . " de " . $PAGE_COUNT;
        </script>

    </div>

</body>
</html>