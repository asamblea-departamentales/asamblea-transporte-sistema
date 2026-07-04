<!doctype html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Orden de Trabajo</title>
    <style>
        @page {
            margin: 22px 30px;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            color: #000;
            margin: 0;
        }

        .logo {
            text-align: center;
            margin-bottom: 6px;
        }

        .logo img {
            width: 85px;
        }

        .titulo {
            text-align: center;
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 16px;
        }

        .ticket-badge {
            text-align: center;
            font-size: 12px;
            font-weight: bold;
            color: #1a56db;
            margin-bottom: 10px;
        }

        .seccion-titulo {
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 12px 0 6px 0;
        }

        .tabla {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2px;
        }

        .tabla td {
            border: 1px solid #000;
            padding: 5px 8px;
            vertical-align: top;
            font-size: 11px;
        }

        .tabla td:first-child {
            font-weight: bold;
            width: 32%;
            background: #fff;
        }

        .bloque {
            border: 1px solid #000;
            padding: 6px 8px;
            margin: 8px 0;
            text-align: justify;
            font-size: 11px;
        }

        .bloque strong {
            display: block;
            margin-bottom: 3px;
        }

        .firma-wrapper {
            page-break-inside: avoid;
            margin-top: 30px;
        }

        .firma {
            text-align: center;
        }

        .linea {
            margin: 0 auto;
            width: 55%;
            border-top: 1px solid #000;
            margin-top: 40px;
            margin-bottom: 4px;
        }

        .salto {
            page-break-after: always;
        }

        .footer {
            position: fixed;
            bottom: -8px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 7px;
            color: #6b7280;
            padding-top: 3px;
        }
    </style>
</head>
<body>
    @foreach($rows as $r)
        <div class="logo">
            <img src="{{ public_path('images/logo-azul-fondo-transparente.png') }}" alt="Asamblea Legislativa">
        </div>

        <div class="titulo">ORDEN DE TRABAJO</div>

        @if(!empty($r->ticket))
        <div class="ticket-badge">Ticket #{{ $r->ticket }}</div>
        @endif

        <table class="tabla">
            <tr>
                <td>N° Orden / Solicitud</td>
                <td>{{ $r->codigo }}</td>
            </tr>
            <tr>
                <td>Fecha sugerida</td>
                <td>{{ optional($r->fecha_sugerida)->format('d/m/Y') ?? '—' }}</td>
            </tr>
            <tr>
                <td>Fecha realizada</td>
                <td>{{ optional($r->fecha_realizada)->format('d/m/Y') ?? '—' }}</td>
            </tr>
            <tr>
                <td>Solicitante</td>
                <td>{{ $r->solicitante?->name ?? '—' }}</td>
            </tr>
            <tr>
                <td>Aprobado por</td>
                <td>{{ $r->aprobador?->name ?? '—' }}</td>
            </tr>
            <tr>
                <td>Estado</td>
                <td>{{ ucfirst(str_replace('_', ' ', ($r->estado instanceof \UnitEnum ? $r->estado->value : $r->estado))) }}</td>
            </tr>
        </table>

        <div class="seccion-titulo">Datos del Vehículo</div>
        <table class="tabla">
            <tr>
                <td>Placa</td>
                <td>{{ $r->vehiculo?->placa ?? '—' }}</td>
            </tr>
            <tr>
                <td>Clase</td>
                <td>{{ $service->resolverClaseVehiculo($r) }}</td>
            </tr>
            <tr>
                <td>Marca</td>
                <td>{{ $service->resolverMarca($r) }}</td>
            </tr>
            <tr>
                <td>Modelo</td>
                <td>{{ $service->resolverModelo($r) }}</td>
            </tr>
            <tr>
                <td>Color</td>
                <td>{{ $service->resolverColor($r) }}</td>
            </tr>
            <tr>
                <td>Año</td>
                <td>{{ $r->vehiculo?->anio ?? '—' }}</td>
            </tr>
        </table>

        <div class="seccion-titulo">Detalle del Servicio</div>
        <table class="tabla">
            <tr>
                <td>Tipo de mantenimiento</td>
                <td>{{ $service->resolverTipoMantenimiento($r) }}</td>
            </tr>
            <tr>
                <td>Tipo de solicitud</td>
                <td>{{ $service->resolverTipoSolicitud($r) }}</td>
            </tr>
            <tr>
                <td>Costo estimado</td>
                <td>${{ number_format((float) ($r->costo_estimado ?? 0), 2) }}</td>
            </tr>
            <tr>
                <td>Costo real</td>
                <td>${{ number_format((float) ($r->costo_real ?? 0), 2) }}</td>
            </tr>
            @if($r->evaluacion_estado)
            <tr>
                <td>Evaluación Final</td>
                <td>
                    <strong>
                        {{ match($r->evaluacion_estado) {
                            'conforme' => 'CONFORME',
                            'observaciones' => 'CON OBSERVACIONES',
                            'no_conforme' => 'NO CONFORME',
                            default => $r->evaluacion_estado
                        } }}
                    </strong>
                    @if($r->evaluacion_comentario)
                        <br>
                        <span style="font-style: italic;">"{{ $r->evaluacion_comentario }}"</span>
                    @endif
                </td>
            </tr>
            @endif
            <tr>
                <td>Adjuntos</td>
                <td>{{ $service->resolverAdjuntos($r) }}</td>
            </tr>
        </table>

        <div class="bloque">
            <strong>Detalle del trabajo requerido:</strong>
            {{ $r->detalle ?? '—' }}
        </div>

        <div class="bloque">
            <strong>Observaciones de solicitud:</strong>
            {{ $r->observaciones ?? 'Sin observaciones.' }}
        </div>

        <div class="firma-wrapper">
            <div class="firma">
                <strong>Autoriza</strong>
                <div class="linea"></div>
                <div>Jose Alexander Portillo Hernandez</div>
                <div>Administrador de Contrato</div>
            </div>
        </div>

        @if(!$loop->last)
            <div class="salto"></div>
        @endif
    @endforeach

    <div class="footer">
        Palacio Legislativo, Centro de Gobierno Jose Simeón Cañas, San Salvador &mdash; Tel: (503) 2281-9116
    </div>
</body>
</html>