<?php

namespace App\Exports;

use App\Models\SolicitudCombustible;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class SolicitudesCombustibleExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles, WithEvents
{
    public function __construct(private Builder $query) {}

    public function collection()
    {
        return $this->query
            ->with(['vehiculo', 'solicitante', 'aprobador'])
            ->orderBy('fecha_solicitud')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Código',
            'Vehículo',
            'Solicitante',
            'Fecha solicitud',
            'Cantidad combustible',
            'Valor total',
            'Estado',
            'Observaciones',
            'Motivo rechazo',
            'Aprobador',
            'Fecha aprobación',
            'Creada en',
        ];
    }

    public function map($row): array
    {
        /** @var SolicitudCombustible $row */

        $estado = $row->estado?->value ?? (string) $row->estado;
        $clean = fn ($v) => is_string($v) ? iconv('UTF-8', 'UTF-8//IGNORE', $v) : $v;

        return [
            $clean($row->codigo),
            $clean($row->vehiculo?->placa ?? ''),
            $clean($row->solicitante?->name ?? ''),
            optional($row->fecha_solicitud)->format('Y-m-d H:i'),
            $row->cantidad_combustible,
            $row->valor_total,
            strtoupper($estado),
            $clean($row->observaciones ?? ''),
            $clean($row->motivo_rechazo ?? ''),
            $clean($row->aprobador?->name ?? ''),
            optional($row->fecha_aprobacion)->format('Y-m-d H:i'),
            optional($row->created_at)->format('Y-m-d H:i'),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E3A8A']],
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
                $sheet->setAutoFilter("A1:{$lastColumn}1");
                $sheet->freezePane('A2');
                $sheet->getStyle("A1:{$lastColumn}{$lastRow}")->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => 'thin',
                            'color' => ['rgb' => 'D1D5DB'],
                        ],
                    ],
                ]);
            },
        ];
    }
}