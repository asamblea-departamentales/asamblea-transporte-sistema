<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <style>
        /* Configuración de página horizontal para coincidir con la foto */
        @page {
            size: A4 landscape;
            margin: 8mm; /* Margen ligeramente más pequeño para ganar espacio */
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 8pt; /* Tamaño un poco más compacto para que quepa todo */
            color: #000;
            background: #fff;
        }

        /* ENCABEZADO ESTILO FORMULARIO */
        .header-container {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
        }

        .header-container td {
            border: 1.5pt solid #000; /* Bordes más gruesos en el encabezado */
            padding: 6px;
            vertical-align: middle;
        }

        .inst-title {
            text-align: center;
            text-transform: uppercase;
            font-weight: bold;
        }

        /* TABLA PRINCIPAL - CALCADA DE LA IMAGEN */
        .main-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .main-table th, .main-table td {
            border: 1pt solid #000; /* Bordes negros sólidos */
            padding: 2px 4px;
            text-align: center;
            vertical-align: middle;
            word-wrap: break-word;
            overflow: hidden;
        }

        .main-table th {
            background-color: #ffffff; /* Totalmente blanco para B/N puro */
            font-size: 7.5pt;
            text-transform: uppercase;
            font-weight: bold;
            height: 35px; /* Altura de la cabecera */
        }

        /* Altura de las celdas para que se vean espaciosas como en la foto */
        .main-table td {
            height: 42px; 
            font-size: 8.5pt;
        }

        /* Estilos específicos para columnas */
        .text-left { text-align: left !important; padding-left: 5px !important; }
        .font-small { font-size: 7.5pt !important; }
        .bold { font-weight: bold; }

        /* PIE DE PÁGINA */
        .footer {
            margin-top: 10px;
            width: 100%;
        }

        .turno-area {
            border-top: 1.5pt solid #000;
            padding-top: 5px;
            font-weight: bold;
            font-size: 9pt;
            text-transform: uppercase;
        }

        .signature-container {
            margin-top: 25px;
            width: 100%;
            text-align: center;
        }

        .signature-box {
            display: inline-block;
            width: 300px;
            text-align: center;
        }

        .signature-line {
            border-top: 1pt solid #000;
            margin-bottom: 4px;
        }
    </style>
</head>
<body>

    <table class="header-container">
        <tr>
            <td style="width: 12%; text-align: center;">
                <div style="font-weight: bold; border: 1pt solid #000; padding: 10px; border-radius: 50%;">1</div>
            </td>
            <td class="inst-title">
                <div style="font-size: 13pt;">Asamblea Legislativa de El Salvador</div>
                <div style="font-size: 10pt; margin-top: 2px;">Departamento de Transporte</div>
                <div style="font-size: 11pt; text-decoration: underline; margin-top: 6px;">PLAN DIARIO DE TRANSPORTE</div>
            </td>
            <td style="width: 20%; font-size: 8pt; line-height: 1.4;">
                <strong>FECHA:</strong> {{ $fecha->format('d/m/Y') }}<br>
                <strong>DÍA:</strong> {{ strtoupper($fecha->locale('es')->isoFormat('dddd')) }}<br>
                <strong>HORA:</strong> {{ now()->format('h:i A') }}
            </td>
        </tr>
    </table>

    <table class="main-table">
        <thead>
            <tr>
                <th style="width: 8%;">Hora de<br>Salida</th>
                <th style="width: 14%;">Unidad Solicitante</th>
                <th style="width: 30%;">Destino</th>
                <th style="width: 10%;">Vehículo</th>
                <th style="width: 12%;">Motorista</th>
                <th style="width: 12%;">Usuario</th>
                <th style="width: 8%;">Comunicado</th>
            </tr>
        </thead>
        <tbody>
            @foreach($rows as $row)
            <tr>
                <td class="bold">{{ $row['hora'] }}</td>
                <td class="text-left font-small">{{ $row['unidad'] }}</td>
                <td class="text-left font-small">{{ $row['destino'] }}</td>
                <td class="bold" style="font-family: 'Courier New', Courier, monospace;">{{ $row['vehiculo'] }}</td>
                <td class="font-small">{{ $row['motorista'] }}</td>
                <td class="font-small">{{ $row['solicitante'] }}</td>
                <td>{{ $row['comunicado'] ?? '' }}</td>
            </tr>
            @endforeach

            {{-- Relleno de filas para que la tabla siempre llegue abajo como en la foto --}}
            @php $limite = 13; @endphp {{-- Ajustado a 13 para llenar la hoja A4 --}}
            @for($i = count($rows); $i < $limite; $i++)
            <tr>
                <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
            @endfor
        </tbody>
    </table>

    <div class="footer">
        <div class="turno-area">
            TURNO: ____________________________________________________________________________________
        </div>

        <table style="width: 100%; margin-top: 40px;">
            <tr>
                <td style="width: 50%; text-align: center;">
                    <div style="width: 250px; margin: 0 auto; border-top: 1pt solid #000; padding-top: 4px;">
                        <strong>Jefe de Departamento de Transporte</strong><br>
                        <span style="font-size: 7pt;">Firma y Sello</span>
                    </div>
                </td>
                <td style="width: 50%; text-align: right; vertical-align: bottom; font-size: 7pt; color: #555;">
                    Página 1 de 1
                </td>
            </tr>
        </table>
    </div>

</body>
</html>