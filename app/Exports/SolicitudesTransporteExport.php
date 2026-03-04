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
use Maatwebsite\Excel\Concerns\WithAutoFilter;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SolicitudesTransporteExport implements
    FromCollection,
    WithHeadings,
    WithMapping,
    ShouldAutoSize,
    WithStyles,
    WithEvents,
    WithAutoFilter
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

        // Enums seguros (por si viene string / null)
        $prioridad = $row->prioridad?->value ?? (string) $row->prioridad;
        $estado    = $row->estado?->value ?? (string) $row->estado;

        // Limpieza ligera de texto
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

    //Header estilo “tabla”
    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                ],
                'fill' => [
                    'fillType' => 'solid',
                    'startColor' => ['rgb' => '1E3A8A'],
                ],
                'alignment' => [
                    'vertical' => 'center',
                ],
            ],
        ];
    }

    //  Autofiltro
    public function autoFilter(): string
    {
        return 'A1:O1';
    }

    //Bordes + freeze header + alineaciones y formato fecha
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {

                $sheet = $event->sheet->getDelegate();

                $lastRow = $sheet->getHighestRow();
                $lastColumn = $sheet->getHighestColumn();

                $range = "A1:{$lastColumn}{$lastRow}";

                // Bordes
                $sheet->getStyle($range)->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => 'thin',
                            'color' => ['rgb' => 'D1D5DB'],
                        ],
                    ],
                ]);

                // Congelar encabezado
                $sheet->freezePane('A2');

                // Altura del header
                $sheet->getRowDimension(1)->setRowHeight(18);

                // Alineación por columnas (ajusta a tu gusto)
                $sheet->getStyle("A:A")->getAlignment()->setHorizontal('center'); // código
                $sheet->getStyle("G:H")->getAlignment()->setHorizontal('center'); // fechas
                $sheet->getStyle("I:I")->getAlignment()->setHorizontal('center'); // personas
                $sheet->getStyle("J:K")->getAlignment()->setHorizontal('center'); // prioridad/estado
            },
        ];
    }
}