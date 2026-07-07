<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject }}</title>
    <style>
        * { margin:0; padding:0; }
        body {
            font-family:Arial,Helvetica,sans-serif;
            background-color:#f4f7fa;
            padding:20px;
            color:#2c3e50;
            line-height:1.6;
        }
        .email-container {
            max-width:600px;
            margin:0 auto;
            background-color:#ffffff;
            border:1px solid #e2e8f0;
        }
        .email-header {
            background-color:#1e3a8a;
            padding:20px 20px 16px;
            color:#ffffff;
            text-align:center;
        }
        .email-logo-img {
            display:block;
            width:180px;
            max-width:180px;
            height:auto;
            border:0;
            margin:0 auto;
        }
        .email-header-text h1 {
            margin:0 0 4px;
            font-size:20px;
            line-height:1.3;
            color:#ffffff;
            font-weight:700;
        }
        .email-header-text p {
            margin:0;
            font-size:13px;
            line-height:1.5;
            color:#e0e7ff;
        }
        .email-body { padding:20px 20px 16px; }
        @media (prefers-color-scheme:dark) {
            body { background-color:#1a1a2e !important; color:#e2e8f0 !important; }
            .email-container { background-color:#16213e !important; border-color:#2a2a4a !important; }
            .email-body { background-color:#16213e !important; }
            .email-header { background-color:#0f3460 !important; }
            .email-header-text h1 { color:#ffffff !important; }
            .email-header-text p { color:#c7d2fe !important; }
            .alert-box { background-color:#1e2a4a !important; color:#93c5fd !important; border-left-color:#3b82f6 !important; }
            .tipo-chip { background-color:#1e3a5f !important; color:#93c5fd !important; }
            .codigo-section { background-color:#1a2744 !important; border-color:#3b82f6 !important; }
            .codigo-value { color:#93c5fd !important; }
            .info-card { background-color:#1e2a4a !important; border-color:#2a3a5a !important; border-left-color:#3b82f6 !important; color:#e2e8f0 !important; }
            .info-card-title { color:#94a3b8 !important; border-bottom-color:#2a3a5a !important; }
            .info-row { color:#e2e8f0 !important; }
            .info-row strong { color:#94a3b8 !important; }
            .route-boss { background-color:#3a2718 !important; border-left-color:#f97316 !important; color:#fed7aa !important; }
            .route-boss strong, .route-boss-title { color:#fdba74 !important; }
            .map-section { background-color:#1e2a4a !important; border-color:#2a3a5a !important; }
            .map-header { background-color:#1e3a5f !important; color:#93c5fd !important; }
            .map-body { color:#cbd5e1 !important; }
            .attachments-section { background-color:#1e2a4a !important; border-color:#2a3a5a !important; color:#e2e8f0 !important; }
            .attachments-header { background-color:#1e3a5f !important; color:#93c5fd !important; }
            .attachments-body { color:#cbd5e1 !important; }
            .evidencia-section { background-color:#1e2a4a !important; border-color:#2a3a5a !important; color:#e2e8f0 !important; }
            .evidencia-section h4 { color:#93c5fd !important; }
            .map-note { color:#94a3b8 !important; }
            .status-no_disponible { background-color:#92400e !important; color:#ffffff !important; }
            .email-footer { background-color:#1a2744 !important; border-color:#2a2a4a !important; }
            .email-footer p { color:#94a3b8 !important; }
        }
        .alert-box {
            background-color:#eff6ff;
            border-left:4px solid #3b82f6;
            padding:12px 14px;
            margin-bottom:16px;
            font-size:13px;
            color:#1e40af;
        }
        .tipo-chip {
            display:inline-block;
            padding:5px 12px;
            font-size:12px;
            font-weight:600;
            background-color:#dbeafe;
            color:#1d4ed8;
            margin-bottom:10px;
        }
        .codigo-section {
            text-align:center;
            margin:14px 0 10px;
            padding:12px 14px;
            background-color:#f0f9ff;
            border:2px dashed #3b82f6;
        }
        .codigo-label {
            font-size:11px;
            color:#64748b;
            font-weight:600;
            margin-bottom:2px;
        }
        .codigo-value {
            font-size:22px;
            font-weight:800;
            color:#1e3a8a;
            font-family:'Courier New',monospace;
        }
        .info-card {
            margin:0 0 10px;
            background-color:#f8fafc;
            padding:10px 12px 8px;
            border:1px solid #e2e8f0;
            border-left:3px solid #3b82f6;
        }
        .info-card-title {
            font-size:11px;
            font-weight:600;
            color:#64748b;
            margin-bottom:5px;
            padding-bottom:4px;
            border-bottom:1px solid #e2e8f0;
        }
        .info-row {
            font-size:13px;
            margin-bottom:3px;
            line-height:1.5;
        }
        .info-row:last-child { margin-bottom:0; }
        .info-row strong {
            color:#475569;
            font-weight:600;
        }
        .route-extra {
            margin-top:8px;
            padding-top:8px;
            border-top:1px dashed #e2e8f0;
        }
        .route-subtitle {
            margin-bottom:4px;
            font-size:11px;
            color:#64748b;
            font-weight:600;
        }
        .route-boss {
            margin-top:8px;
            padding:8px 10px;
            background-color:#fff7ed;
            border-left:3px solid #f97316;
            color:#9a3412;
        }
        .route-boss strong, .route-boss-title {
            color:#9a3412;
        }
        .status-badge {
            display:inline-block;
            padding:6px 12px;
            font-size:12px;
            font-weight:700;
        }
        .status-enviada { background-color:#dbeafe; color:#1e40af; }
        .status-pendiente { background-color:#fef3c7; color:#92400e; }
        .status-aprobada { background-color:#d1fae5; color:#065f46; }
        .status-rechazada { background-color:#fee2e2; color:#991b1b; }
        .status-en_proceso { background-color:#e0f2fe; color:#1e40af; }
        .status-completada { background-color:#e0fce7; color:#166534; }
        .status-borrador { background-color:#f3f4f6; color:#374151; }
        .status-en_revision { background-color:#dbeafe; color:#1e40af; }
        .status-pre_aprobada { background-color:#dcfce7; color:#166534; }
        .status-programada { background-color:#dbeafe; color:#1e40af; }
        .status-en_ejecucion { background-color:#1e3a8a; color:#ffffff; }
        .status-cancelada { background-color:#6b7280; color:#ffffff; }
        .status-asignada { background-color:#a855f7; color:#ffffff; }
        .status-liquidada { background-color:#16a34a; color:#ffffff; }
        .status-ruta_modificada { background-color:#f97316; color:#ffffff; }
        .status-desconocido { background-color:#f3f4f6; color:#374151; }
        .status-no_disponible { background-color:#f59e0b; color:#ffffff; }
        .map-section {
            margin:16px 0 6px;
            background-color:#f8fafc;
            border:1px solid #e2e8f0;
        }
        .map-header {
            padding:8px 12px;
            background-color:#e0f2fe;
            border-bottom:1px solid #dbeafe;
            font-size:11px;
            font-weight:600;
            color:#1e3a8a;
        }
        .map-body {
            padding:8px 12px 10px;
            font-size:12px;
            color:#475569;
        }
        .map-image-wrapper {
            margin-top:6px;
            border:1px solid #cbd5f5;
        }
        .map-image-wrapper img {
            display:block;
            width:100%;
            height:auto;
        }
        .map-note {
            margin-top:6px;
            font-size:11px;
            color:#64748b;
        }
        .attachments-section {
            margin:14px 0 6px;
            background-color:#f8fafc;
            border:1px solid #e2e8f0;
        }
        .attachments-header {
            padding:8px 12px;
            background-color:#f1f5f9;
            border-bottom:1px solid #e2e8f0;
            font-size:11px;
            font-weight:600;
            color:#475569;
        }
        .attachments-body {
            padding:8px 12px 10px;
            font-size:12px;
            color:#475569;
        }

        .extension-badge {
            display:inline-block;
            margin-top:6px;
            padding:4px 10px;
            background-color:#e0f2fe;
            color:#1d4ed8;
            font-size:10px;
            font-weight:600;
        }
        .evidencia-section {
            margin-top:14px;
            padding:12px;
            background-color:#f8fafc;
            border:1px solid #e2e8f0;
        }
        .evidencia-section h4 {
            margin:0 0 6px;
            font-size:12px;
            color:#1e3a8a;
            font-weight:600;
        }
        .email-footer {
            background-color:#f8fafc;
            padding:14px 16px;
            text-align:center;
            border-top:1px solid #e2e8f0;
        }
        .email-footer p {
            font-size:11px;
            color:#64748b;
            margin-bottom:2px;
        }
        .email-footer .timestamp {
            font-size:10px;
            color:#94a3b8;
            font-weight:500;
        }
        @media only screen and (max-width:600px) {
            body { padding:6px; }
            .email-header { padding:14px 12px 10px; }
            .email-header-text h1 { font-size:15px; }
            .email-body { padding:14px 12px 12px; }
            .info-card { margin-bottom:8px; }
            .codigo-value { font-size:20px; }
        }
    </style>
</head>
<body>
@php $tipo = $payload['tipo'] ?? 'transporte'; @endphp
<div class="email-container">
    <div class="email-header">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr>
                <td align="center" style="padding:0 0 14px;">
                    @php $logoExists = file_exists(public_path('images/logo-blanco-fondo-transparente.png')); @endphp
                    <img src="{{ $logoExists ? $message->embed(public_path('images/logo-blanco-fondo-transparente.png')) : 'https://placehold.co/180x60/1e3a8a/ffffff?text=AL' }}"
                         alt="Asamblea Legislativa"
                         width="180" height="60"
                         class="email-logo-img"
                         style="display:block;width:180px;max-width:180px;height:auto;border:0;margin:0 auto;">
                </td>
            </tr>
            <tr>
                <td align="center" class="email-header-text">
                    <h1 style="margin:0 0 4px;font-size:20px;line-height:1.3;color:#ffffff;font-weight:700;">{{ $subject }}</h1>
                    <p style="margin:0;font-size:13px;line-height:1.5;color:#e0e7ff;">
                        @php
                            $subs = ['transporte'=>'Transporte','combustible'=>'Combustible','mantenimiento'=>'Mantenimiento de Unidades'];
                            $area = $subs[$tipo] ?? 'Solicitudes';
                        @endphp
                        Sistema de Gesti&oacute;n de {{ $area }} - Asamblea Legislativa de El Salvador
                    </p>
                </td>
            </tr>
        </table>
    </div>

    <div class="email-body">
        <div class="tipo-chip">
            @if($tipo === 'transporte')
                Solicitud de transporte
            @elseif($tipo === 'combustible')
                Solicitud de combustible
            @elseif($tipo === 'mantenimiento')
                Solicitud de mantenimiento
            @elseif($tipo === 'motorista_estado')
                Estado de motorista
            @else
                Notificaci&oacute;n de solicitud
            @endif
        </div>

        @if(isset($payload['mensaje']))
            <div class="alert-box">
                {{ $payload['mensaje'] }}
            </div>
        @endif

        @if($tipo === 'motorista_estado' && isset($payload['solicitud']))
            <div class="info-card">
                <div class="info-card-title">Estado del motorista</div>
                @if(isset($payload['solicitud']['estado']))
                    <div class="info-row">
                        <strong>Estado:</strong>
                        <span class="status-badge status-no_disponible">No disponible</span>
                    </div>
                @endif
                @if(isset($payload['solicitud']['motorista']))
                    <div class="info-row"><strong>Motorista:</strong> {{ $payload['solicitud']['motorista'] }}</div>
                @endif
                @if(!empty($payload['solicitud']['motivo']))
                    <div class="info-row"><strong>Motivo reportado:</strong> {{ $payload['solicitud']['motivo'] }}</div>
                @endif
            </div>
        @endif

        @if(isset($payload['solicitud']['codigo']) && $tipo !== 'motorista_estado')
            <div class="codigo-section">
                <div class="codigo-label">
                    @if(!empty($payload['es_extension']))
                        C&oacute;digo de solicitud (extensi&oacute;n)
                    @else
                        C&oacute;digo de solicitud
                    @endif
                </div>
                <div class="codigo-value">
                    {{ $payload['solicitud']['codigo'] }}
                </div>
                @if(!empty($payload['es_extension']) && isset($payload['solicitud']['codigo_original']))
                    <div class="extension-badge">
                        Extensi&oacute;n de: {{ $payload['solicitud']['codigo_original'] }}
                    </div>
                @endif
            </div>
        @endif

        @if($tipo === 'transporte' && isset($payload['solicitud']))
            @php
                $solicitud = $payload['solicitud'];
                $destinosSolicitados = $solicitud['destinos_solicitados'] ?? collect($solicitud['destinos_adicionales'] ?? [])
                    ->reject(fn ($d) => $d['agregado_durante_viaje'] ?? false)
                    ->values()
                    ->map(fn ($d, $i) => $d + ['etiqueta' => 'Destino adicional ' . ($i + 1)])
                    ->all();
                $destinosJefaturaBase = collect($solicitud['destinos_jefatura'] ?? $solicitud['destinos_adicionales'] ?? [])
                    ->filter(fn ($d) => $d['agregado_durante_viaje'] ?? false)
                    ->values();
                $destinosJefatura = isset($solicitud['destinos_jefatura'])
                    ? $solicitud['destinos_jefatura']
                    : $destinosJefaturaBase
                        ->map(fn ($d, $i) => $d + [
                            'etiqueta' => 'Destino nuevo asignado por jefatura'
                                . ($destinosJefaturaBase->count() > 1 ? ' ' . ($i + 1) : ''),
                        ])
                        ->all();
            @endphp
            @if(isset($payload['solicitud']['estado']))
                <div style="margin:0 0 12px;">
                    <span class="status-badge status-{{ $payload['solicitud']['estado'] }}">
                        {{ ucfirst(str_replace('_',' ', $payload['solicitud']['estado'])) }}
                    </span>
                </div>
            @endif

            @if(isset($solicitud['origen']) || isset($solicitud['destino']) || !empty($destinosSolicitados) || !empty($destinosJefatura))
                <div class="info-card">
                    <div class="info-card-title">Ruta del viaje</div>
                    @if(isset($solicitud['origen']))
                        <div class="info-row"><strong>Origen:</strong> {{ $solicitud['origen'] }}</div>
                    @endif
                    @if(isset($solicitud['destino']))
                        <div class="info-row"><strong>Destino principal:</strong> {{ $solicitud['destino'] }}</div>
                    @endif

                    @if(!empty($destinosSolicitados))
                        <div class="route-extra">
                            <div class="route-subtitle">Destinos adicionales solicitados</div>
                            @foreach($destinosSolicitados as $destino)
                                <div class="info-row">
                                    <strong>{{ $destino['etiqueta'] ?? 'Destino adicional ' . $loop->iteration }}:</strong>
                                    {{ $destino['nombre'] }}
                                </div>
                            @endforeach
                        </div>
                    @endif

                    @if(!empty($destinosJefatura))
                        <div class="route-boss">
                            <div class="route-boss-title" style="font-size:11px;font-weight:700;margin-bottom:4px;">
                                Destino asignado por jefatura
                            </div>
                            @foreach($destinosJefatura as $destino)
                                <div class="info-row" style="color:#9a3412;">
                                    <strong>{{ $destino['etiqueta'] ?? 'Destino nuevo asignado por jefatura' }}:</strong>
                                    {{ $destino['nombre'] }}
                                    @if(!empty($destino['agregado_por_nombre']))
                                        <span style="font-size:10px;">({{ $destino['agregado_por_nombre'] }})</span>
                                    @endif
                                </div>
                            @endforeach
                        </div>
                    @endif
                </div>
            @endif

            @if(isset($payload['solicitud']['fecha_salida']) || isset($payload['solicitud']['fecha_retorno']))
                <div class="info-card">
                    <div class="info-card-title">Horario</div>
                    @if(isset($payload['solicitud']['fecha_salida']))
                        <div class="info-row"><strong>Salida:</strong> {{ \Carbon\Carbon::parse($payload['solicitud']['fecha_salida'])->format('d/m/Y H:i') }}</div>
                    @endif
                    @if(isset($payload['solicitud']['fecha_retorno']))
                        <div class="info-row"><strong>Retorno:</strong> {{ \Carbon\Carbon::parse($payload['solicitud']['fecha_retorno'])->format('d/m/Y H:i') }}</div>
                    @endif
                </div>
            @endif

            @if(isset($payload['solicitud']['tipo_vehiculo_nombre']) || isset($payload['solicitud']['cantidad_personas']) || (isset($payload['solicitud']['vehiculo_placa']) && $payload['solicitud']['vehiculo_placa'] !== 'N/A') || (isset($payload['solicitud']['motorista_nombre']) && $payload['solicitud']['motorista_nombre'] !== 'N/A'))
                <div class="info-card">
                    <div class="info-card-title">Asignaci&oacute;n</div>
                    @if(isset($payload['solicitud']['tipo_vehiculo_nombre']))
                        <div class="info-row"><strong>Tipo de veh&iacute;culo:</strong> {{ ucfirst($payload['solicitud']['tipo_vehiculo_nombre']) }}</div>
                    @endif
                    @if(isset($payload['solicitud']['cantidad_personas']))
                        <div class="info-row"><strong>Personas:</strong> {{ $payload['solicitud']['cantidad_personas'] }}</div>
                    @endif
                    @if(isset($payload['solicitud']['vehiculo_placa']) && $payload['solicitud']['vehiculo_placa'] !== 'N/A')
                        <div class="info-row"><strong>Veh&iacute;culo:</strong> {{ $payload['solicitud']['vehiculo_placa'] }}</div>
                    @endif
                    @if(isset($payload['solicitud']['motorista_nombre']) && $payload['solicitud']['motorista_nombre'] !== 'N/A')
                        <div class="info-row"><strong>Motorista:</strong> {{ $payload['solicitud']['motorista_nombre'] }}</div>
                    @endif
                </div>
            @endif

            @if(isset($payload['solicitud']['motivo_actividad']) || isset($payload['solicitud']['motivo_rechazo']))
                <div class="info-card">
                    <div class="info-card-title">Detalles</div>
                    @if(isset($payload['solicitud']['motivo_actividad']))
                        <div class="info-row"><strong>Actividad:</strong> {{ $payload['solicitud']['motivo_actividad'] }}</div>
                    @endif
                    @if(isset($payload['solicitud']['motivo_rechazo']))
                        <div class="info-row"><strong>Motivo del rechazo:</strong> {{ $payload['solicitud']['motivo_rechazo'] }}</div>
                    @endif
                </div>
            @endif

            @if(!empty($map_url) || !empty($map_fallback_src))
                <div class="map-section">
                    <div class="map-header">Mapa aproximado de la ruta</div>
                    <div class="map-body">
                        <p>Esta visualizaci&oacute;n muestra una aproximaci&oacute;n del recorrido de la solicitud.</p>
                        <div class="map-image-wrapper">
                            <img src="{{ $map_url ?: $map_fallback_src }}" alt="Mapa aproximado de la ruta">
                        </div>
                        @if(!$map_url)
                            <p class="map-note">No se pudo generar el mapa exacto; se muestra una referencia de El Salvador.</p>
                        @else
                            <p class="map-note">El mapa es ilustrativo y podr&iacute;a no reflejar el recorrido exacto.</p>
                        @endif
                    </div>
                </div>
            @endif

        @elseif($tipo === 'combustible' && isset($payload['solicitud']))
            @if(isset($payload['solicitud']['estado']))
                <div style="margin:0 0 12px;">
                    <span class="status-badge status-{{ $payload['solicitud']['estado'] }}">
                        {{ ucfirst(str_replace('_',' ', $payload['solicitud']['estado'])) }}
                    </span>
                </div>
            @endif

            <div class="info-card">
                <div class="info-card-title">Informaci&oacute;n general</div>
                @if(isset($payload['solicitud']['vehiculo']))
                    <div class="info-row"><strong>Veh&iacute;culo:</strong> {{ $payload['solicitud']['vehiculo'] }}</div>
                @endif
                @if(isset($payload['solicitud']['motorista']))
                    <div class="info-row"><strong>Motorista:</strong> {{ $payload['solicitud']['motorista'] }}</div>
                @endif
                @if(isset($payload['solicitud']['fecha_solicitud']))
                    <div class="info-row"><strong>Fecha de solicitud:</strong> {{ \Carbon\Carbon::parse($payload['solicitud']['fecha_solicitud'])->format('d/m/Y') }}</div>
                @endif
                @if(isset($payload['solicitud']['destino_actividad']))
                    <div class="info-row"><strong>Destino:</strong> {{ $payload['solicitud']['destino_actividad'] }}</div>
                @endif
            </div>

            <div class="info-card">
                <div class="info-card-title">Combustible</div>
                @if(isset($payload['solicitud']['cantidad_combustible']))
                    <div class="info-row"><strong>Cantidad:</strong> {{ $payload['solicitud']['cantidad_combustible'] }} galones</div>
                @endif
                @if(isset($payload['solicitud']['valor_total']))
                    <div class="info-row"><strong>Valor total:</strong> ${{ number_format($payload['solicitud']['valor_total'], 2) }}</div>
                @endif
                @if(isset($payload['solicitud']['forma_pago']))
                    <div class="info-row"><strong>Forma de pago:</strong> {{ $payload['solicitud']['forma_pago'] }}</div>
                @endif
                @if(isset($payload['solicitud']['numero_vale_ticket']))
                    <div class="info-row"><strong>N&uacute;mero de ticket:</strong> {{ $payload['solicitud']['numero_vale_ticket'] }}</div>
                @endif
            </div>

            @if(isset($payload['solicitud']['motivo_rechazo']))
                <div class="info-card">
                    <div class="info-card-title">Motivo del rechazo</div>
                    <div class="info-row">{{ $payload['solicitud']['motivo_rechazo'] }}</div>
                </div>
            @endif

        @elseif($tipo === 'mantenimiento' && isset($payload['solicitud']))
            @if(isset($payload['solicitud']['estado']))
                <div style="margin:0 0 12px;">
                    <span class="status-badge status-{{ $payload['solicitud']['estado'] }}">
                        {{ ucfirst(str_replace('_',' ', $payload['solicitud']['estado'])) }}
                    </span>
                </div>
            @endif

            <div class="info-card">
                <div class="info-card-title">Informaci&oacute;n general</div>
                @if(isset($payload['solicitud']['vehiculo']))
                    <div class="info-row"><strong>Veh&iacute;culo:</strong> {{ $payload['solicitud']['vehiculo'] }}</div>
                @endif
                @if(isset($payload['solicitud']['tipo_mantenimiento']))
                    <div class="info-row"><strong>Tipo de mantenimiento:</strong> {{ $payload['solicitud']['tipo_mantenimiento'] }}</div>
                @endif
                @if(isset($payload['solicitud']['prioridad']))
                    <div class="info-row"><strong>Prioridad:</strong> {{ ucfirst($payload['solicitud']['prioridad']) }}</div>
                @endif
                @if(isset($payload['solicitud']['fecha_sugerida']))
                    <div class="info-row"><strong>Fecha sugerida:</strong> {{ \Carbon\Carbon::parse($payload['solicitud']['fecha_sugerida'])->format('d/m/Y') }}</div>
                @endif
                @if(isset($payload['solicitud']['costo_estimado']))
                    <div class="info-row"><strong>Costo estimado:</strong> ${{ number_format($payload['solicitud']['costo_estimado'], 2) }}</div>
                @endif
            </div>

            @if(isset($payload['solicitud']['detalle']))
                <div class="info-card">
                    <div class="info-card-title">Detalle</div>
                    <div class="info-row">{{ $payload['solicitud']['detalle'] }}</div>
                </div>
            @endif

            @if(isset($payload['solicitud']['observaciones']))
                <div class="info-card">
                    <div class="info-card-title">Observaciones</div>
                    <div class="info-row">{{ $payload['solicitud']['observaciones'] }}</div>
                </div>
            @endif

            @if(isset($payload['solicitud']['motivo_rechazo']))
                <div class="info-card">
                    <div class="info-card-title">Motivo del rechazo</div>
                    <div class="info-row">{{ $payload['solicitud']['motivo_rechazo'] }}</div>
                </div>
            @endif
        @endif

        @if(!empty($payload['evidencia']))
            <div class="evidencia-section">
                <h4>Evidencia adjunta</h4>
                @if(!empty($evidencia_src))
                    <img src="{{ $evidencia_src }}" alt="{{ $payload['evidencia']['nombre'] ?? 'Evidencia' }}" style="max-width:100%;height:auto;">
                @else
                    <p style="font-size:13px;color:#475569;">{{ $payload['evidencia']['nombre'] ?? 'Archivo adjunto' }}</p>
                @endif
            </div>
        @endif

        @if(!empty($payload['attachments']))
            <div class="attachments-section">
                <div class="attachments-header">Adjuntos</div>
                <div class="attachments-body">
                    @foreach($payload['attachments'] as $attachment)
                        @php
                            $name = is_array($attachment) ? ($attachment['name'] ?? basename($attachment['path'] ?? '')) : basename($attachment);
                        @endphp
                        <div style="font-size:13px;padding:2px 0;">{{ $name }}</div>
                    @endforeach
                </div>
            </div>
        @endif

        @if(!empty($payload['solicitud']['monto_validado']))
            <div class="info-card" style="margin-top:12px;">
                <div class="info-card-title">Validaci&oacute;n</div>
                <div class="info-row"><strong>Monto validado:</strong> ${{ number_format($payload['solicitud']['monto_validado'], 2) }}</div>
                @if(!empty($payload['solicitud']['resultado']))
                    <div class="info-row"><strong>Resultado:</strong> {{ ucfirst($payload['solicitud']['resultado']) }}</div>
                @endif
            </div>
        @endif

        @if(!empty($payload['mostrar_solicitante']) && isset($payload['solicitante']))
            <div class="info-card" style="margin-top:12px;">
                <div class="info-card-title">Solicitante</div>
                @if(!empty($payload['solicitante']['name']))
                    <div class="info-row"><strong>Nombre:</strong> {{ $payload['solicitante']['name'] }}</div>
                @endif
                @if(!empty($payload['solicitante']['email']))
                    <div class="info-row"><strong>Correo:</strong> {{ $payload['solicitante']['email'] }}</div>
                @endif
                @php
                    $unidadNombre = $payload['solicitante']['unidadSolicitante']['nombre'] ?? $payload['solicitante']['unidad']['nombre'] ?? '';
                    $unidadSiglas = $payload['solicitante']['unidadSolicitante']['siglas'] ?? $payload['solicitante']['unidad']['siglas'] ?? '';
                @endphp
                @if(!empty($unidadNombre))
                    <div class="info-row"><strong>Unidad:</strong> {{ $unidadNombre }}@if(!empty($unidadSiglas)) ({{ $unidadSiglas }})@endif</div>
                @endif
            </div>
        @endif
    </div>

    <div class="email-footer">
        <p><strong>Asamblea Legislativa de El Salvador</strong></p>
        <p>Unidad de Transporte y Log&iacute;stica</p>
        @if(isset($payload['timestamp']))
            <p class="timestamp">{{ \Carbon\Carbon::parse($payload['timestamp'])->format('d/m/Y H:i:s') }}</p>
        @endif
    </div>
</div>
</body>
</html>
