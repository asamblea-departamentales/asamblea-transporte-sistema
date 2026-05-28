<!doctype html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Informe de Distribución de Cupones / Cargas de Combustible</title>
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
            margin-bottom: 16px;
            border-bottom: 2px solid #0891b2;
            padding-bottom: 10px;
        }

        .logo {
            width: 150px;
            float: left;
        }

        .title-container {
            float: right;
            text-align: right;
            width: 70%;
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

        .kpis {
            width: 100%;
            margin-bottom: 12px;
        }

        .kpi-box {
            background-color: #ecfeff;
            border: 1px solid #a5f3fc;
            border-radius: 4px;
            padding: 6px;
            text-align: center;
        }

        .kpi-label {
            font-size: 8px;
            color: #6b7280;
            text-transform: uppercase;
            display: block;
            margin-bottom: 2px;
        }

        .kpi-value {
            font-size: 14px;
            font-weight: bold;
            color: #0891b2;
        }

        .meta {
            margin-bottom: 12px;
            padding: 7px 10px;
            background-color: #ecfeff;
            border-left: 3px solid #0891b2;
        }

        .meta table {
            border: none;
            width: 100%;
        }

        .meta td {
            border: none;
            padding: 2px 0;
        }

        table.main {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }

        table.main th,
        table.main td {
            border: 0.5px solid #d1d5db;
            padding: 4px 4px;
            text-align: left;
            vertical-align: top;
            word-wrap: break-word;
        }

        table.main th {
            background: #0891b2;
            color: #ffffff;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 7px;
            text-align: center;
        }

        table.main td {
            font-size: 8px;
        }

        table.main tr:nth-child(even) {
            background: #f5fdff;
        }

        .badge {
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .estado-borrador { background-color: #f3f4f6; color: #374151; }
        .estado-pendiente { background-color: #ecfeff; color: #0891b2; }
        .estado-en_revision { background-color: #dbeafe; color: #1e40af; }
        .estado-pre_aprobada { background-color: #fff7ed; color: #9a3412; }
        .estado-aprobada { background-color: #d1fae5; color: #065f46; }
        .estado-asignada { background-color: #ede9fe; color: #5b21b6; }
        .estado-completada { background-color: #dcfce7; color: #166534; }
        .estado-rechazada { background-color: #fee2e2; color: #991b1b; }
        .estado-cancelada { background-color: #f3f4f6; color: #6b7280; }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .footer {
            position: fixed;
            bottom: -30px;
            left: 0;
            right: 0;
            height: 30px;
            text-align: center;
            font-size: 8px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>

    <div class="header">
        <div class="logo">
            <img src="{{ public_path('images/logo-azul-fondo-transparente.png') }}"
                 alt="Asamblea Legislativa"
                 style="width:150px;">
        </div>

        <div class="title-container">
            <h2>Transporte y Logística</h2>
            <p style="margin:4px 0 0; color:#6b7280;">
                Informe de Distribución de Cupones / Cargas de Combustible
            </p>
        </div>

        <div class="clearfix"></div>
    </div>

    {{-- KPIs --}}
    <table class="kpis" style="border-collapse: separate; border-spacing: 6px;">
        <tr>
            <td>
                <div class="kpi-box">
                    <span class="kpi-label">Solicitudes atendidas</span>
                    <span class="kpi-value">{{ number_format((float) ($kpis['total_solicitudes'] ?? 0), 0) }}</span>
                </div>
            </td>
            <td>
                <div class="kpi-box">
                    <span class="kpi-label">Total cargas</span>
                    <span class="kpi-value">{{ number_format((float) ($kpis['total_cargas'] ?? 0), 0) }}</span>
                </div>
            </td>
            <td>
                <div class="kpi-box">
                    <span class="kpi-label">Total monto</span>
                    <span class="kpi-value">${{ number_format((float) ($kpis['total_monto'] ?? 0), 2) }}</span>
                </div>
            </td>
            <td>
                <div class="kpi-box">
                    <span class="kpi-label">Total galones</span>
                    <span class="kpi-value">{{ number_format((float) ($kpis['total_galones'] ?? 0), 2) }}</span>
                </div>
            </td>
        </tr>
    </table>

    {{-- Meta --}}
    <div class="meta">
        <table>
            <tr>
                <td width="15%"><strong>Rango:</strong></td>
                <td>{{ $rangeLabel }}</td>
                <td width="15%" style="text-align:right;"><strong>Generado:</strong></td>
                <td width="22%" style="text-align:right;">{{ now()->format('d/m/Y H:i') }}</td>
            </tr>
            <tr>
                <td><strong>Total registros:</strong></td>
                <td>{{ $rows->count() }}</td>
                <td colspan="2"></td>
            </tr>
        </table>
    </div>

    {{-- Tabla --}}
    <table class="main">
        <thead>
            <tr>
                <th width="5%">Fecha</th>
                <th width="7%">Solicitud</th>
                <th width="5%">F. inicio</th>
                <th width="4%">Hora</th>
                <th width="7%">N° Carga / Ticket</th>
                <th width="9%">Solicitante</th>
                <th width="5%">Placa</th>
                <th width="5%">Serie</th>
                <th width="6%">Correlativo</th>
                <th width="4%">Cant.</th>
                <th width="6%">Total</th>
                <th width="12%">Destino / Actividad</th>
                <th width="7%">Contrato / Ref.</th>
                <th width="4%">Comp.</th>
                <th width="5%">Galones</th>
                <th width="5%">P/Galón</th>
                <th width="8%">Motorista</th>
                <th width="6%">Estado</th>
            </tr>
        </thead>
        <tbody>
            @forelse($rows as $r)
                @php
                    $estado = $r->estado instanceof \UnitEnum ? $r->estado->value : (string) $r->estado;

                    $contratoReferencia = '—';
                    if ($r->contrato) {
                        $numeroContrato = $r->contrato->numero_contrato ?? null;
                        $nombreContrato = $r->contrato->nombre ?? null;

                        $contratoReferencia = trim(
                            collect([$numeroContrato, $nombreContrato])
                                ->filter()
                                ->implode(' - ')
                        ) ?: '—';
                    }

                    $fechaAsignacion = $r->fecha_asignacion ? \Carbon\Carbon::parse($r->fecha_asignacion) : null;
                @endphp

                <tr>
                    <td>{{ $fechaAsignacion?->format('d/m/Y') ?? '—' }}</td>
                    <td style="font-family: monospace;">{{ $r->codigo }}</td>
                    <td>{{ optional($r->fecha_inicio_periodo)->format('d/m/Y') ?? '—' }}</td>
                    <td>{{ $fechaAsignacion?->format('H:i') ?? '—' }}</td>
                    <td>{{ $r->numero_vale_ticket ?? '—' }}</td>
                    <td>{{ mb_convert_encoding($r->solicitante?->name ?? '—', 'UTF-8', 'UTF-8') }}</td>
                    <td>{{ $r->vehiculo?->placa ?? '—' }}</td>
                    <td>{{ $r->serieCarga?->nombre ?? '—' }}</td>
                    <td>{{ $service->correlativo($r) }}</td>
                    <td class="text-right">{{ $r->cantidad_vales ?? '—' }}</td>
                    <td class="text-right">
                        ${{ $r->monto_asignado ? number_format((float) $r->monto_asignado, 2) : '—' }}
                    </td>
                    <td>{{ mb_convert_encoding(mb_strimwidth($r->destino_actividad ?? '', 0, 45, '...'), 'UTF-8', 'UTF-8') ?: '—' }}</td>
                    <td>{{ mb_convert_encoding($contratoReferencia, 'UTF-8', 'UTF-8') }}</td>
                    <td class="text-center">{{ $service->comprobantes($r) }}</td>
                    <td class="text-right">
                        {{ $r->cantidad_combustible ? number_format((float) $r->cantidad_combustible, 2) : '—' }}
                    </td>
                    <td class="text-right">
                        ${{ $r->valor_unitario ? number_format((float) $r->valor_unitario, 2) : '—' }}
                    </td>
                    <td>{{ mb_convert_encoding($r->motorista?->nombre ?? '—', 'UTF-8', 'UTF-8') }}</td>
                    <td class="text-center">
                        <span class="badge estado-{{ $estado }}">
                            {{ ucfirst(str_replace('_', ' ', $estado)) }}
                        </span>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="18" class="text-center">
                        No hay registros para mostrar.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Asamblea Legislativa de El Salvador &mdash; Sistema de Gestión de Transporte &mdash;
        Página <script type="text/php">echo $PAGE_NUM . " de " . $PAGE_COUNT;</script>
    </div>

</body>
</html>