<!doctype html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Reporte Solicitudes de Transporte</title>
    <style>
        /* DejaVu Sans es la fuente recomendada para soportar tildes y eñes en DomPDF */
        body { 
            font-family: 'DejaVu Sans', sans-serif; 
            font-size: 10px; 
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
            width: 150px; /* Ajusta según el tamaño de tu imagen */
            float: left;
        }
        .title-container {
            float: right;
            text-align: right;
            width: 70%;
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
        .meta table { border: none; }
        .meta td { border: none; padding: 2px 0; }
        
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 10px;
        }
        th, td { 
            border: 0.5px solid #ccc; 
            padding: 6px; 
            text-align: left;
            word-wrap: break-word;
        }
        th { 
            background: #1e3a8a; 
            color: white; 
            font-weight: bold;
            text-transform: uppercase;
            font-size: 9px;
        }
        tr:nth-child(even) { background: #f2f2f2; }
        
        .badge {
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
        }
        /* Estilos para estados */
        .status-pendiente { background-color: #fef3c7; color: #92400e; }
        .status-aprobado { background-color: #d1fae5; color: #065f46; }
        .status-rechazado { background-color: #fee2e2; color: #991b1b; }
        
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
            {{-- Usamos base64 para el logo si asset() da problemas en el server --}}
            <img src="{{ public_path('images/logo-azul-fondo-transparente.png') }}" alt="Asamblea Legislativa" class="logo">
        </div>
        <div class="title-container">
            <h2>Transporte y Logística</h2>
            <p>Reporte de Solicitudes de Transporte</p>
        </div>
        <div class="clearfix"></div>
    </div>

    <div class="meta">
        <table>
            <tr>
                <td width="15%"><strong>Rango:</strong></td>
                <td>{{ $rangeLabel }}</td>
                <td width="15%" style="text-align: right;"><strong>Generado:</strong></td>
                <td width="20%" style="text-align: right;">{{ now()->format('d/m/Y H:i') }}</td>
            </tr>
            <tr>
                <td><strong>Total registros:</strong></td>
                <td>{{ $rows->count() }}</td>
                <td colspan="2"></td>
            </tr>
        </table>
    </div>

    <table>
        <thead>
            <tr>
                <th width="10%">Código</th>
                <th width="15%">Unidad</th>
                <th width="15%">Solicitante</th>
                <th width="12%">Salida</th>
                <th>Origen / Destino</th>
                <th width="8%">Prioridad</th>
                <th width="10%">Estado</th>
            </tr>
        </thead>
        <tbody>
            @foreach($rows as $r)
            <tr>
                <td style="font-family: monospace;">{{ $r->codigo }}</td>
                {{-- Limpieza de UTF-8 para evitar caracteres malformados --}}
                <td>{{ mb_convert_encoding($r->unidad?->nombre ?? 'N/A', 'UTF-8', 'UTF-8') }}</td>
                <td>{{ mb_convert_encoding($r->solicitante?->name ?? 'N/A', 'UTF-8', 'UTF-8') }}</td>
                <td>{{ $r->fecha_salida ? $r->fecha_salida->format('d/m/Y H:i') : 'N/A' }}</td>
                <td>
                    <strong>O:</strong> {{ mb_convert_encoding($r->origen, 'UTF-8', 'UTF-8') }}<br>
                    <strong>D:</strong> {{ mb_convert_encoding($r->destino, 'UTF-8', 'UTF-8') }}
                </td>
                <td>
                    @php
                        $prio = $r->prioridad instanceof \UnitEnum ? $r->prioridad->value : $r->prioridad;
                    @endphp
                    {{ strtoupper($prio) }}
                </td>
                <td>
                    @php
                        $est = $r->estado instanceof \UnitEnum ? $r->estado->value : $r->estado;
                    @endphp
                    <span class="badge status-{{ $est }}">
                        {{ ucfirst(str_replace('_', ' ', $est)) }}
                    </span>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Asamblea Legislativa de El Salvador - Sistema de Gestión de Transporte - Página <script type="text/php">echo $PAGE_NUM . " de " . $PAGE_COUNT;</script>
    </div>
</body>
</html>