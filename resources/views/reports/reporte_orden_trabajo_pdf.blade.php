<!doctype html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Orden de Trabajo</title>

    <style>

        body{
            font-family: Arial, Helvetica, sans-serif;
            font-size:11px;
            color:#000;
            margin:28px;
        }

        .logo{
            text-align:center;
            margin-bottom:6px;
        }

        .logo img{
            width:85px;
        }

        .titulo{
            text-align:center;
            font-size:18px;
            font-weight:bold;
            margin-bottom:5px;
        }

        .subtitulo{
            text-align:center;
            font-size:11px;
            margin-bottom:15px;
        }

        .tabla{
            width:100%;
            border-collapse:collapse;
            margin-bottom:12px;
        }

        .tabla td{
            border:1px solid #555;
            padding:7px 8px;
            vertical-align:middle;
            font-size:11px;
        }

        .tabla td:first-child{
            width:34%;
            font-weight:bold;
            vertical-align:top;
        }

        .titulo-bloque{
            text-align:center;
            font-weight:bold;
            font-size:11px;
            letter-spacing:.4px;
            padding:7px;
            background:#f3f3f3;
            border:1px solid #555;
        }

        .texto-largo{
            min-height:70px;
            text-align:justify;
            vertical-align:top !important;
            line-height:1.5;
        }

        .firma{
            margin-top:55px;
            text-align:center;
        }

        .firma-linea{

            width:250px;

            margin:65px auto 8px auto;

            border-top:1px solid #000;

        }

        .footer{
            position:fixed;
            bottom:-20px;
            left:0;
            right:0;
            text-align:center;
            font-size:9px;
            border-top:1px solid #999;
            padding-top:4px;
        }

        .salto{
            page-break-after:always;
        }

    </style>

</head>

<body>

@foreach($rows as $r)

<div class="logo">
    <img src="{{ public_path('images/logo-azul-fondo-transparente.png') }}">
</div>

<div class="titulo">
    ORDEN DE TRABAJO
</div>

<div class="subtitulo">
    Sistema de Gestión de Transporte - Mantenimiento
</div>

@if(!empty($r->ticket))
<div style="text-align:center;font-size:12px;font-weight:bold;margin-bottom:12px;">
    Ticket #{{ $r->ticket }}
</div>
@endif

<table class="tabla">

    <tr>
        <td colspan="2" class="titulo-bloque">
            DATOS GENERALES
        </td>
    </tr>

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
        <td>
            {{ ucfirst(str_replace('_',' ',($r->estado instanceof \UnitEnum ? $r->estado->value : $r->estado))) }}
        </td>
    </tr>

</table>

<table class="tabla">

    <tr>
        <td colspan="2" class="titulo-bloque">
            DATOS DEL VEHÍCULO
        </td>
    </tr>

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
<table class="tabla">

    <tr>
        <td colspan="2" class="titulo-bloque">
            DETALLE DEL SERVICIO
        </td>
    </tr>

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
        <td>${{ number_format((float) ($r->costo_estimado ?? 0),2) }}</td>
    </tr>

    <tr>
        <td>Costo real</td>
        <td>${{ number_format((float) ($r->costo_real ?? 0),2) }}</td>
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

                <br><br>

                {{ $r->evaluacion_comentario }}

            @endif

        </td>

    </tr>
    @endif

    <tr>
        <td>Adjuntos</td>
        <td>{{ $service->resolverAdjuntos($r) }}</td>
    </tr>

</table>



<table class="tabla">

    <tr>
        <td class="titulo-bloque">
            DETALLE DEL TRABAJO REQUERIDO
        </td>
    </tr>

    <tr>

        <td class="texto-largo">

            {{ $r->detalle ?? '—' }}

        </td>

    </tr>

</table>



<table class="tabla">

    <tr>
        <td class="titulo-bloque">
            OBSERVACIONES
        </td>
    </tr>

    <tr>

        <td class="texto-largo">

            {{ $r->observaciones ?? 'Sin observaciones.' }}

        </td>

    </tr>

</table>
<div class="firma">

    <div>

        <strong>Autoriza</strong>

    </div>

    <div class="firma-linea"></div>

    <div>

        <strong>

            Jose Alexander Portillo Hernandez

        </strong>

    </div>

    <div>

        Administrador de Contrato

    </div>

</div>

@if(!$loop->last)

<div class="salto"></div>

@endif

@endforeach



<div class="footer">

    Palacio Legislativo, Centro de Gobierno José Simeón Cañas, San Salvador

    &nbsp;&nbsp;|&nbsp;&nbsp;

    Tel: (503) 2281-9116

</div>

</body>
</html>