<!doctype html>
<html lang="es">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Hoja de Registro de Vehículos</title>

    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 9px;
            margin: 20px;
            color: #000;
        }

        .header {
            text-align: center;
            margin-bottom: 10px;
        }

        .logo {
            width: 80px;
            margin-bottom: 5px;
        }

        .institucion {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .titulo {
            font-size: 18px;
            font-weight: bold;
            margin: 0;
        }

        .subtitulo {
            font-size: 12px;
            font-weight: bold;
            margin: 3px 0;
        }

        .periodo {
            font-size: 11px;
            font-weight: bold;
            margin-top: 8px;
        }

        .info-vehiculo {
            width: 100%;
            margin-top: 12px;
            margin-bottom: 12px;
            border-collapse: collapse;
        }

        .info-vehiculo td {
            padding: 4px;
            border: none;
            font-size: 10px;
        }

        .info-vehiculo strong {
            font-weight: bold;
        }

        .data {
            width: 100%;
            border-collapse: collapse;
        }

        .data th,
        .data td {
            border: 1px solid #999;
            padding: 4px;
            vertical-align: middle;
        }

        .data th {
            background: #f2f2f2;
            text-align: center;
            font-size: 8px;
            font-weight: bold;
        }

        .data td {
            font-size: 8px;
        }

        .center {
            text-align: center;
        }

        .right {
            text-align: right;
        }

        .fuel-wrapper {
            width: 100px;
            margin: auto;
        }

        .fuel-bar {
            width: 100px;
            height: 12px;
            border: 1px solid #777;
            position: relative;
            overflow: hidden;
        }

        .fuel-fill {
            height: 100%;
            background: linear-gradient(
                to right,
                #d32f2f 0%,
                #fbc02d 50%,
                #388e3c 100%
            );
        }

        .fuel-label {
            font-size: 7px;
            text-align: center;
            margin-top: 2px;
        }

        .totales {
            margin-top: 10px;
            text-align: right;
            font-size: 10px;
            font-weight: bold;
        }

        .footer {
            position: fixed;
            bottom: -15px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 8px;
        }
    </style>
</head>

<body>

    <div class="header">

        <img
            src="{{ public_path('images/logo-azul-fondo-transparente.png') }}"
            class="logo"
            alt="Logo">

        <div class="institucion">
            ASAMBLEA LEGISLATIVA
        </div>

        <div class="titulo">
            HOJA DE REGISTRO DE VEHÍCULOS
        </div>

        <div class="subtitulo">
            Departamento de Transporte - Asamblea Legislativa
        </div>

        <div class="periodo">
            PERÍODO:
            DEL {{ \Carbon\Carbon::parse($fechaInicio)->locale('es')->isoFormat('D [DE] MMMM [DE] YYYY') }}
            AL {{ \Carbon\Carbon::parse($fechaFin)->locale('es')->isoFormat('D [DE] MMMM [DE] YYYY') }}
        </div>

    </div>

    <table class="info-vehiculo">
        <tr>
            <td>
                <strong>Placa:</strong>
                {{ $datosVehiculo['placa'] }}
            </td>

            <td>
                <strong>Vehículo:</strong>
                {{ $datosVehiculo['tipo_nombre'] }}
            </td>

            <td>
                <strong>Tipo de Combustible:</strong>
                {{ $datosVehiculo['combustible_nombre'] }}
            </td>
        </tr>
    </table>

    @if($registros->isEmpty())

        <p style="text-align:center; margin-top:40px;">
            No se encontraron registros para el período seleccionado.
        </p>

    @else

        @php
            $totalKm = 0;
        @endphp

        <table class="data">

            <thead>

                <tr>

                    <th rowspan="2" style="width:8%;">
                        FECHA
                    </th>

                    <th colspan="2" style="width:16%;">
                        KILOMETRAJE
                    </th>

                    <th rowspan="2" style="width:8%;">
                        KMS.<br>RECORRIDOS
                    </th>

                    <th rowspan="2" style="width:26%;">
                        LUGARES RECORRIDOS
                    </th>

                    <th rowspan="2" style="width:18%;">
                        NOMBRE DEL MOTORISTA
                    </th>

                    <th colspan="2" style="width:24%;">
                        CONDICIÓN DEL TANQUE
                    </th>

                </tr>

                <tr>

                    <th>
                        INICIAL
                    </th>

                    <th>
                        FINAL
                    </th>

                    <th>
                        SALIDA
                    </th>

                    <th>
                        REGRESO
                    </th>

                </tr>

            </thead>

            <tbody>

                @foreach($registros as $r)

                    @php

                        $fecha = $r['fecha']
                            ? \Carbon\Carbon::parse($r['fecha'])->format('d/m/Y')
                            : '—';

                        $kmInicial = $r['km_inicial'];
                        $kmFinal   = $r['km_final'];

                        $kmRec = $r['km_recorridos'];

                        if ($kmRec !== null) {
                            $totalKm += $kmRec;
                        }

                    @endphp

                    <tr>

                        <td class="center">
                            {{ $fecha }}
                        </td>

                        <td class="right">
                            {{ $kmInicial ? number_format($kmInicial,0) : '—' }}
                        </td>

                        <td class="right">
                            {{ $kmFinal ? number_format($kmFinal,0) : '—' }}
                        </td>

                        <td class="center">
                            {{ $kmRec ? number_format($kmRec,0) : '—' }}
                        </td>

                        <td>
                            {{ $r['lugares'] }}
                        </td>

                        <td>
                            {{ $r['motorista_nombre'] }}
                        </td>

                        <td class="center">

                            @if($r['combustible_salida'] !== null)

                                <div class="fuel-wrapper">

                                    <div class="fuel-bar">
                                        <div
                                            class="fuel-fill"
                                            style="width: {{ $r['combustible_salida'] }}%;">
                                        </div>
                                    </div>

                                    <div class="fuel-label">
                                        {{ $r['combustible_salida'] }}%
                                    </div>

                                </div>

                            @else
                                —
                            @endif

                        </td>

                        <td class="center">

                            @if($r['combustible_regreso'] !== null)

                                <div class="fuel-wrapper">

                                    <div class="fuel-bar">
                                        <div
                                            class="fuel-fill"
                                            style="width: {{ $r['combustible_regreso'] }}%;">
                                        </div>
                                    </div>

                                    <div class="fuel-label">
                                        {{ $r['combustible_regreso'] }}%
                                    </div>

                                </div>

                            @else
                                —
                            @endif

                        </td>

                    </tr>

                @endforeach

            </tbody>

        </table>

        <div class="totales">
            TOTAL DE KILÓMETROS RECORRIDOS:
            {{ number_format($totalKm, 0) }} KM
        </div>

    @endif

    <div class="footer">
        Asamblea Legislativa de El Salvador |
        Sistema de Gestión de Transporte |
        Página
        <script type="text/php">
            echo $PAGE_NUM . " de " . $PAGE_COUNT;
        </script>
    </div>

</body>
</html>