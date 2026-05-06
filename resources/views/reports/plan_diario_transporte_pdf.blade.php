<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        .kpis { margin-bottom: 20px; }
        .kpi-item { display: inline-block; margin-right: 30px; }
        .kpi-value { font-size: 18px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f8f9fa; }
    </style>
</head>
<body>
    <h1>Plan Diario de Transporte - {{ $fecha->format('d/m/Y') }}</h1>

    @if(isset($kpis))
    <div class="kpis">
        <div class="kpi-item">
            <div>Total Misiones</div>
            <div class="kpi-value">{{ $kpis['total'] ?? 0 }}</div>
        </div>
        <div class="kpi-item">
            <div>Programadas</div>
            <div class="kpi-value">{{ $kpis['programadas'] ?? 0 }}</div>
        </div>
        <div class="kpi-item">
            <div>Asignadas</div>
            <div class="kpi-value">{{ $kpis['asignadas'] ?? 0 }}</div>
        </div>
        <div class="kpi-item">
            <div>Completadas</div>
            <div class="kpi-value">{{ $kpis['completadas'] ?? 0 }}</div>
        </div>
    </div>
    @endif

    <table>
        <thead>
            <tr>
                <th>Hora</th>
                <th>Unidad</th>
                <th>Destino</th>
                <th>Vehículo</th>
                <th>Motorista</th>
                <th>Solicitante</th>
                <th>Estado</th>
            </tr>
        </thead>
        <tbody>
            @foreach($rows as $row)
                <tr>
                    <td>{{ $row['hora'] }}</td>
                    <td>{{ $row['unidad'] }}</td>
                    <td>{{ $row['destino'] }}</td>
                    <td>{{ $row['vehiculo'] }}</td>
                    <td>{{ $row['motorista'] }}</td>
                    <td>{{ $row['solicitante'] }}</td>
                    <td>{{ ucfirst(str_replace('_', ' ', $row['estado'])) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>