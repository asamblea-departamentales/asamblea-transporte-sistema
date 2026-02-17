<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Reporte Solicitudes de Transporte</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        h2 { margin: 0 0 8px 0; }
        .meta { margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 6px; vertical-align: top; }
        th { background: #f2f2f2; }
    </style>
</head>
<body>
    <h2>Reporte de Solicitudes de Transporte</h2>

    <div class="meta">
        <div><strong>Rango:</strong> {{ $rangeLabel }}</div>
        <div><strong>Generado:</strong> {{ now()->format('d/m/Y H:i') }}</div>
        <div><strong>Total:</strong> {{ $rows->count() }}</div>
    </div>

    <table>
        <thead>
        <tr>
            <th>Código</th>
            <th>Unidad</th>
            <th>Solicitante</th>
            <th>Salida</th>
            <th>Origen</th>
            <th>Destino</th>
            <th>Prioridad</th>
            <th>Estado</th>
        </tr>
        </thead>
        <tbody>
        @foreach($rows as $r)
    <tr>
        <td>{{ $r->codigo }}</td>
        <td>{{ $r->unidad?->nombre ?? 'N/A' }}</td>
        <td>{{ $r->solicitante?->name ?? 'N/A' }}</td>
        <td>{{ $r->fecha_salida ? $r->fecha_salida->format('d/m/Y H:i') : 'N/A' }}</td>
        <td>{{ $r->origen }}</td>
        <td>{{ $r->destino }}</td>
        {{-- CORRECCIÓN AQUÍ: Usamos ->value o ->name --}}
        <td>{{ strtoupper($r->prioridad->value ?? $r->prioridad) }}</td>
        <td>{{ $r->estado->value ?? $r->estado }}</td>
    </tr>
@endforeach
        </tbody>
    </table>
</body>
</html>
