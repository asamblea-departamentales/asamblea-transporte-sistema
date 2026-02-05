<?php

namespace App\Exports;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\SolicitudTransporte;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SolicitudesTransporteExport implements FromCollection, WithHeadings, WithMapping
{
    //Constructor recibe el query builder de solicitudes filtradas
    public function __construct(private Builder $query) {}

    //Obtiene la coleccion de datos, carga de un solo las relaciones necesarias
    public function collection()
    {
        return $this->query
            ->with(['unidad', 'solicitante', 'autorizador'])
            ->orderBy('fecha_salida')
            ->get();
    }
    
    //Define el mapeo de cada fila (los titulos de las columnas)
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

    //Aqui transformamos cada fila de la DB antes de exportarla
    public function map($row): array
    {
        /** @var SolicitudTransporte $row */

        // Convertir el estado a su valor de cadena
        $estado = $row->estado instanceof EstadoSolicitudEnum ? $row->estado->value : (string) $row->estado;

        return [
            $row->codigo,
            $row->unidad?->nombre,
            $row->solicitante?->name, //El simbolo ?-> maneja el caso nulo
            $row->motivo_actividad,
            $row->origen,
            $row->destino,

            //optional y format aseguran que las fechas salgan limpias en el Excel
            optional($row->fecha_salida)->format('Y-m-d H:i'),
            optional($row->fecha_retorno)->format('Y-m-d H:i'),
            $row->cantidad_personas,
            $row->prioridad,
            $estado,
            $row->autorizador?->name,
            optional($row->decidido_en)->format('Y-m-d H:i'),
            $row->comentario_jefe,
            optional($row->created_at)->format('Y-m-d H:i'),
        ];
    }
}