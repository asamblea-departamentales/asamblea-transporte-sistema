<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo e($subject); ?></title>
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
    width:40px;          /* 👈 Más pequeño */
    height:40px;
    border-radius:50%;
    overflow:hidden;
    background:#0f172a;
    display:flex;
    align-items:center;
    justify-content:center;
    flex-shrink:0;
}
    .email-logo img {
    width:80%;           /* 👈 El logo ocupará 80% del círculo */
    height:80%;
    object-fit:contain;
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
        <div class="email-logo">
            <img src="<?php echo e(asset('images/logo-blanco-fondo-transparente.png')); ?>" alt="Logo">
        </div>
        <div class="email-header-text">
            <h1><?php echo e($subject); ?></h1>
            <p>Sistema de Gestión de Solicitudes - Asamblea Legislativa de El Salvador</p>
        </div>
    </div>

    <div class="email-body">
        <?php
            $tipo = $payload['tipo'] ?? 'transporte';
        ?>

        <div class="tipo-chip">
            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($tipo === 'transporte'): ?>
                Solicitud de transporte
            <?php elseif($tipo === 'combustible'): ?>
                Solicitud de combustible
            <?php elseif($tipo === 'mantenimiento'): ?>
                Solicitud de mantenimiento
            <?php else: ?>
                Notificación de solicitud
            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
        </div>

        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($payload['mensaje'])): ?>
            <div class="alert-box">
                <?php echo e($payload['mensaje']); ?>

            </div>
        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($payload['solicitud']['codigo'])): ?>
            <div class="codigo-section">
                <div class="codigo-label">
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!empty($payload['es_extension'])): ?>
                        Código de solicitud (extensión)
                    <?php else: ?>
                        Código de solicitud
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
                <div class="codigo-value">
                    <?php echo e($payload['solicitud']['codigo']); ?>

                </div>

                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(!empty($payload['es_extension']) && isset($payload['solicitud']['codigo_original'])): ?>
                    <div class="extension-badge">
                        Extensión de: <?php echo e($payload['solicitud']['codigo_original']); ?>

                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($tipo === 'transporte' && isset($payload['solicitud'])): ?>
            <div class="details-grid">
                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($payload['solicitud']['estado'])): ?>
                    <div class="detail-item-full">
                        <div class="detail-label">Estado</div>
                        <div class="detail-value">
                            <span class="status-badge status-<?php echo e($payload['solicitud']['estado']); ?>">
                                <?php echo e(ucfirst(str_replace('_',' ', $payload['solicitud']['estado']))); ?>

                            </span>
                        </div>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>>

                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($payload['solicitud']['tipo_vehiculo_nombre'])): ?>
                    <div class="detail-item">
                        <div class="detail-label">Tipo de vehículo</div>
                        <div class="detail-value">
                            <?php echo e(ucfirst($payload['solicitud']['tipo_vehiculo_nombre'])); ?>

                        </div>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>>

                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($payload['solicitud']['cantidad_personas'])): ?>
                    <div class="detail-item">
                        <div class="detail-label">Cantidad de personas</div>
                        <div class="detail-value">
                            <?php echo e($payload['solicitud']['cantidad_personas']); ?> personas
                        </div>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>>

                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($payload['solicitud']['origen'])): ?>
                    <div class="detail-item-full">
                        <div class="detail-label">Origen</div>
                        <div class="detail-value">
                            <?php echo e($payload['solicitud']['origen']); ?>

                        </div>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>>

                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($payload['solicitud']['destino'])): ?>
                    <div class="detail-item-full">
                        <div class="detail-label">Destino principal</div>
                        <div class="detail-value">
                            <?php echo e($payload['solicitud']['destino']); ?>

                        </div>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>>

                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($payload['solicitud']['destino_adicional']) && $payload['solicitud']['destino_adicional'] !== ''): ?>
                    <div class="detail-item-full">
                        <div class="detail-label">Destino adicional</div>
                        <div class="detail-value">
                            <?php echo e($payload['solicitud']['destino_adicional']); ?>

                        </div>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>>

                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($payload['solicitud']['fecha_salida'])): ?>
                    <div class="detail-item">
                        <div class="detail-label">Fecha de salida</div>
                        <div class="detail-value">
                            <?php echo e(\Carbon\Carbon::parse($payload['solicitud']['fecha_salida'])->format('d/m/Y H:i')); ?>

                        </div>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>>

                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($payload['solicitud']['fecha_retorno'])): ?>
                    <div class="detail-item">
                        <div class="detail-label">Fecha de retorno</div>
                        <div class="detail-value">
                            <?php echo e(\Carbon\Carbon::parse($payload['solicitud']['fecha_retorno'])->format('d/m/Y H:i')); ?>

                        </div>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>>

                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($payload['solicitud']['motivo_actividad'])): ?>
                    <div class="detail-item-full">
                        <div class="detail-label">Motivo de la actividad</div>
                        <div class="detail-value">
                            <?php echo e($payload['solicitud']['motivo_actividad']); ?>

                        </div>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>

            <?php
                $origen = $payload['solicitud']['origen'] ?? 'San Salvador';
                $destino = $payload['solicitud']['destino'] ?? 'Centro Histórico, San Salvador';
                $destinoAd = $payload['solicitud']['destino_adicional'] ?? null;
                $mapUrl = App\Helpers\MapHelper::generarMapaTransporte($origen, $destino, $destinoAd);
            ?>

            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($mapUrl): ?>
                <div class="map-section">
                    <div class="map-header">
                        Mapa de El Salvador - referencia de ruta
                    </div>
                    <div class="map-body">
                        <div>
                            Trayecto solicitado:
                            <strong><?php echo e($origen); ?></strong>
                            →
                            <strong><?php echo e($destino); ?></strong>
                            <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($destinoAd): ?>
                                →
                                <strong><?php echo e($destinoAd); ?></strong>
                            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                        </div>

                        <div class="map-image-wrapper">
                            <img src="<?php echo e($mapUrl); ?>" alt="Mapa de ruta en El Salvador">
                        </div>
                        <div class="map-note">
                            Mapa generado automáticamente con base en los destinos indicados.
                        </div>
                    </div>
                </div>
            <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
        <?php elseif($tipo === 'combustible' && isset($payload['solicitud'])): ?>
            <div class="details-grid">
                <div class="detail-item-full">
                    <div class="detail-label">Tipo de solicitud</div>
                    <div class="detail-value">Combustible</div>
                </div>

                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($payload['solicitud']['vehiculo'])): ?>
                    <div class="detail-item">
                        <div class="detail-label">Vehículo</div>
                        <div class="detail-value"><?php echo e($payload['solicitud']['vehiculo']); ?></div>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>>

                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($payload['solicitud']['cantidad_combustible'])): ?>
                    <div class="detail-item">
                        <div class="detail-label">Cantidad solicitada</div>
                        <div class="detail-value"><?php echo e($payload['solicitud']['cantidad_combustible']); ?></div>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>>

                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($payload['solicitud']['motivo'])): ?>
                    <div class="detail-item-full">
                        <div class="detail-label">Motivo</div>
                        <div class="detail-value"><?php echo e($payload['solicitud']['motivo']); ?></div>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
        <?php elseif($tipo === 'mantenimiento' && isset($payload['solicitud'])): ?>
            <div class="details-grid">
                <div class="detail-item-full">
                    <div class="detail-label">Tipo de solicitud</div>
                    <div class="detail-value">Mantenimiento de vehículo</div>
                </div>

                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($payload['solicitud']['vehiculo'])): ?>
                    <div class="detail-item">
                        <div class="detail-label">Vehículo</div>
                        <div class="detail-value"><?php echo e($payload['solicitud']['vehiculo']); ?></div>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>>

                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($payload['solicitud']['tipo_mantenimiento'])): ?>
                    <div class="detail-item">
                        <div class="detail-label">Tipo de mantenimiento</div>
                        <div class="detail-value"><?php echo e($payload['solicitud']['tipo_mantenimiento']); ?></div>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>>

                <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($payload['solicitud']['descripcion_falla'])): ?>
                    <div class="detail-item-full">
                        <div class="detail-label">Descripción de la falla</div>
                        <div class="detail-value"><?php echo e($payload['solicitud']['descripcion_falla']); ?></div>
                    </div>
                <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
            </div>
        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>

        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($payload['solicitante'])): ?>
            <div class="solicitante-section">
                <h3>Información del solicitante</h3>
                <div class="solicitante-info">
                    <div class="solicitante-item">
                        <strong>Nombre</strong>
                        <?php echo e($payload['solicitante']['name'] ?? ''); ?>

                    </div>
                    <div class="solicitante-item">
                        <strong>Correo</strong>
                        <?php echo e($payload['solicitante']['email'] ?? ''); ?>

                    </div>
                    <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($payload['solicitante']['unidad'])): ?>
                        <div class="solicitante-item">
                            <strong>Unidad</strong>
                            <?php echo e($payload['solicitante']['unidad']['nombre'] ?? ''); ?>

                        </div>
                        <div class="solicitante-item">
                            <strong>Siglas</strong>
                            <?php echo e($payload['solicitante']['unidad']['siglas'] ?? ''); ?>

                        </div>
                    <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
                </div>
            </div>
        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
    </div>

    <div class="email-footer">
        <p><strong>Asamblea Legislativa de El Salvador</strong></p>
        <p>Unidad de Transporte y Logística</p>
        <?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if(isset($payload['timestamp'])): ?>
            <p class="timestamp">
                <?php echo e(\Carbon\Carbon::parse($payload['timestamp'])->format('d/m/Y H:i:s')); ?>

            </p>
        <?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
    </div>
</div>
</body>
</html>
<?php /**PATH C:\Users\steve\transporte-asamblea01\resources\views\emails\notificacion_event.blade.php ENDPATH**/ ?>