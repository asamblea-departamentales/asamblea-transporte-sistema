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
            background:linear-gradient(135deg,#0891b2 0%,#3b82f6 100%);
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
            margin-bottom:12px;
        }
        .tipo-transporte { background-color:#dbeafe; color:#1e40af; }
        .tipo-combustible { background-color:#ecfeff; color:#0891b2; }
        .tipo-mantenimiento { background-color:#f0fdf4; color:#065f46; }

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

        .solicitante-section {
            background:linear-gradient(135deg,#0891b2 0%,#3b82f6 100%);
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
        <div class="email-logo">
            <img src="{{ asset('images/logo-blanco-fondo-transparente.png') }}" alt="Logo" width="56" height="56" style="display:block;width:56px;height:56px;max-width:56px;max-height:56px;border-radius:50%;">
        </div>
        <div class="email-header-text">
            <h1>{{ $subject }}</h1>
            <p>Sistema de Gestión de Solicitudes - Asamblea Legislativa de El Salvador</p>
        </div>
    </div>

    <div class="email-body">
        <div class="tipo-chip tipo-{{ $tipo }}">
            Solicitud de {{ ucfirst($tipo) }}
        </div>

        <div class="alert-box">
            Su solicitud ha sido enviada exitosamente y está pendiente de revisión por el área correspondiente.
        </div>

        @if(isset($s['codigo']))
            <div class="codigo-section">
                <div class="codigo-label">Código de solicitud</div>
                <div class="codigo-value">{{ $s['codigo'] }}</div>
            </div>
        @endif

        <div class="details-grid">
            {{-- TRANSPORTE --}}
            @if($tipo === 'transporte' && isset($s))
                <div class="detail-item-full">
                    <div class="detail-label">Estado</div>
                    <div class="detail-value">
                        <span class="status-badge status-pendiente">Pendiente</span>
                    </div>
                </div>

                @if(isset($s['origen']))
                    <div class="detail-item-full">
                        <div class="detail-label">Origen</div>
                        <div class="detail-value">{{ $s['origen'] }}</div>
                    </div>
                @endif

                @if(isset($s['destino']))
                    <div class="detail-item-full">
                        <div class="detail-label">Destino</div>
                        <div class="detail-value">{{ $s['destino'] }}</div>
                    </div>
                @endif

                @if(isset($s['fecha_salida']))
                    <div class="detail-item">
                        <div class="detail-label">Fecha de salida</div>
                        <div class="detail-value">
                            {{ \Carbon\Carbon::parse($s['fecha_salida'])->format('d/m/Y H:i') }}
                        </div>
                    </div>
                @endif

                @if(isset($s['cantidad_personas']))
                    <div class="detail-item">
                        <div class="detail-label">Cantidad de personas</div>
                        <div class="detail-value">{{ $s['cantidad_personas'] }} personas</div>
                    </div>
                @endif

                @if(isset($s['motivo_actividad']))
                    <div class="detail-item-full">
                        <div class="detail-label">Motivo de la actividad</div>
                        <div class="detail-value">{{ $s['motivo_actividad'] }}</div>
                    </div>
                @endif
            @endif

            {{-- COMBUSTIBLE --}}
            @if($tipo === 'combustible' && isset($s))
                <div class="detail-item-full">
                    <div class="detail-label">Estado</div>
                    <div class="detail-value">
                        <span class="status-badge status-pendiente">Pendiente</span>
                    </div>
                </div>

                @if(isset($s['vehiculo']))
                    <div class="detail-item">
                        <div class="detail-label">Vehículo</div>
                        <div class="detail-value">{{ $s['vehiculo'] }}</div>
                    </div>
                @endif

                @if(isset($s['motorista']))
                    <div class="detail-item">
                        <div class="detail-label">Motorista</div>
                        <div class="detail-value">{{ $s['motorista'] }}</div>
                    </div>
                @endif

                @if(isset($s['cantidad_combustible']))
                    <div class="detail-item">
                        <div class="detail-label">Cantidad solicitada</div>
                        <div class="detail-value">{{ $s['cantidad_combustible'] }} galones</div>
                    </div>
                @endif

                @if(isset($s['valor_total']))
                    <div class="detail-item">
                        <div class="detail-label">Valor total</div>
                        <div class="detail-value">${{ number_format($s['valor_total'], 2) }}</div>
                    </div>
                @endif

                @if(isset($s['destino_actividad']))
                    <div class="detail-item-full">
                        <div class="detail-label">Destino de actividad</div>
                        <div class="detail-value">{{ $s['destino_actividad'] }}</div>
                    </div>
                @endif
            @endif

            {{-- MANTENIMIENTO --}}
            @if($tipo === 'mantenimiento' && isset($s))
                <div class="detail-item-full">
                    <div class="detail-label">Estado</div>
                    <div class="detail-value">
                        <span class="status-badge status-pendiente">Pendiente</span>
                    </div>
                </div>

                @if(isset($s['vehiculo']))
                    <div class="detail-item">
                        <div class="detail-label">Vehículo</div>
                        <div class="detail-value">{{ $s['vehiculo'] }}</div>
                    </div>
                @endif

                @if(isset($s['tipo_mantenimiento']))
                    <div class="detail-item">
                        <div class="detail-label">Tipo de mantenimiento</div>
                        <div class="detail-value">{{ $s['tipo_mantenimiento'] }}</div>
                    </div>
                @endif

                @if(isset($s['prioridad']))
                    <div class="detail-item">
                        <div class="detail-label">Prioridad</div>
                        <div class="detail-value">{{ ucfirst($s['prioridad']) }}</div>
                    </div>
                @endif

                @if(isset($s['detalle']))
                    <div class="detail-item-full">
                        <div class="detail-label">Detalle</div>
                        <div class="detail-value">{{ $s['detalle'] }}</div>
                    </div>
                @endif

                @if(isset($s['fecha_sugerida']))
                    <div class="detail-item">
                        <div class="detail-label">Fecha sugerida</div>
                        <div class="detail-value">
                            {{ \Carbon\Carbon::parse($s['fecha_sugerida'])->format('d/m/Y') }}
                        </div>
                    </div>
                @endif

                @if(isset($s['costo_estimado']))
                    <div class="detail-item">
                        <div class="detail-label">Costo estimado</div>
                        <div class="detail-value">${{ number_format($s['costo_estimado'], 2) }}</div>
                    </div>
                @endif
            @endif
        </div>

        @if(isset($solicitante))
            <div class="solicitante-section">
                <h3>Información del solicitante</h3>
                <div class="solicitante-info">
                    <div class="solicitante-item">
                        <strong>Nombre</strong>
                        {{ $solicitante['name'] ?? '' }}
                    </div>
                    <div class="solicitante-item">
                        <strong>Correo</strong>
                        {{ $solicitante['email'] ?? '' }}
                    </div>
                </div>
            </div>
        @endif
    </div>

    <div class="email-footer">
        <p><strong>Asamblea Legislativa de El Salvador</strong></p>
        <p>Unidad de Transporte y Logística</p>
        <p class="timestamp">{{ now()->format('d/m/Y H:i:s') }}</p>
    </div>
</div>
</body>
</html>
