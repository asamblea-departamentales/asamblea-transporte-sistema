<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <style>
        /* Configuración de página horizontal */
        @page {
            size: A4 landscape;
            margin: 10mm;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 8.5pt;
            color: #000;
            background: #fff;
            line-height: 1.2;
        }

        /* ENCABEZADO */
        .header-container {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        .header-container td {
            border: 1.5px solid #000;
            padding: 8px;
            vertical-align: middle;
        }

        .inst-title {
            text-align: center;
            text-transform: uppercase;
            font-weight: bold;
        }

        /* TABLA PRINCIPAL - ESTILO LAS FOTOS */
        .main-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed; /* Mantiene los anchos fijos */
        }

        .main-table th, .main-table td {
            border: 1px solid #000;
            padding: 5px 3px;
            text-align: center;
            vertical-align: middle;
            word-wrap: break-word;
        }

        .main-table th {
            background-color: #f0f0f0;
            font-size: 7.5pt;
            text-transform: uppercase;
            font-weight: bold;
            height: 30px;
        }

        .main-table td {
            height: 38px; /* Altura generosa para que se vea como el formulario físico */
        }

        .text-left { text-align: left !important; padding-left: 6px !important; }

        /* PIE DE PÁGINA (TURNO Y FIRMA) */
        .footer {
            margin-top: 15px;
            width: 100%;
        }

        .turno-line {
            font-weight: bold;
            font-size: 10pt;
            text-transform: uppercase;
        }

        .signature-area {
            margin-top: 30px;
            text-align: center;
        }

        .signature-line {
            border-top: 1.5px solid #000;
            width: 250px;
            margin: 0 auto 5px;
        }
    </style>
</head>
<body>

    <table class="header-container">
        <tr>
            <td style="width: 15%; text-align: center;">
                <strong>LOGO</strong>
            </td>
            <td class="inst-title">
                <div style="font-size: 12pt;">Asamblea Legislativa de El Salvador</div>
                <div style="font-size: 10pt; margin-top: 3px;">Departamento de Transporte</div>
                <div style="font-size: 11pt; text-decoration: underline; margin-top: 8px;">PLAN DIARIO DE TRANSPORTE</div>
            </td>
            <td style="width: 22%; font-size: 8pt;">
                <strong>FECHA:</strong> {{ $fecha->format('d/m/Y') }}<br>
                <strong>DÍA:</strong> {{ ucfirst($fecha->locale('es')->isoFormat('dddd')) }}<br>
                <strong>GENERADO:</strong> {{ now()->format('h:i A') }}
            </td>
        </tr>
    </table>

    <table class="main-table">
        <thead>
            <tr>
                <th style="width: 8%;">Hora de Salida</th>
                <th style="width: 14%;">Unidad Solicitante</th>
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
                <td style="font-weight: bold;">{{ $row['hora'] }}</td>
                <td class="text-left">{{ $row['unidad'] }}</td>
                <td class="text-left" style="font-size: 7.5pt;">{{ $row['destino'] }}</td>
                <td style="font-family: monospace; font-weight: bold;">{{ $row['vehiculo'] }}</td>
                <td>{{ $row['motorista'] }}</td>
                <td>{{ $row['solicitante'] }}</td>
                <td>{{ $row['comunicado'] ?? '' }}</td>
            </tr>
            @endforeach

            {{-- Rellenar con filas vacías hasta completar 12 filas (como en tu foto) --}}
            @for($i = count($rows); $i < 12; $i++)
            <tr>
                <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            @endfor
        </tbody>
    </table>

    <div class="footer">
        <div class="turno-line">
            TURNO: __________________________________________________________________
        </div>

        <div class="signature-area">
            <div class="signature-line"></div>
            <strong>JEFE DE DEPARTAMENTO DE TRANSPORTE</strong><br>
            <span style="font-size: 7pt;">Firma y Sello</span>
        </div>
    </div>

</body>
</html>