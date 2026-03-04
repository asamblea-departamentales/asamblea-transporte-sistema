<?php

namespace App\Exports;

use App\Models\SolicitudTransporte;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

// Formato Excel
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class SolicitudesTransporteExport implements
    FromCollection,
    WithHeadings,
    WithMapping,
    ShouldAutoSize,
    WithStyles,
    WithEvents
{
    public function __construct(private Builder $query) {}

    public function collection()
    {
        return $this->query
            ->with(['unidad', 'solicitante', 'autorizador'])
            ->orderBy('fecha_salida')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Código',
            'Unidad',
            'Solicitante',
            'Motivo',
            'Origen',
            'Destino',
            'Fecha salida',
            'Fecha retorno',
            'Personas',
            'Prioridad',
            'Estado',
            'Decidido por',
            'Decidido en',
            'Comentario jefe',
            'Creada en',
        ];
    }

    public function map($row): array
    {
        /** @var SolicitudTransporte $row */

        $prioridad = $row->prioridad?->value ?? (string) $row->prioridad;
        $estado    = $row->estado?->value ?? (string) $row->estado;

        $clean = fn ($v) => is_string($v) ? iconv('UTF-8', 'UTF-8//IGNORE', $v) : $v;

        return [
            $clean($row->codigo),
            $clean($row->unidad?->nombre ?? ''),
            $clean($row->solicitante?->name ?? ''),
            $clean($row->motivo_actividad ?? ''),
            $clean($row->origen ?? ''),
            $clean($row->destino ?? ''),
            optional($row->fecha_salida)->format('Y-m-d H:i'),
            optional($row->fecha_retorno)->format('Y-m-d H:i'),
            $row->cantidad_personas,
            strtoupper($prioridad),
            strtoupper($estado),
            $clean($row->autorizador?->name ?? ''),
            optional($row->decidido_en)->format('Y-m-d H:i'),
            $clean($row->comentario_jefe ?? ''),
            optional($row->created_at)->format('Y-m-d H:i'),
        ];
    }

    // Header “bonito”
    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '1E3A8A'],
                ],
                'alignment' => [
                    'vertical' => 'center',
                ],
            ],
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                $lastRow = $sheet->getHighestRow();
                $lastColumn = $sheet->getHighestColumn();

                $rangeAll = "A1:{$lastColumn}{$lastRow}";

                //  AutoFilter en encabezado (sin WithAutoFilter)
                $sheet->setAutoFilter("A1:{$lastColumn}1");

                //  Congelar encabezado
                $sheet->freezePane('A2');

                //  Bordes tipo tabla
                $sheet->getStyle($rangeAll)->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => 'thin',
                            'color' => ['rgb' => 'D1D5DB'],
                        ],
                    ],
                ]);

                //  Zebra rows (filas alternadas) desde la fila 2
                if ($lastRow >= 2) {
                    $sheet->getStyle("A2:{$lastColumn}{$lastRow}")->applyFromArray([
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['rgb' => 'FFFFFF'], // base
                        ],
                    ]);

                    for ($r = 2; $r <= $lastRow; $r++) {
                        if ($r % 2 === 0) {
                            $sheet->getStyle("A{$r}:{$lastColumn}{$r}")->applyFromArray([
                                'fill' => [
                                    'fillType' => Fill::FILL_SOLID,
                                    'startColor' => ['rgb' => 'F8FAFC'], // gris suave
                                ],
                            ]);
                        }
                    }
                }

                //  Ajustes de alineación por columnas (opcional)
                $sheet->getStyle("A:A")->getAlignment()->setHorizontal('center'); // Código
                $sheet->getStyle("G:H")->getAlignment()->setHorizontal('center'); // Fechas
                $sheet->getStyle("I:I")->getAlignment()->setHorizontal('center'); // Personas
                $sheet->getStyle("J:K")->getAlignment()->setHorizontal('center'); // Prioridad/Estado

                //  Wrap para columnas de texto largas
                $sheet->getStyle("D:F")->getAlignment()->setWrapText(true); // motivo/origen/destino
                $sheet->getStyle("N:N")->getAlignment()->setWrapText(true); // comentario jefe

                // Altura header
                $sheet->getRowDimension(1)->setRowHeight(18);
            },
        ];
    }
}