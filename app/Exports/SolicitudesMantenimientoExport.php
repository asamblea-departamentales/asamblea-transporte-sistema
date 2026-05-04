<?php

namespace App\Exports;

use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SolicitudesMantenimientoExport implements FromCollection, ShouldAutoSize, WithEvents, WithHeadings, WithMapping, WithStyles
{
    public function __construct(private Builder $query) {}

    public function collection()
    {
        return $this->query
            ->with(['vehiculo.vehMarca', 'vehiculo.vehModelo', 'tipoMantenimiento', 'solicitante', 'aprobador'])
            ->orderBy('fecha_sugerida')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Código',
            'Vehículo (Placa)',
            'Marca / Modelo',
            'Tipo Mantenimiento',
            'Tipo Solicitud',
            'Detalle',
            'Fecha Sugerida',
            'Fecha Realizada',
            'Costo Estimado',
            'Costo Real',
            'Prioridad',
            'Estado',
            'Solicitante',
            'Aprobado / Rechazado por',
            'Fecha Decisión',
            'Motivo Rechazo',
            'Observaciones',
            'Creada en',
        ];
    }

    public function map($row): array
    {
        $clean = fn ($v) => is_string($v) ? iconv('UTF-8', 'UTF-8//IGNORE', $v) : $v;

        return [
            $clean($row->codigo),
            $clean($row->vehiculo?->placa ?? ''),
            $clean(trim("{$row->vehiculo?->vehMarca?->nombre} {$row->vehiculo?->vehModelo?->nombre}")),
            $clean($row->tipoMantenimiento?->nombre ?? ''),
            ucfirst($row->tipo_solicitud ?? ''),
            $clean($row->detalle ?? ''),
            optional($row->fecha_sugerida)->format('Y-m-d'),
            optional($row->fecha_realizada)->format('Y-m-d'),
            $row->costo_estimado ? number_format($row->costo_estimado, 2) : '',
            $row->costo_real ? number_format($row->costo_real, 2) : '',
            strtoupper($row->prioridad?->value ?? ''),
            strtoupper($row->estado?->value ?? ''),
            $clean($row->solicitante?->name ?? ''),
            $clean($row->aprobador?->name ?? ''),
            optional($row->fecha_aprobacion)->format('Y-m-d H:i'),
            $clean($row->motivo_rechazo ?? ''),
            $clean($row->observaciones ?? ''),
            optional($row->created_at)->format('Y-m-d H:i'),
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '065F46'], // Verde oscuro — mantenimiento
                ],
                'alignment' => ['vertical' => 'center'],
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

                $sheet->setAutoFilter("A1:{$lastColumn}1");
                $sheet->freezePane('A2');

                $sheet->getStyle($rangeAll)->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => 'thin',
                            'color' => ['rgb' => 'D1D5DB'],
                        ],
                    ],
                ]);

                for ($r = 2; $r <= $lastRow; $r++) {
                    if ($r % 2 === 0) {
                        $sheet->getStyle("A{$r}:{$lastColumn}{$r}")->applyFromArray([
                            'fill' => [
                                'fillType' => Fill::FILL_SOLID,
                                'startColor' => ['rgb' => 'F0FDF4'],
                            ],
                        ]);
                    }
                }

                $sheet->getStyle('A:A')->getAlignment()->setHorizontal('center');
                $sheet->getStyle('G:H')->getAlignment()->setHorizontal('center');
                $sheet->getStyle('I:J')->getAlignment()->setHorizontal('right');
                $sheet->getStyle('K:L')->getAlignment()->setHorizontal('center');
                $sheet->getStyle('F:F')->getAlignment()->setWrapText(true);
                $sheet->getStyle('Q:Q')->getAlignment()->setWrapText(true);
                $sheet->getRowDimension(1)->setRowHeight(18);
            },
        ];
    }
}
