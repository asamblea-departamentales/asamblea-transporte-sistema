<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">

    <style>
        @page {
            size: A4 portrait;
            margin: 10mm;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: "Times New Roman", serif;
            font-size: 8px;
            color: #000;
        }

        /* =========================
           ENCABEZADO
        ========================== */

        .header {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2px;
        }

        .header td {
            border: 1px solid #000;
            vertical-align: middle;
            padding: 3px;
        }

        .logo-cell {
            width: 80px;
            text-align: center;
        }

        .logo-cell img {
            width: 55px;
            height: auto;
        }

        .title-cell {
            text-align: center;
        }

        .title-main {
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .title-sub {
            font-size: 8px;
            margin-top: 2px;
        }

        .title-doc {
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 3px;
        }

        .meta-cell {
            width: 120px;
            font-size: 7px;
        }

        .meta-cell div {
            margin-bottom: 2px;
        }

        /* =========================
           TABLA
        ========================== */

        .main-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .main-table th,
        .main-table td {
            border: 1px solid #000;
            padding: 2px;
            vertical-align: middle;
            text-align: center;
        }

        .main-table th {
            font-size: 7px;
            font-weight: bold;
            text-transform: uppercase;
            height: 32px;
        }

        .main-table td {
            font-size: 7px;
            height: 60px;
        }

        .hora {
            width: 9%;
            font-weight: bold;
        }

        .unidad {
            width: 13%;
        }

        .destino {
            width: 40%;
            text-align: left;
            padding-left: 4px;
        }

        .vehiculo {
            width: 13%;
        }

        .motorista {
            width: 12%;
        }

        .usuario {
            width: 8%;
        }

        .comunicado {
            width: 5%;
        }

        .empty-row td {
            height: 62px;
        }

        /* =========================
           FOOTER
        ========================== */

        .footer {
            margin-top: 8px;
            width: 100%;
        }

        .turno {
            font-size: 8px;
            font-weight: bold;
            margin-bottom: 35px;
        }

        .turno-line {
            display: inline-block;
            border-bottom: 1px solid #000;
            width: 140px;
            height: 10px;
            margin-left: 5px;
        }

        .firma {
            text-align: center;
        }

        .firma-line {
            border-top: 1px solid #000;
            width: 220px;
            margin: 0 auto 3px;
        }

        .firma-label {
            font-size: 8px;
            font-weight: bold;
        }
    </style>
</head>

<body>

    {{-- HEADER --}}
    <table class="header">

        <tr>

            <td class="logo-cell">
                <img
                    src="{{ public_path('images/logo-azul-fondo-transparente.png') }}"
                    alt="Logo"
                >
            </td>

            <td class="title-cell">

                <div class="title-main">
                    Asamblea Legislativa de El Salvador
                </div>

                <div class="title-sub">
                    Departamento de Transporte
                </div>

                <div class="title-doc">
                    Plan Diario de Transporte
                </div>

            </td>

            <td class="meta-cell">

                <div>
                    <strong>Fecha:</strong>
                    {{ $fecha->format('d/m/Y') }}
                </div>

                <div>
                    <strong>Día:</strong>
                    {{ ucfirst($fecha->locale('es')->isoFormat('dddd')) }}
                </div>

                <div>
                    <strong>Hora:</strong>
                    {{ now()->format('h:i A') }}
                </div>

            </td>

        </tr>

    </table>

    {{-- TABLA --}}
    <table class="main-table">

        <thead>
            <tr>

                <th class="hora">
                    Hora de<br>Salida
                </th>

                <th class="unidad">
                    Unidad Solicitante
                </th>

                <th class="destino">
                    Destino
                </th>

                <th class="vehiculo">
                    Vehículo
                </th>

                <th class="motorista">
                    Motorista
                </th>

                <th class="usuario">
                    Usuario
                </th>

                <th class="comunicado">
                    Comunicado
                </th>

            </tr>
        </thead>

        <tbody>

            @forelse($rows as $row)

            <tr>

                <td class="hora">
                    {{ $row['hora'] }}
                </td>

                <td>
                    {{ $row['unidad'] }}
                </td>

                <td class="destino">
                    {{ $row['destino'] }}
                </td>

                <td>
                    {{ $row['vehiculo'] }}
                </td>

                <td>
                    {{ $row['motorista'] }}
                </td>

                <td>
                    {{ $row['solicitante'] }}
                </td>

                <td>
                    {{ $row['comunicado'] ?? '' }}
                </td>

            </tr>

            @empty

            <tr>
                <td colspan="7" style="height:80px;">
                    No hay registros.
                </td>
            </tr>

            @endforelse

            {{-- FILAS VACIAS --}}
            @php
                $relleno = max(0, 10 - count($rows));
            @endphp

            @for($i = 0; $i < $relleno; $i++)

            <tr class="empty-row">
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>

            @endfor

        </tbody>

    </table>

    {{-- FOOTER --}}
    <div class="footer">

        <div class="turno">
            TURNO:
            <span class="turno-line"></span>
        </div>

        <div class="firma">

            <div class="firma-line"></div>

            <div class="firma-label">
                JEFE DE TRANSPORTE
            </div>

        </div>

    </div>

</body>
</html>