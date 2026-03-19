<!doctype html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Distribución de Flota Vehicular</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 9px;
            color: #1f2937;
            background: #ffffff;
        }

        /* ── HEADER ─────────────────────────── */
        .header {
            display: table;
            width: 100%;
            margin-bottom: 0;
            padding: 0 0 12px 0;
        }

        .header-logo {
            display: table-cell;
            width: 90px;
            vertical-align: middle;
        }

        .header-logo img {
            width: 80px;
        }

        .header-center {
            display: table-cell;
            vertical-align: middle;
            text-align: center;
        }

        .header-center .inst {
            font-size: 9px;
            color: #6b7280;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 3px;
        }

        .header-center .titulo {
            font-size: 16px;
            font-weight: bold;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .header-right {
            display: table-cell;
            width: 110px;
            vertical-align: middle;
            text-align: right;
            font-size: 8px;
            color: #6b7280;
            line-height: 1.6;
        }

        .header-line {
            border: none;
            border-top: 2px solid #1e3a8a;
            margin-bottom: 10px;
        }

        .header-line-thin {
            border: none;
            border-top: 0.5px solid #d1d5db;
            margin-bottom: 12px;
        }

        /* ── META STRIP ─────────────────────── */
        .meta-strip {
            background: #eff6ff;
            border: 0.5px solid #bfdbfe;
            border-radius: 4px;
            padding: 7px 10px;
            margin-bottom: 14px;
            display: table;
            width: 100%;
        }

        .meta-strip td {
            border: none;
            padding: 0 6px 0 0;
            font-size: 8.5px;
            color: #374151;
            vertical-align: middle;
        }

        .meta-strip .label {
            color: #6b7280;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .meta-strip .value {
            font-weight: bold;
            color: #1e3a8a;
        }

        .meta-divider {
            border-left: 0.5px solid #bfdbfe;
            padding-left: 10px !important;
        }

        /* ── TABLA ──────────────────────────── */
        table.data {
            width: 100%;
            border-collapse: collapse;
            margin-top: 0;
        }

        table.data thead tr {
            background: #1e3a8a;
        }

        table.data th {
            color: #ffffff;
            font-size: 7.5px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            padding: 6px 5px;
            text-align: center;
            border: none;
        }

        table.data th:first-child { border-radius: 3px 0 0 0; }
        table.data th:last-child  { border-radius: 0 3px 0 0; }

        table.data tbody tr:nth-child(even) {
            background: #f0f4ff;
        }

        table.data tbody tr:nth-child(odd) {
            background: #ffffff;
        }

        table.data tbody tr:last-child td:first-child { border-radius: 0 0 0 3px; }
        table.data tbody tr:last-child td:last-child  { border-radius: 0 0 3px 0; }

        table.data td {
            padding: 5px 5px;
            border-bottom: 0.5px solid #e5e7eb;
            border-right: 0.5px solid #e5e7eb;
            vertical-align: middle;
            color: #1f2937;
            font-size: 8.5px;
        }

        table.data td:first-child {
            border-left: 0.5px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 8px;
        }

        .placa {
            font-weight: bold;
            color: #1e3a8a;
            letter-spacing: 0.5px;
        }

        .na {
            color: #9ca3af;
            font-style: italic;
        }

        /* ── FOOTER ─────────────────────────── */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 22px;
            background: #f8fafc;
            border-top: 0.5px solid #d1d5db;
            padding: 0 16px;
            display: table;
            width: 100%;
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
            <div class="titulo">Distribución de Flota Vehicular</div>
        </div>
        <div class="header-right">
            Generado<br>
            <strong>{{ now()->format('d/m/Y') }}</strong><br>
            {{ now()->format('H:i') }} hrs
        </div>
    </div>

    <hr class="header-line">

    {{-- META STRIP --}}
    <table class="meta-strip">
        <tr>
            <td width="12%" class="label">Total vehículos</td>
            <td width="8%" class="value">{{ $rows->count() }}</td>
            <td width="12%" class="label meta-divider">Periodo</td>
            <td class="value">{{ now()->format('d/m/Y') }}</td>
            <td width="25%" style="text-align:right; color:#6b7280; font-size:8px;">
                Sistema de Gestión de Transporte
            </td>
        </tr>
    </table>

    {{-- TABLA PRINCIPAL --}}
    <table class="data">
        <thead>
            <tr>
                <th style="width:3%">#</th>
                <th style="width:7%">Placa</th>
                <th style="width:8%">Marca</th>
                <th style="width:8%">Modelo</th>
                <th style="width:8%">Clase</th>
                <th style="width:6%">Color</th>
                <th style="width:4%">Año</th>
                <th style="width:7%">Combustible</th>
                <th style="width:5%">Cap.</th>
                <th style="width:9%">No. Motor</th>
                <th style="width:9%">Chasis</th>
                <th style="width:9%">VIN</th>
                <th>Asignado a</th>
            </tr>
        </thead>
        <tbody>
            @foreach($rows as $index => $r)
                @php
                    $marca = $r->getRelation('marca')?->nombre ?? $r->getRawOriginal('marca') ?? null;
                    $modelo = $r->getRelation('modelo')?->nombre ?? $r->getRawOriginal('modelo') ?? null;
                @endphp
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td><span class="placa">{{ $r->placa }}</span></td>
                    <td>{{ $marca ?? '<span class="na">—</span>' }}</td>
                    <td>{{ $modelo ?? '<span class="na">—</span>' }}</td>
                    <td>{{ $r->clasificacion?->nombre ?? '<span class="na">—</span>' }}</td>
                    <td>{{ $r->color?->nombre ?? '<span class="na">—</span>' }}</td>
                    <td style="text-align:center">{{ $r->anio ?? '<span class="na">—</span>' }}</td>
                    <td>{{ $r->tipoCombustible?->nombre ?? '<span class="na">—</span>' }}</td>
                    <td style="text-align:center">{{ $r->capacidad_personas ?? '<span class="na">—</span>' }}</td>
                    <td>{{ $r->motor_numero ?? '<span class="na">—</span>' }}</td>
                    <td>{{ $r->chasis ?? '<span class="na">—</span>' }}</td>
                    <td>{{ $r->vin ?? '<span class="na">—</span>' }}</td>
                    <td>{{ $service->resolverAsignadoA($r) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    {{-- FOOTER --}}
    <div class="footer">
        <div class="footer-left">
            Asamblea Legislativa de El Salvador &mdash; Sistema de Gestión de Transporte
        </div>
        <div class="footer-right">
            Página <script type="text/php">echo $PAGE_NUM . " de " . $PAGE_COUNT;</script>
        </div>
    </div>

</body>
</html>