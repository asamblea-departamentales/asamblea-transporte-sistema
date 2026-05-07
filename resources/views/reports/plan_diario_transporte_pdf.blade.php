<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">

    <style>
        @page {
            size: A4 landscape;
            margin: 8mm;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Helvetica, Arial, sans-serif;
            font-size: 8pt;
            color: #000;
            line-height: 1.1;
        }

        /* =========================
           HEADER
        ==========================*/
        .header-container {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
        }

        .header-container td {
            border: 1px solid #000;
            padding: 5px;
            vertical-align: middle;
        }

        .inst-title {
            text-align: center;
            text-transform: uppercase;
            font-weight: bold;
        }

        .header-logo {
            width: 70px;
            height: auto;
        }

        /* =========================
           TABLA PRINCIPAL
        ==========================*/
        .main-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .main-table tr {
            page-break-inside: avoid;
        }

        .main-table th,
        .main-table td {
            border: 1px solid #000;
            padding: 2px 3px;
            text-align: center;
            vertical-align: middle;
            word-wrap: break-word;
        }

        .main-table th {
            background: #f0f0f0;
            font-size: 7pt;
            text-transform: uppercase;
            font-weight: bold;
            height: 22px;
        }

        .main-table td {
            height: 26px;
            font-size: 7.5pt;
        }

        .text-left {
            text-align: left !important;
            padding-left: 5px !important;
        }

        /* =========================
           FOOTER
        ==========================*/
        .footer {
            margin-top: 8px;
            width: 100%;
            page-break-inside: avoid;
        }

        .turno-line {
            font-weight: bold;
            font-size: 9pt;
            text-transform: uppercase;
        }

        .signature-area {
            margin-top: 16px;
            text-align: center;
        }

        .signature-line {
            border-top: 1px solid #000;
            width: 220px;
            margin: 0 auto 4px;
        }

        .small-text {
            font-size: 7pt;
        }
    </style>
</head>

<body>

    @php
        $logo = public_path('images/logo.png');
        $minRows = 10;
    @endphp

    <table class="header-container">
        <tr>

            {{-- LOGO --}}
            <td style="width: 12%; text-align: center;">
                <img src="{{ $logo }}" class="header-logo">
            </td>

            {{-- TITULO --}}
            <td class="inst-title">

                <div style="font-size: 11pt;">
                    Asamblea Legislativa de El Salvador
                </div>

                <div style="font-size: 9pt; margin-top: 2px;">
                    Departamento de Transporte
                </div>

                <div style="font-size: 10pt; text-decoration: underline; margin-top: 5px;">
                    PLAN DIARIO DE TRANSPORTE
                </div>

            </td>

            {{-- FECHA --}}
            <td style="width: 20%; font-size: 7pt; line-height: 1.4;">
                <strong>FECHA:</strong>
                {{ $fecha->format('d/m/Y') }}
                <br>

                <strong>DÍA:</strong>
                {{ ucfirst($fecha->locale('es')->isoFormat('dddd')) }}
                <br>

                <strong>GENERADO:</strong>
                {{ now()->format('h:i A') }}
            </td>

        </tr>
    </table>

    {{-- TABLA --}}
    <table class="main-table">

        <thead>
            <tr>
                <th style="width: 8%;">Hora</th>
                <th style="width: 14%;">Unidad</th>
                <th style="width: 28%;">Destino</th>
                <th style="width: 11%;">Vehículo</th>
                <th style="width: 13%;">Motorista</th>
                <th style="width: 13%;">Usuario</th>
                <th style="width: 13%;">Comunicado</th>
            </tr>
        </thead>

        <tbody>

            @foreach($rows as $row)
            <tr>

                <td style="font-weight: bold;">
                    {{ $row['hora'] }}
                </td>

                <td class="text-left">
                    {{ $row['unidad'] }}
                </td>

                <td class="text-left">
                    {{ $row['destino'] }}
                </td>

                <td style="font-family: monospace; font-weight: bold;">
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
            @endforeach

            {{-- FILAS VACIAS --}}
            @for($i = count($rows); $i < $minRows; $i++)
            <tr>
                <td>&nbsp;</td>
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

        <div class="turno-line">
            TURNO:
            ____________________________________________________________
        </div>

        <div class="signature-area">

            <div class="signature-line"></div>

            <strong>
                JEFE DE DEPARTAMENTO DE TRANSPORTE
            </strong>

            <br>

            <span class="small-text">
                Firma y Sello
            </span>

        </div>

    </div>

</body>
</html>