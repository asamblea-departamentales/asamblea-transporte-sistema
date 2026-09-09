<!doctype html>
<html lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Solicitud y Autorización de Vehículos y Combustible</title>

    <style>
        body{
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            margin: 28px 38px;
            color:#000;
        }

        .encabezado{
            width:100%;
            text-align:center;
            margin-bottom:20px;
            position:relative;
        }

        .logo{
            width:75px;
            margin-bottom:5px;
        }

        .institucion{
            font-size:10px;
            line-height:1.2;
            font-weight:bold;
            text-transform:uppercase;
        }

        .titulo{
            margin-top:12px;
            font-size:22px;
            font-weight:bold;
            text-transform:uppercase;
        }

        .ticket{
            position:absolute;
            right:0;
            top:15px;
            font-size:12px;
            font-weight:bold;
        }

        .linea-principal{
            border-top:1px solid #000;
            margin-top:10px;
        }

        table.formulario{
            width:100%;
            border-collapse:collapse;
            margin-top:20px;
        }

        table.formulario td{
            padding:6px 4px;
            vertical-align:bottom;
        }

        .label{
            width:220px;
            font-weight:normal;
            white-space:nowrap;
        }

        .valor{
            border-bottom:1px solid #000;
            width:auto;
            padding-left:8px;
            font-weight:bold;
        }

        .separacion{
            height:12px;
        }

        .dos-columnas{
            width:100%;
            margin-top:15px;
        }

        .dos-columnas td{
            vertical-align:top;
            width:50%;
        }

        .firma-section{
            margin-top:70px;
            width:100%;
        }

        .firma-table{
            width:100%;
            border-collapse:collapse;
        }

        .firma-table td{
            width:50%;
            text-align:center;
            vertical-align:top;
            padding:0 20px;
        }

        .firma-linea{
            border-top:1px solid #000;
            width:90%;
            margin:55px auto 6px;
        }

        .firma-label{
            font-size:11px;
            font-weight:bold;
        }

        .firma-nombre{
            font-size:10px;
            margin-top:2px;
        }

        .observaciones{
            margin-top:25px;
        }

        .observaciones-titulo{
            font-weight:bold;
            margin-bottom:6px;
        }

        .observaciones-box{
            border-bottom:1px solid #000;
            min-height:35px;
            padding:4px 2px;
        }

        .footer{
            position:fixed;
            bottom:-10px;
            left:0;
            right:0;
            text-align:center;
            font-size:8px;
        }
    </style>
</head>

<body>

<div class="encabezado">

    <div class="ticket">
        Ticket #{{ $datos['ticket'] }}
    </div>

    <img
        src="{{ public_path('images/logo-azul-fondo-transparente.png') }}"
        class="logo"
        alt="Logo"
    >

    <div class="institucion">
        REPÚBLICA DE EL SALVADOR<br>
        ASAMBLEA LEGISLATIVA<br>
        DIRECCIÓN DE TRANSPORTE Y LOGÍSTICA
    </div>

    <div class="titulo">
        @if($datos['modo'] === 'solo_transporte')
            SOLICITUD Y AUTORIZACIÓN DE VEHÍCULO
        @elseif($datos['modo'] === 'solo_combustible')
            SOLICITUD Y AUTORIZACIÓN DE CARGAS DE COMBUSTIBLE
        @else
            SOLICITUD Y AUTORIZACIÓN DE VEHÍCULOS Y COMBUSTIBLE
        @endif
    </div>

    <div class="linea-principal"></div>

</div>

<table class="formulario">

    <tr>
        <td class="label">Unidad o persona solicitante:</td>
        <td class="valor">
            {{ $datos['solicitante'] }} ,
            {{ $datos['unidad'] }}
        </td>
    </tr>

    <tr>
        <td class="label">Hora y fecha de salida:</td>
        <td class="valor">
            {{ $datos['fecha_salida'] }}
            ,
            {{ $datos['hora_salida'] }}
        </td>
    </tr>

    <tr>
        <td class="label">Motorista:</td>
        <td class="valor">
            {{ $datos['motorista'] }}
        </td>
    </tr>

    <tr>
        <td class="label">Destino y actividad a realizar:</td>
        <td class="valor">
            {{ $datos['motivo'] }}
            ,
            {{ $datos['destino'] }}

            @if($datos['destino_adicional'] !== 'Sin destino adicional')
                ,
                {{ $datos['destino_adicional'] }}
            @endif
        </td>
    </tr>

</table>

<table class="dos-columnas">

    <tr>

        <td>

            <table class="formulario">

                <tr>
                    <td class="label">Tipo vehículo:</td>
                    <td class="valor">
                        {{ $datos['tipo_vehiculo'] }}
                    </td>
                </tr>

                @if($datos['modo'] !== 'solo_transporte')
                <tr>
                    <td class="label">Modo de Combustible:</td>
                    <td class="valor">
                        {{ $datos['tipo_combustible'] }}
                    </td>
                </tr>
                @endif

                @if($datos['modo'] !== 'solo_transporte')
                <tr>
                    <td class="label">Total $:</td>
                    <td class="valor">
                        $ {{ number_format($datos['monto_combustible'], 2) }}
                    </td>
                </tr>
                @endif

            </table>

        </td>

        <td>

            <table class="formulario">

                <tr>
                    <td class="label">Placa:</td>
                    <td class="valor">
                        {{ $datos['placa'] }}
                    </td>
                </tr>

            </table>

        </td>

    </tr>

</table>

<div class="observaciones">

    <div class="observaciones-titulo">
        Observaciones:
    </div>

    <div class="observaciones-box">
        {{ $datos['observaciones'] }}
    </div>

</div>

<div class="firma-section">

    <table class="firma-table">

        <tr>

            <td>
                <div class="firma-linea"></div>

                <div class="firma-label">
                    Jefe de Transporte
                </div>

                <div class="firma-nombre">
                    &nbsp;
                </div>
            </td>

            <td>
                <div class="firma-linea"></div>

                <div class="firma-label">
                    Diputada
                </div>

                <div class="firma-nombre">
                    Elisa Marcela Rosales Ramirez
                </div>
            </td>

        </tr>

    </table>

</div>

<div class="footer">
    Documento generado el {{ now()->format('d/m/Y H:i') }}
</div>

</body>
</html>