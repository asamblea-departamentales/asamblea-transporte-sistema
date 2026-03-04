<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject }}</title>
    <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
            font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
            background-color:#f4f7fa;
            padding:20px;
            color:#2c3e50;
            line-height:1.6;
        }
        .email-container {
            max-width:600px;
            margin:0 auto;
            background-color:#ffffff;
            border-radius:12px;
            overflow:hidden;
            box-shadow:0 4px 20px rgba(0,0,0,0.08);
        }
        .email-header {
            background:linear-gradient(135deg,#1e3a8a 0%,#3b82f6 100%);
            padding:24px 24px 18px;
            color:#fff;
            display:flex;
            align-items:center;
            gap:16px;
        }
        .email-logo {
            width:56px;
            height:56px;
            border-radius:50%;
            overflow:hidden;
            background:#0f172a;
            display:flex;
            align-items:center;
            justify-content:center;
            flex-shrink:0;
        }
        .email-logo img {
            width:100%;
            height:100%;
            object-fit:cover;
        }
        .email-header-text h1 {
            font-size:18px;
            font-weight:700;
            margin-bottom:4px;
        }
        .email-header-text p {
            font-size:13px;
            opacity:0.9;
        }
        .email-body { padding:30px 24px 24px; }

        .alert-box {
            background-color:#eff6ff;
            border-left:4px solid #3b82f6;
            padding:16px;
            border-radius:8px;
            margin-bottom:24px;
            font-size:14px;
            color:#1e3a8a;
        }

        .tipo-chip {
            display:inline-block;
            padding:6px 12px;
            border-radius:999px;
            font-size:12px;
            font-weight:600;
            text-transform:uppercase;
            letter-spacing:0.6px;
            background-color:#e0f2fe;
            color:#1d4ed8;
            margin-bottom:12px;
        }

        .codigo-section {
            text-align:center;
            margin:20px 0;
            padding:18px;
            background:linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%);
            border-radius:10px;
            border:2px dashed #3b82f6;
        }
        .codigo-label {
            font-size:11px;
            text-transform:uppercase;
            letter-spacing:1px;
            color:#64748b;
            font-weight:600;
            margin-bottom:4px;
        }
        .codigo-value {
            font-size:24px;
            font-weight:800;
            color:#1e3a8a;
            font-family:'Courier New',monospace;
            letter-spacing:2px;
        }

        .details-grid {
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:16px;
            margin:22px 0 10px;
        }
        .detail-item,
        .detail-item-full {
            background-color:#f8fafc;
            padding:14px 14px 12px;
            border-radius:8px;
            border:1px solid #e2e8f0;
        }
        .detail-item-full { grid-column:1 / -1; }
        .detail-label {
            font-size:11px;
            text-transform:uppercase;
            letter-spacing:0.5px;
            color:#64748b;
            font-weight:600;
            margin-bottom:4px;
        }
        .detail-value {
            font-size:14px;
            color:#1e293b;
            font-weight:500;
        }

        .status-badge {
            display:inline-block;
            padding:6px 12px;
            border-radius:20px;
            font-size:12px;
            font-weight:700;
            text-transform:uppercase;
            letter-spacing:0.4px;
        }
        .status-pendiente { background-color:#fef3c7; color:#92400e; }
        .status-aprobado { background-color:#d1fae5; color:#065f46; }
        .status-rechazado { background-color:#fee2e2; color:#991b1b; }
        .status-en_proceso { background-color:#e0f2fe; color:#1e40af; }
        .status-completado { background-color:#e0fce7; color:#166534; }

        .map-section {
            margin:24px 0 8px;
            background-color:#f8fafc;
            border-radius:10px;
            border:1px solid #e2e8f0;
            overflow:hidden;
        }
        .map-header {
            padding:10px 14px;
            background-color:#e0f2fe;
            border-bottom:1px solid #dbeafe;
            font-size:12px;
            font-weight:600;
            text-transform:uppercase;
            letter-spacing:0.5px;
            color:#1e3a8a;
        }
        .map-body {
            padding:10px 14px 14px;
            font-size:13px;
            color:#475569;
        }
        .map-image-wrapper {
            margin-top:8px;
            border-radius:8px;
            overflow:hidden;
            border:1px solid #cbd5f5;
        }
        .map-image-wrapper img {
            display:block;
            width:100%;
            height:auto;
        }
        .map-note {
            margin-top:8px;
            font-size:11px;
            color:#64748b;
        }

        .solicitante-section {
            background:linear-gradient(135deg,#1e3a8a 0%,#3b82f6 100%);
            padding:18px 18px 16px;
            border-radius:10px;
            margin:22px 0 8px;
            color:#ffffff;
        }
        .solicitante-section h3 {
            font-size:13px;
            text-transform:uppercase;
            letter-spacing:1px;
            margin-bottom:10px;
            opacity:0.9;
            font-weight:600;
        }
        .solicitante-info {
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:10px;
        }
        .solicitante-item {
            font-size:13px;
        }
        .solicitante-item strong {
            display:block;
            font-size:11px;
            opacity:0.85;
            margin-bottom:2px;
            font-weight:500;
        }

        .extension-badge {
            display:inline-block;
            margin-top:8px;
            padding:6px 12px;
            border-radius:999px;
            background-color:#e0f2fe;
            color:#1d4ed8;
            font-size:11px;
            font-weight:600;
            text-transform:uppercase;
            letter-spacing:0.5px;
        }

        .email-footer {
            background-color:#f8fafc;
            padding:18px 20px;
            text-align:center;
            border-top:1px solid #e2e8f0;
        }
        .email-footer p {
            font-size:12px;
            color:#64748b;
            margin-bottom:4px;
        }
        .email-footer .timestamp {
            font-size:11px;
            color:#94a3b8;
            font-weight:500;
        }

        @media only screen and (max-width:600px) {
            body { padding:10px; }
            .email-header { padding:18px 16px 14px; }
            .email-header-text h1 { font-size:16px; }
            .email-body { padding:22px 16px 18px; }
            .details-grid { grid-template-columns:1fr; gap:12px; }
            .solicitante-info { grid-template-columns:1fr; }
            .codigo-value { font-size:20px; }
        }
    </style>
</head>
<body>
<div class="email-container">
    <div class="email-header">
        <div class="email-logo" style="width:56px;height:56px;border-radius:50%;overflow:hidden;background:#0f172a;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
    <img
        src="{{ asset('images/logo-blanco-fondo-transparente.png') }}"
        alt="Logo"
        width="56"
        height="56"
        style="display:block;width:56px;height:56px;max-width:56px;max-height:56px;border-radius:50%;"
    >
</div>
        <div class="email-header-text">
            <h1>{{ $subject }}</h1>
            <p>Sistema de Gestión de Solicitudes - Asamblea Legislativa de El Salvador</p>
        </div>
    </div>

    <div class="email-body">
        @php
            $tipo = $payload['tipo'] ?? 'transporte';
        @endphp

        <div class="tipo-chip">
            @if($tipo === 'transporte')
                Solicitud de transporte
            @elseif($tipo === 'combustible')
                Solicitud de combustible
            @elseif($tipo === 'mantenimiento')
                Solicitud de mantenimiento
            @else
                Notificación de solicitud
            @endif
        </div>

        @if(isset($payload['mensaje']))
            <div class="alert-box">
                {{ $payload['mensaje'] }}
            </div>
        @endif

        @if(isset($payload['solicitud']['codigo']))
            <div class="codigo-section">
                <div class="codigo-label">
                    @if(!empty($payload['es_extension']))
                        Código de solicitud (extensión)
                    @else
                        Código de solicitud
                    @endif
                </div>
                <div class="codigo-value">
                    {{ $payload['solicitud']['codigo'] }}
                </div>

                @if(!empty($payload['es_extension']) && isset($payload['solicitud']['codigo_original']))
                    <div class="extension-badge">
                        Extensión de: {{ $payload['solicitud']['codigo_original'] }}
                    </div>
                @endif
            </div>
        @endif

        {{-- TRANSPORTE --}}
        @if($tipo === 'transporte' && isset($payload['solicitud']))
            <div class="details-grid">
                @if(isset($payload['solicitud']['estado']))
                    <div class="detail-item-full">
                        <div class="detail-label">Estado</div>
                        <div class="detail-value">
                            <span class="status-badge status-{{ $payload['solicitud']['estado'] }}">
                                {{ ucfirst(str_replace('_',' ', $payload['solicitud']['estado'])) }}
                            </span>
                        </div>
                    </div>
                @endif

                @if(isset($payload['solicitud']['tipo_vehiculo_nombre']))
                    <div class="detail-item">
                        <div class="detail-label">Tipo de vehículo</div>
                        <div class="detail-value">
                            {{ ucfirst($payload['solicitud']['tipo_vehiculo_nombre']) }}
                        </div>
                    </div>
                @endif

                @if(isset($payload['solicitud']['cantidad_personas']))
                    <div class="detail-item">
                        <div class="detail-label">Cantidad de personas</div>
                        <div class="detail-value">
                            {{ $payload['solicitud']['cantidad_personas'] }} personas
                        </div>
                    </div>
                @endif

                @if(isset($payload['solicitud']['origen']))
                    <div class="detail-item-full">
                        <div class="detail-label">Origen</div>
                        <div class="detail-value">
                            {{ $payload['solicitud']['origen'] }}
                        </div>
                    </div>
                @endif

                @if(isset($payload['solicitud']['destino']))
                    <div class="detail-item-full">
                        <div class="detail-label">Destino principal</div>
                        <div class="detail-value">
                            {{ $payload['solicitud']['destino'] }}
                        </div>
                    </div>
                @endif

                @if(isset($payload['solicitud']['destino_adicional']) && $payload['solicitud']['destino_adicional'] !== '')
                    <div class="detail-item-full">
                        <div class="detail-label">Destino adicional</div>
                        <div class="detail-value">
                            {{ $payload['solicitud']['destino_adicional'] }}
                        </div>
                    </div>
                @endif

                @if(isset($payload['solicitud']['fecha_salida']))
                    <div class="detail-item">
                        <div class="detail-label">Fecha de salida</div>
                        <div class="detail-value">
                            {{ \Carbon\Carbon::parse($payload['solicitud']['fecha_salida'])->format('d/m/Y H:i') }}
                        </div>
                    </div>
                @endif

                @if(isset($payload['solicitud']['fecha_retorno']))
                    <div class="detail-item">
                        <div class="detail-label">Fecha de retorno</div>
                        <div class="detail-value">
                            {{ \Carbon\Carbon::parse($payload['solicitud']['fecha_retorno'])->format('d/m/Y H:i') }}
                        </div>
                    </div>
                @endif

                @if(isset($payload['solicitud']['motivo_actividad']))
                    <div class="detail-item-full">
                        <div class="detail-label">Motivo de la actividad</div>
                        <div class="detail-value">
                            {{ $payload['solicitud']['motivo_actividad'] }}
                        </div>
                    </div>
                @endif
            </div>

            @php
                $origen    = $payload['solicitud']['origen'] ?? 'San Salvador';
                $destino   = $payload['solicitud']['destino'] ?? 'Centro Histórico, San Salvador';
                $destinoAd = $payload['solicitud']['destino_adicional'] ?? null;

                // Imagen estática del mapa en public/images
                $mapUrl = asset('images/mapa_correo.png');
            @endphp

            @if($mapUrl)
                <div class="map-section">
                    <div class="map-header">
                        Mapa de El Salvador - referencia de ruta
                    </div>
                    <div class="map-body">
                        <div>
                            Trayecto solicitado:
                            <strong>{{ $origen }}</strong>
                            →
                            <strong>{{ $destino }}</strong>
                            @if($destinoAd && $destinoAd !== 'Sin destino adicional')
                                →
                                <strong>{{ $destinoAd }}</strong>
                            @else
                                →
                                <strong>Sin destino adicional</strong>
                            @endif
                        </div>

                        <div class="map-image-wrapper">
                            <img src="{{ $mapUrl }}" alt="Mapa de ruta en El Salvador">
                        </div>
                        <div class="map-note">
                            Mapa de referencia general con base en los destinos indicados.
                        </div>
                    </div>
                </div>
            @endif

        @elseif($tipo === 'combustible' && isset($payload['solicitud']))
            <div class="details-grid">
                <div class="detail-item-full">
                    <div class="detail-label">Tipo de solicitud</div>
                    <div class="detail-value">Combustible</div>
                </div>

                @if(isset($payload['solicitud']['vehiculo']))
                    <div class="detail-item">
                        <div class="detail-label">Vehículo</div>
                        <div class="detail-value">{{ $payload['solicitud']['vehiculo'] }}</div>
                    </div>
                @endif

                @if(isset($payload['solicitud']['cantidad_combustible']))
                    <div class="detail-item">
                        <div class="detail-label">Cantidad solicitada</div>
                        <div class="detail-value">{{ $payload['solicitud']['cantidad_combustible'] }}</div>
                    </div>
                @endif

                @if(isset($payload['solicitud']['motivo']))
                    <div class="detail-item-full">
                        <div class="detail-label">Motivo</div>
                        <div class="detail-value">{{ $payload['solicitud']['motivo'] }}</div>
                    </div>
                @endif
            </div>
        @elseif($tipo === 'mantenimiento' && isset($payload['solicitud']))
            <div class="details-grid">
                <div class="detail-item-full">
                    <div class="detail-label">Tipo de solicitud</div>
                    <div class="detail-value">Mantenimiento de vehículo</div>
                </div>

                @if(isset($payload['solicitud']['vehiculo']))
                    <div class="detail-item">
                        <div class="detail-label">Vehículo</div>
                        <div class="detail-value">{{ $payload['solicitud']['vehiculo'] }}</div>
                    </div>
                @endif

                @if(isset($payload['solicitud']['tipo_mantenimiento']))
                    <div class="detail-item">
                        <div class="detail-label">Tipo de mantenimiento</div>
                        <div class="detail-value">{{ $payload['solicitud']['tipo_mantenimiento'] }}</div>
                    </div>
                @endif

                @if(isset($payload['solicitud']['descripcion_falla']))
                    <div class="detail-item-full">
                        <div class="detail-label">Descripción de la falla</div>
                        <div class="detail-value">{{ $payload['solicitud']['descripcion_falla'] }}</div>
                    </div>
                @endif
            </div>
        @endif

        @if(isset($payload['solicitante']))
            <div class="solicitante-section">
                <h3>Información del solicitante</h3>
                <div class="solicitante-info">
                    <div class="solicitante-item">
                        <strong>Nombre</strong>
                        {{ $payload['solicitante']['name'] ?? '' }}
                    </div>
                    <div class="solicitante-item">
                        <strong>Correo</strong>
                        {{ $payload['solicitante']['email'] ?? '' }}
                    </div>
                    @if(isset($payload['solicitante']['unidad']))
                        <div class="solicitante-item">
                            <strong>Unidad</strong>
                            {{ $payload['solicitante']['unidad']['nombre'] ?? '' }}
                        </div>
                        <div class="solicitante-item">
                            <strong>Siglas</strong>
                            {{ $payload['solicitante']['unidad']['siglas'] ?? '' }}
                        </div>
                    @endif
                </div>
            </div>
        @endif
    </div>

    <div class="email-footer">
        <p><strong>Asamblea Legislativa de El Salvador</strong></p>
        <p>Unidad de Transporte y Logística</p>
        @if(isset($payload['timestamp']))
            <p class="timestamp">
                {{ \Carbon\Carbon::parse($payload['timestamp'])->format('d/m/Y H:i:s') }}
            </p>
        @endif
    </div>
</div>
</body>
</html>
