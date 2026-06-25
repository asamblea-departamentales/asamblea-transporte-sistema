<!doctype html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Hoja de Registro de Vehículos</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 9px;
            color: #333;
            margin: 0;
            padding: 0;
        }

        .header {
            width: 100%;
            margin-bottom: 16px;
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 10px;
        }

        .logo {
            width: 90px;
            float: left;
        }

        .title-container {
            float: right;
            text-align: right;
            width: 75%;
        }

        h2 {
            margin: 0;
            color: #1e3a8a;
            font-size: 16px;
            text-transform: uppercase;
        }

        h3 {
            margin: 2px 0;
            font-size: 11px;
            font-weight: normal;
            color: #1e3a8a;
        }

        .periodo {
            margin: 4px 0 0;
            font-size: 10px;
            color: #555;
        }

        .clearfix { clear: both; }

        .vehiculo-info {
            margin-bottom: 12px;
            padding: 8px 10px;
            background-color: #f0f4f8;
            border-radius: 5px;
            font-size: 10px;
        }

        .vehiculo-info table {
            border: none;
            width: 100%;
        }

        .vehiculo-info td {
            border: none;
            padding: 2px 8px;
            width: 33%;
        }

        .vehiculo-info td:first-child {
            padding-left: 0;
        }

        .vehiculo-info strong {
            color: #1e3a8a;
        }

        table.data {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
        }

        table.data th, table.data td {
            border: 0.5px solid #ccc;
            padding: 4px 5px;
            text-align: left;
            vertical-align: middle;
        }

        table.data th {
            background: #1e3a8a;
            color: white;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 7.5px;
            text-align: center;
        }

        table.data tr:nth-child(even) {
            background: #f8fafc;
        }

        table.data td {
            font-size: 8.5px;
        }

        table.data td.center {
            text-align: center;
        }

        table.data td.right {
            text-align: right;
        }

        .totales {
            margin-top: 10px;
            padding: 6px 10px;
            background-color: #f0f4f8;
            border-radius: 5px;
            font-size: 10px;
            font-weight: bold;
            text-align: right;
        }

        .footer {
            position: fixed;
            bottom: -30px;
            left: 0;
            right: 0;
            height: 30px;
            text-align: center;
            font-size: 8px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">
            <img src="{{ public_path('images/logo-azul-fondo-transparente.png') }}" alt="Asamblea Legislativa">
        </div>
        <div class="title-container">
            <h2>Hoja de Registro de Vehículos</h2>
            <h3>Departamento de Transporte - Asamblea Legislativa</h3>
            <div class="periodo">
                Período: Del {{ \Carbon\Carbon::parse($fechaInicio)->locale('es')->isoFormat('D [de] MMMM [de] YYYY') }}
                al {{ \Carbon\Carbon::parse($fechaFin)->locale('es')->isoFormat('D [de] MMMM [de] YYYY') }}
            </div>
        </div>
        <div class="clearfix"></div>
    </div>

    <div class="vehiculo-info">
        <table>
            <tr>
                <td><strong>Placa:</strong> {{ $datosVehiculo['placa'] }}</td>
                <td><strong>Tipo:</strong> {{ $datosVehiculo['tipo_nombre'] }}</td>
                <td><strong>Combustible:</strong> {{ $datosVehiculo['combustible_nombre'] }}</td>
            </tr>
        </table>
    </div>

    @if($registros->isEmpty())
        <p style="text-align:center;color:#888;margin-top:40px;font-size:12px;">
            No se encontraron registros para el vehículo y período seleccionados.
        </p>
    @else
        <table class="data">
            <thead>
                <tr>
                    <th style="width:9%;">Fecha</th>
                    <th style="width:10%;">KM Inicial</th>
                    <th style="width:10%;">KM Final</th>
                    <th style="width:10%;">KMs Rec.</th>
                    <th style="width:23%;">Lugares Recorridos</th>
                    <th style="width:16%;">Motorista</th>
                    <th style="width:11%;">Tanque Salida</th>
                    <th style="width:11%;">Tanque Regreso</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $totalKm = 0;

                    $fuelColor = function ($pct) {
                        if ($pct === null) return '#ccc';
                        // rojo 0% → amarillo 50% → verde 100%
                        $r = $pct < 50 ? 220 : (int) round(220 - (($pct - 50) / 50) * (220 - 22));
                        $g = $pct < 50 ? (int) round((($pct) / 50) * (180 - 22) + 22) : (int) round(180 - (($pct - 50) / 50) * (180 - 130));
                        $b = $pct < 50 ? (int) round((($pct) / 50) * 8) : 8;
                        return "rgb({$r},{$g},{$b})";
                    };
                @endphp
                @foreach($registros as $r)
                    @php
                        $fecha = $r['fecha'] ? \Carbon\Carbon::parse($r['fecha'])->format('d/m/Y') : '—';
                        $kmInicial = $r['km_inicial'] ?? '—';
                        $kmFinal   = $r['km_final'] ?? '—';
                        $kmRec     = $r['km_recorridos'];
                        $kmRecStr  = $kmRec !== null ? number_format($kmRec, 0) : '—';
                        if ($kmRec !== null) {
                            $totalKm += $kmRec;
                        }

                        $combSalida  = $r['combustible_salida'];
                        $combRegreso = $r['combustible_regreso'];
                    @endphp
                    <tr>
                        <td class="center">{{ $fecha }}</td>
                        <td class="right">{{ is_numeric($kmInicial) ? number_format($kmInicial, 0) : $kmInicial }}</td>
                        <td class="right">{{ is_numeric($kmFinal) ? number_format($kmFinal, 0) : $kmFinal }}</td>
                        <td class="right">{{ $kmRecStr }}</td>
                        <td>{{ $r['lugares'] }}</td>
                        <td>{{ $r['motorista_nombre'] }}</td>
                        <td class="center" style="padding:3px 5px;">
                            @if($combSalida !== null)
                                <div style="width:100%;height:12px;background:#e5e7eb;border-radius:6px;overflow:hidden;">
                                    <div style="width:{{ $combSalida }}%;height:100%;background:{{ $fuelColor($combSalida) }};border-radius:6px;"></div>
                                </div>
                                <span style="font-size:7px;color:#555;">{{ $combSalida }}%</span>
                            @else
                                —
                            @endif
                        </td>
                        <td class="center" style="padding:3px 5px;">
                            @if($combRegreso !== null)
                                <div style="width:100%;height:12px;background:#e5e7eb;border-radius:6px;overflow:hidden;">
                                    <div style="width:{{ $combRegreso }}%;height:100%;background:{{ $fuelColor($combRegreso) }};border-radius:6px;"></div>
                                </div>
                                <span style="font-size:7px;color:#555;">{{ $combRegreso }}%</span>
                            @else
                                —
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="totales">
            Total kilómetros recorridos en el período: {{ number_format($totalKm, 0) }} km
        </div>
    @endif

    <div class="footer">
        Asamblea Legislativa de El Salvador - Sistema de Gestión de Transporte -
        Pág. <script type="text/php">echo $PAGE_NUM . " de " . $PAGE_COUNT;</script>
    </div>
</body>
</html>
