<!doctype html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Informe de Distribución de Cupones / Cargas de Combustible</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 9.5px;
            color: #1a2035;
            background: #ffffff;
            padding: 0 2px;
        }

        /* ─── HEADER ─── */
        .header-wrap {
            width: 100%;
            border-bottom: 3px solid #0f2744;
            padding-bottom: 10px;
            margin-bottom: 14px;
        }

        .header-logo {
            float: left;
            width: 130px;
        }

        .header-logo img {
            width: 120px;
        }

        .header-titles {
            float: right;
            text-align: right;
            width: calc(100% - 145px);
        }

        .header-dept {
            font-size: 8px;
            font-weight: bold;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #0891b2;
            margin-bottom: 4px;
        }

        .header-main-title {
            font-size: 16px;
            font-weight: bold;
            color: #0f2744;
            line-height: 1.2;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .header-subtitle {
            font-size: 8.5px;
            color: #64748b;
            margin-top: 3px;
            letter-spacing: 0.3px;
        }

        .clearfix { clear: both; }

        /* ─── KPIs ─── */
        .kpis-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 8px;
            margin-bottom: 12px;
        }

        .kpi-cell {
            width: 25%;
        }

        .kpi-box {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-top: 3px solid #0891b2;
            border-radius: 4px;
            padding: 8px 10px;
            text-align: center;
        }

        .kpi-icon-row {
            font-size: 7px;
            font-weight: bold;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 4px;
        }

        .kpi-value {
            font-size: 18px;
            font-weight: bold;
            color: #0f2744;
            line-height: 1;
        }

        .kpi-label {
            font-size: 7px;
            color: #94a3b8;
            margin-top: 3px;
        }

        /* ─── META BAND ─── */
        .meta-band {
            width: 100%;
            background: #0f2744;
            border-radius: 4px;
            padding: 7px 12px;
            margin-bottom: 12px;
        }

        .meta-band table {
            width: 100%;
            border-collapse: collapse;
        }

        .meta-band td {
            color: #cbd5e1;
            font-size: 8.5px;
            padding: 2px 0;
            border: none;
        }

        .meta-band .meta-label {
            color: #94a3b8;
            font-size: 7.5px;
            letter-spacing: 0.8px;
            text-transform: uppercase;
        }

        .meta-band .meta-value {
            color: #f1f5f9;
            font-weight: bold;
        }

        .meta-divider {
            border-left: 1px solid #334155;
            padding-left: 12px;
            margin-left: 12px;
        }

        /* ─── SECTION LABEL ─── */
        .section-label {
            font-size: 7px;
            font-weight: bold;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #0891b2;
            margin-bottom: 5px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 3px;
        }

        /* ─── MAIN TABLE ─── */
        table.main {
            width: 100%;
            border-collapse: collapse;
            margin-top: 0;
        }

        table.main thead tr {
            background: #0f2744;
        }

        table.main th {
            color: #e2e8f0;
            font-weight: bold;
            font-size: 7px;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            text-align: center;
            padding: 6px 5px;
            border: none;
            border-right: 1px solid #1e3a5f;
        }

        table.main th:last-child {
            border-right: none;
        }

        table.main tbody tr {
            border-bottom: 0.5px solid #e2e8f0;
        }

        table.main tbody tr:nth-child(even) {
            background: #f8fbff;
        }

        table.main tbody tr:nth-child(odd) {
            background: #ffffff;
        }

        table.main td {
            padding: 5px 5px;
            font-size: 8.5px;
            color: #1e293b;
            vertical-align: middle;
            border: none;
            border-right: 0.5px solid #f1f5f9;
        }

        table.main td:last-child {
            border-right: none;
        }

        .td-mono {
            font-family: 'DejaVu Sans Mono', monospace;
            font-size: 8px;
            color: #0f2744;
            font-weight: bold;
        }

        .td-muted {
            color: #94a3b8;
        }

        .text-right { text-align: right; }
        .text-center { text-align: center; }

        .amount-col {
            font-weight: bold;
            color: #0f2744;
            text-align: right;
        }

        /* ─── EMPTY ROW ─── */
        .empty-row td {
            padding: 20px;
            text-align: center;
            color: #94a3b8;
            font-style: italic;
        }

        /* ─── BADGES ─── */
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 7px;
            font-weight: bold;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .estado-borrador     { background: #f1f5f9; color: #475569; border: 0.5px solid #cbd5e1; }
        .estado-pendiente    { background: #ecfeff; color: #0e7490; border: 0.5px solid #a5f3fc; }
        .estado-en_revision  { background: #eff6ff; color: #1d4ed8; border: 0.5px solid #bfdbfe; }
        .estado-pre_aprobada { background: #fff7ed; color: #c2410c; border: 0.5px solid #fed7aa; }
        .estado-aprobada     { background: #f0fdf4; color: #15803d; border: 0.5px solid #bbf7d0; }
        .estado-asignada     { background: #f5f3ff; color: #6d28d9; border: 0.5px solid #ddd6fe; }
        .estado-completada   { background: #dcfce7; color: #166534; border: 0.5px solid #86efac; }
        .estado-rechazada    { background: #fef2f2; color: #b91c1c; border: 0.5px solid #fecaca; }
        .estado-cancelada    { background: #f8fafc; color: #64748b; border: 0.5px solid #e2e8f0; }

        /* ─── FOOTER ─── */
        .footer {
            position: fixed;
            bottom: -28px;
            left: 0;
            right: 0;
            height: 28px;
            border-top: 2px solid #0f2744;
            padding-top: 5px;
        }

        .footer-left {
            float: left;
            font-size: 7.5px;
            color: #64748b;
        }

        .footer-right {
            float: right;
            font-size: 7.5px;
            color: #0f2744;
            font-weight: bold;
        }

        .footer-brand {
            color: #0891b2;
            font-weight: bold;
        }
    </style>
</head>
<body>

    {{-- HEADER --}}
    <div class="header-wrap">
        <div class="header-logo">
            <img src="{{ public_path('images/logo-azul-fondo-transparente.png') }}"
                 alt="Asamblea Legislativa">
        </div>
        <div class="header-titles">
            <div class="header-dept">Asamblea Legislativa de El Salvador</div>
            <div class="header-main-title">Transporte y Logística</div>
            <div class="header-subtitle">Informe de Distribución de Cupones / Cargas de Combustible</div>
        </div>
        <div class="clearfix"></div>
    </div>

    {{-- KPIs --}}
    <table class="kpis-table">
        <tr>
            <td class="kpi-cell">
                <div class="kpi-box">
                    <div class="kpi-icon-row">Solicitudes</div>
                    <div class="kpi-value">{{ number_format((float) ($kpis['total_solicitudes'] ?? 0), 0) }}</div>
                    <div class="kpi-label">Atendidas</div>
                </div>
            </td>
            <td class="kpi-cell">
                <div class="kpi-box">
                    <div class="kpi-icon-row">Cargas</div>
                    <div class="kpi-value">{{ number_format((float) ($kpis['total_cargas'] ?? 0), 0) }}</div>
                    <div class="kpi-label">Total registradas</div>
                </div>
            </td>
            <td class="kpi-cell">
                <div class="kpi-box">
                    <div class="kpi-icon-row">Monto total</div>
                    <div class="kpi-value">${{ number_format((float) ($kpis['total_monto'] ?? 0), 2) }}</div>
                    <div class="kpi-label">USD asignado</div>
                </div>
            </td>
            <td class="kpi-cell">
                <div class="kpi-box">
                    <div class="kpi-icon-row">Galones</div>
                    <div class="kpi-value">{{ number_format((float) ($kpis['total_galones'] ?? 0), 2) }}</div>
                    <div class="kpi-label">Total distribuidos</div>
                </div>
            </td>
        </tr>
    </table>

    {{-- META BAND --}}
    <div class="meta-band">
        <table>
            <tr>
                <td width="12%">
                    <div class="meta-label">Período</div>
                    <div class="meta-value">{{ $rangeLabel }}</div>
                </td>
                <td width="1%" style="border-left: 1px solid #334155; padding: 0;"></td>
                <td width="12%" style="padding-left: 12px;">
                    <div class="meta-label">Total registros</div>
                    <div class="meta-value">{{ $rows->count() }}</div>
                </td>
                <td width="1%" style="border-left: 1px solid #334155; padding: 0;"></td>
                <td style="text-align: right; padding-left: 12px;">
                    <div class="meta-label">Generado</div>
                    <div class="meta-value">{{ now()->format('d/m/Y \a \l\a\s H:i') }}</div>
                </td>
            </tr>
        </table>
    </div>

    {{-- TABLE LABEL --}}
    <div class="section-label">Detalle de solicitudes</div>

    {{-- MAIN TABLE --}}
    <table class="main">
        <thead>
            <tr>
                <th width="5%">Fecha</th>
                <th width="8%">Solicitud</th>
                <th width="7%">Inicio</th>
                <th width="5%">Hora</th>
                <th width="8%">N° Carga / Ticket</th>
                <th width="9%">Solicitante</th>
                <th width="6%">Placa</th>
                <th width="6%">Serie</th>
                <th width="7%">Correlativo</th>
                <th width="5%">Cant.</th>
                <th width="7%">Total</th>
                <th width="11%">Destino / Actividad</th>
                <th width="8%">Contrato</th>
                <th width="5%">Comp.</th>
                <th width="5%">Galones</th>
                <th width="6%">P/Galón</th>
                <th width="8%">Motorista</th>
                <th width="7%">Estado</th>
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

                    $fechaAsignacion = $r->fecha_asignacion
                        ? \Carbon\Carbon::parse($r->fecha_asignacion)
                        : null;
                @endphp
                <tr>
                    <td class="text-center">
                        {{ $fechaAsignacion?->format('d/m/Y') ?? '—' }}
                    </td>
                    <td class="td-mono text-center">
                        {{ $r->codigo }}
                    </td>
                    <td class="text-center">
                        {{ optional($r->fecha_inicio_periodo)->format('d/m/Y') ?? '—' }}
                    </td>
                    <td class="text-center td-muted">
                        {{ $fechaAsignacion?->format('H:i') ?? '—' }}
                    </td>
                    <td class="text-center">
                        {{ $r->numero_vale_ticket ?? '—' }}
                    </td>
                    <td>
                        {{ mb_convert_encoding($r->solicitante?->name ?? '—', 'UTF-8', 'UTF-8') }}
                    </td>
                    <td class="text-center td-mono">
                        {{ $r->vehiculo?->placa ?? '—' }}
                    </td>
                    <td class="text-center">
                        {{ $r->serieCarga?->nombre ?? '—' }}
                    </td>
                    <td class="text-center">
                        {{ $service->correlativo($r) }}
                    </td>
                    <td class="text-right">
                        {{ $r->cantidad_vales ?? '—' }}
                    </td>
                    <td class="amount-col">
                        ${{ $r->monto_asignado ? number_format((float) $r->monto_asignado, 2) : '—' }}
                    </td>
                    <td class="td-muted">
                        {{ mb_convert_encoding(mb_strimwidth($r->destino_actividad ?? '', 0, 40, '…'), 'UTF-8', 'UTF-8') ?: '—' }}
                    </td>
                    <td class="td-muted" style="font-size:8px;">
                        {{ mb_convert_encoding($contratoReferencia, 'UTF-8', 'UTF-8') }}
                    </td>
                    <td class="text-center">
                        {{ $service->comprobantes($r) }}
                    </td>
                    <td class="text-right">
                        {{ $r->cantidad_combustible ? number_format((float) $r->cantidad_combustible, 2) : '—' }}
                    </td>
                    <td class="amount-col" style="font-size:8px;">
                        ${{ $r->valor_unitario ? number_format((float) $r->valor_unitario, 2) : '—' }}
                    </td>
                    <td>
                        {{ mb_convert_encoding($r->motorista?->nombre ?? '—', 'UTF-8', 'UTF-8') }}
                    </td>
                    <td class="text-center">
                        <span class="badge estado-{{ $estado }}">
                            {{ ucfirst(str_replace('_', ' ', $estado)) }}
                        </span>
                    </td>
                </tr>
            @empty
                <tr class="empty-row">
                    <td colspan="18">No hay registros para mostrar.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    {{-- FOOTER --}}
    <div class="footer">
        <div class="footer-left">
            <span class="footer-brand">Asamblea Legislativa</span> &mdash;
            Sistema de Gestión de Transporte &mdash; Uso interno
        </div>
        <div class="footer-right">
            Página <script type="text/php">echo $PAGE_NUM . " de " . $PAGE_COUNT;</script>
        </div>
        <div class="clearfix"></div>
    </div>

</body>
</html>