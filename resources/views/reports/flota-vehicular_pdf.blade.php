<!doctype html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Distribución de Flota Vehicular</title>
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
            margin-bottom: 20px;
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
            font-size: 18px;
            text-transform: uppercase;
        }

        .clearfix { clear: both; }

        .meta {
            margin-bottom: 15px;
            padding: 8px;
            background-color: #f8fafc;
            border-radius: 5px;
        }

        .meta table { border: none; width: 100%; }
        .meta td { border: none; padding: 2px 0; }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th, td {
            border: 0.5px solid #ccc;
            padding: 5px;
            text-align: left;
            vertical-align: top;
        }

        th {
            background: #1e3a8a;
            color: white;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 8px;
            text-align: center;
        }

        tr:nth-child(even) { background: #f2f2f2; }

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
            <img src="{{ public_path('images/logo-azul-fondo-transparente.png') }}" alt="Asamblea Legislativa" class="logo">
        </div>
        <div class="title-container">
            <h2>Distribución de Flota Vehicular</h2>
            <p>Asamblea Legislativa</p>
        </div>
        <div class="clearfix"></div>
    </div>

    <div class="meta">
        <table>
            <tr>
                <td width="15%"><strong>Generado:</strong></td>
                <td>{{ now()->format('d/m/Y H:i') }}</td>
                <td width="15%" style="text-align: right;"><strong>Total registros:</strong></td>
                <td width="20%" style="text-align: right;">{{ $rows->count() }}</td>
            </tr>
        </table>
    </div>

    <table>
        <thead>
            <tr>
                <th>No.</th>
                <th>Placa</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Clase</th>
                <th>Color</th>
                <th>Año</th>
                <th>Combustible</th>
                <th>Capacidad</th>
                <th>No. Motor</th>
                <th>Chasis</th>
                <th>VIN</th>
                <th>Asignado a</th>
            </tr>
        </thead>
        <tbody>
            @foreach($rows as $index => $r)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $r->placa }}</td>
                    <td>{{ $r->marca?->nombre ?? $r->getAttribute('marca') ?? 'N/A' }}</td>
                    <td>{{ $r->modelo?->nombre ?? $r->getAttribute('modelo') ?? 'N/A' }}</td>
                    <td>{{ $r->clasificacion?->nombre ?? 'N/A' }}</td>
                    <td>{{ $r->color?->nombre ?? 'N/A' }}</td>
                    <td>{{ $r->anio ?? 'N/A' }}</td>
                    <td>{{ $r->tipoCombustible?->nombre ?? 'N/A' }}</td>
                    <td>{{ $r->capacidad_personas ?? 'N/A' }}</td>
                    <td>{{ $r->motor_numero ?? 'N/A' }}</td>
                    <td>{{ $r->chasis ?? 'N/A' }}</td>
                    <td>{{ $r->vin ?? 'N/A' }}</td>
                    <td>{{ $service->resolverAsignadoA($r) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Asamblea Legislativa de El Salvador - Sistema de Gestión de Transporte - Página <script type="text/php">echo $PAGE_NUM . " de " . $PAGE_COUNT;</script>
    </div>
</body>
</html>