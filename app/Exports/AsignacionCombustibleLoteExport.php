<?php

namespace App\Exports;

use App\Models\AsignacionCombustibleLote;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AsignacionCombustibleLoteExport implements FromCollection, ShouldAutoSize, WithColumnFormatting, WithHeadings, WithMapping, WithStyles, WithTitle
{
    public function __construct(
        private readonly AsignacionCombustibleLote $lote
    ) {}

    // ─── Datos ───────────────────────────────────────────────────────────────

    public function collection()
    {
        return $this->lote
            ->detalles()
            ->with(['vehiculo', 'solicitudCombustible', 'tipoCombustible', 'asignadoPor'])
            ->get();
    }

    // ─── Encabezados ─────────────────────────────────────────────────────────

    public function headings(): array
    {
        return [
            '#',
            'Placa',
            'N° Ticket',
            'Solicitud',
            'Monto ($)',
            'N° Serie',
            'N° Contrato',
            'Tipo Combustible',
            'Monto solicitado',
            'Estado',
            'Asignado por',
            'Fecha Asignación',
            'Observaciones',
        ];
    }

    // ─── Mapeo de filas ───────────────────────────────────────────────────────

    public function map($detalle): array
    {
        static $i = 0;
        $i++;

        return [
            $i,
            $detalle->placa_cache ?? $detalle->vehiculo?->placa ?? '—',
            $detalle->numero_ticket,
            $detalle->solicitudCombustible?->codigo ?? '—',
            (float) $detalle->monto_asignado,
            $detalle->numero_serie ?? '—',
            $detalle->numero_contrato ?? '—',
            $detalle->tipoCombustible?->nombre ?? '—',
            $detalle->cantidad_galones ? (float) $detalle->cantidad_galones : '—',
            ucfirst($detalle->estado_asignacion ?? 'pendiente'),
            $detalle->asignadoPor?->name ?? '—',
            $detalle->fecha_asignacion?->format('d/m/Y H:i') ?? '—',
            $detalle->observaciones_operativas ?? '',
        ];
    }

    // ─── Formato de columnas numéricas ────────────────────────────────────────

    public function columnFormats(): array
    {
        return [
            'E' => NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED2, // Monto
            'I' => NumberFormat::FORMAT_NUMBER_00,               // Monto solicitado
        ];
    }

    // ─── Estilos ──────────────────────────────────────────────────────────────

    public function styles(Worksheet $sheet): array
    {
        $lastRow = $this->lote->detalles()->count() + 1; // +1 por encabezado

        // Fila de encabezado
        $sheet->getStyle('A1:M1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 10,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '0891B2'], // cyan-600
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Bordes en toda la tabla
        $sheet->getStyle("A1:M{$lastRow}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'D1D5DB'],
                ],
            ],
        ]);

        // Filas pares con fondo suave
        for ($row = 2; $row <= $lastRow; $row++) {
            if ($row % 2 === 0) {
                $sheet->getStyle("A{$row}:M{$row}")->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'F5FDFF'],
                    ],
                ]);
            }
        }

        // Fila de totales al final
        $totalRow = $lastRow + 2;
        $sheet->setCellValue("A{$totalRow}", 'TOTALES');
        $sheet->setCellValue("D{$totalRow}", 'Vehículos: '.$this->lote->detalles()->count());
        $sheet->setCellValue("E{$totalRow}", (float) $this->lote->total_monto);
        $sheet->setCellValue("I{$totalRow}", (float) ($this->lote->total_galones ?? 0));

        $sheet->getStyle("A{$totalRow}:M{$totalRow}")->applyFromArray([
            'font' => ['bold' => true],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'E0F2FE'],
            ],
        ]);

        // Metadatos del lote encima de la tabla (insertar 4 filas arriba)
        $sheet->insertNewRowBefore(1, 4);

        $sheet->setCellValue('A1', 'ASAMBLEA LEGISLATIVA DE EL SALVADOR — LOTE DE COMBUSTIBLE');
        $sheet->setCellValue('A2', 'Fecha del lote: '.$this->lote->fecha->format('d/m/Y'));
        $sheet->setCellValue('A3', 'Estado: '.$this->lote->estado->label());
        $sheet->setCellValue('D2', 'Creado por: '.($this->lote->creador?->name ?? '—'));
        $sheet->setCellValue('D3', 'Generado: '.now()->format('d/m/Y H:i'));

        $sheet->getStyle('A1:M1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 13, 'color' => ['rgb' => '0891B2']],
        ]);

        $sheet->mergeCells('A1:M1');
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        return [];
    }

    // ─── Nombre de la hoja ────────────────────────────────────────────────────

    public function title(): string
    {
        return 'Lote '.$this->lote->fecha->format('d-m-Y');
    }
}
