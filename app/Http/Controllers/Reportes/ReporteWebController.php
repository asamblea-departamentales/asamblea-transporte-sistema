<?php

namespace App\Http\Controllers\Reportes;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Services\AuditoriaService;
use App\Exports\SolicitudesCombustibleExport;
use App\Exports\SolicitudesMantenimientoExport;
use App\Exports\SolicitudesTransporteExport;
use App\Http\Controllers\Controller;
use App\Models\SolicitudCombustible;
use App\Models\SolicitudMantenimiento;
use App\Models\SolicitudTransporte;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ReporteWebController extends Controller
{
    public function solicitudesTransportePdf(Request $request)
    {
        abort_unless(auth()->check() && auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'operativo', 'liquidador', 'super_admin']), 403);

        $q = SolicitudTransporte::query();

        $dateField = $request->string('date_field', 'fecha_salida')->toString();

        if ($request->filled('date_from')) {
            $q->where($dateField, '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $q->where($dateField, '<=', $request->input('date_to'));
        }

        if ($request->filled('unidad_solicitante_id')) {
            $q->where('unidad_solicitante_id', $request->input('unidad_solicitante_id'));
        }
        if ($request->filled('estado')) {
            $q->where('estado', $request->input('estado'));
        }
        if ($request->filled('prioridad')) {
            $q->where('prioridad', $request->input('prioridad'));
        }

        $rows = $q->with(['unidad', 'solicitante'])
            ->orderBy('fecha_salida')
            ->get()
            ->map(function ($row) {
                foreach (['origen', 'destino', 'motivo_actividad', 'comentario_jefe'] as $field) {
                    if (! empty($row->{$field}) && is_string($row->{$field})) {
                        $row->{$field} = iconv('UTF-8', 'UTF-8//IGNORE', $row->{$field});
                    }
                }

                return $row;
            });

        $from = $request->filled('date_from') ? \Carbon\Carbon::parse($request->input('date_from'))->format('d/m/Y') : 'Inicio';
        $to = $request->filled('date_to') ? \Carbon\Carbon::parse($request->input('date_to'))->format('d/m/Y') : 'Fin';
        $rangeLabel = "Periodo: {$from} al {$to}";

        app(AuditoriaService::class)->registrar(
            AccionBitacoraEnum::EXPORTAR_PDF,
            'solicitudes_transporte',
            ['filtros' => $request->all(), 'cantidad_registros' => $rows->count()]
        );

        $pdf = Pdf::loadView('reports.solicitudes_transporte_pdf', [
            'rows' => $rows,
            'rangeLabel' => $rangeLabel,
        ])
            ->setPaper('a4', 'landscape')
            ->setWarnings(false);

        $filename = 'reporte_solicitudes_'.now()->format('Ymd_His').'.pdf';

        return response()->streamDownload(fn () => print ($pdf->output()), $filename, [
            'Content-Type' => 'application/pdf',
        ]);
    }

    public function solicitudesMantenimientoPdf(Request $request)
    {
        abort_unless(auth()->check() && auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'operativo', 'liquidador', 'super_admin']), 403);

        $q = SolicitudMantenimiento::query();
        $dateField = $request->string('date_field', 'fecha_sugerida')->toString();

        if ($request->filled('date_from')) {
            $q->where($dateField, '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $q->where($dateField, '<=', $request->input('date_to'));
        }

        if ($request->filled('veh_tipo_mantenimiento_id')) {
            $q->where('veh_tipo_mantenimiento_id', $request->input('veh_tipo_mantenimiento_id'));
        }
        if ($request->filled('estado')) {
            $q->where('estado', $request->input('estado'));
        }
        if ($request->filled('prioridad')) {
            $q->where('prioridad', $request->input('prioridad'));
        }
        if ($request->filled('tipo_solicitud')) {
            $q->where('tipo_solicitud', $request->input('tipo_solicitud'));
        }

        $rows = $q->with(['vehiculo.vehMarca', 'vehiculo.vehModelo', 'tipoMantenimiento', 'solicitante', 'aprobador'])
            ->orderBy('fecha_sugerida')
            ->get()
            ->map(function ($row) {
                foreach (['detalle', 'observaciones', 'motivo_rechazo'] as $field) {
                    if (! empty($row->{$field}) && is_string($row->{$field})) {
                        $row->{$field} = iconv('UTF-8', 'UTF-8//IGNORE', $row->{$field});
                    }
                }

                return $row;
            });

        $from = $request->filled('date_from') ? \Carbon\Carbon::parse($request->input('date_from'))->format('d/m/Y') : 'Inicio';
        $to = $request->filled('date_to') ? \Carbon\Carbon::parse($request->input('date_to'))->format('d/m/Y') : 'Fin';
        $rangeLabel = "Periodo: {$from} al {$to}";

        app(AuditoriaService::class)->registrar(
            AccionBitacoraEnum::EXPORTAR_PDF,
            'solicitudes_mantenimiento',
            ['filtros' => $request->all(), 'cantidad_registros' => $rows->count()]
        );

        $pdf = Pdf::loadView('reports.solicitudes_mantenimiento_pdf', [
            'rows' => $rows,
            'rangeLabel' => $rangeLabel,
        ])
            ->setPaper('a4', 'landscape')
            ->setWarnings(false);

        return response()->streamDownload(
            fn () => print ($pdf->output()),
            'reporte_mantenimiento_'.now()->format('Ymd_His').'.pdf',
            ['Content-Type' => 'application/pdf']
        );
    }

    public function solicitudesCombustiblePdf(Request $request)
    {
        abort_unless(auth()->check() && auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'operativo', 'liquidador', 'super_admin']), 403);

        $q = SolicitudCombustible::query();
        $dateField = $request->string('date_field', 'fecha_solicitud')->toString();

        if ($request->filled('date_from')) {
            $q->where($dateField, '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $q->where($dateField, '<=', $request->input('date_to'));
        }

        if ($request->filled('vehiculo_id')) {
            $q->where('vehiculo_id', $request->input('vehiculo_id'));
        }
        if ($request->filled('estado')) {
            $q->where('estado', $request->input('estado'));
        }
        if ($request->filled('prioridad')) {
            $q->where('prioridad', $request->input('prioridad'));
        }
        if ($request->filled('forma_pago')) {
            $q->where('forma_pago', $request->input('forma_pago'));
        }

        $rows = $q->with(['vehiculo.vehMarca', 'vehiculo.vehModelo', 'motorista', 'solicitante', 'aprobador'])
            ->orderBy('fecha_solicitud')
            ->get()
            ->map(function ($row) {
                foreach (['destino_actividad', 'observaciones', 'motivo_rechazo'] as $field) {
                    if (! empty($row->{$field}) && is_string($row->{$field})) {
                        $row->{$field} = iconv('UTF-8', 'UTF-8//IGNORE', $row->{$field});
                    }
                }

                return $row;
            });

        $from = $request->filled('date_from') ? \Carbon\Carbon::parse($request->input('date_from'))->format('d/m/Y') : 'Inicio';
        $to = $request->filled('date_to') ? \Carbon\Carbon::parse($request->input('date_to'))->format('d/m/Y') : 'Fin';
        $rangeLabel = "Periodo: {$from} al {$to}";

        app(AuditoriaService::class)->registrar(
            AccionBitacoraEnum::EXPORTAR_PDF,
            'solicitudes_combustible',
            ['filtros' => $request->all(), 'cantidad_registros' => $rows->count()]
        );

        $pdf = Pdf::loadView('reports.solicitudes_combustible_pdf', [
            'rows' => $rows,
            'rangeLabel' => $rangeLabel,
        ])
            ->setPaper('a4', 'landscape')
            ->setWarnings(false);

        return response()->streamDownload(
            fn () => print ($pdf->output()),
            'reporte_combustible_'.now()->format('Ymd_His').'.pdf',
            ['Content-Type' => 'application/pdf']
        );
    }

    public function solicitudesCombustibleExcel(Request $request)
    {
        abort_unless(auth()->check() && auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'operativo', 'liquidador', 'super_admin']), 403);

        $q = SolicitudCombustible::query();
        $dateField = $request->string('date_field', 'fecha_solicitud')->toString();

        if ($request->filled('date_from')) {
            $q->where($dateField, '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $q->where($dateField, '<=', $request->input('date_to'));
        }
        if ($request->filled('vehiculo_id')) {
            $q->where('vehiculo_id', $request->input('vehiculo_id'));
        }
        if ($request->filled('estado')) {
            $q->where('estado', $request->input('estado'));
        }
        if ($request->filled('prioridad')) {
            $q->where('prioridad', $request->input('prioridad'));
        }
        if ($request->filled('forma_pago')) {
            $q->where('forma_pago', $request->input('forma_pago'));
        }

        $filename = 'reporte_combustible_'.now()->format('Ymd_His').'.xlsx';

        app(AuditoriaService::class)->registrar(
            AccionBitacoraEnum::EXPORTAR_EXCEL,
            'solicitudes_combustible',
            ['filtros' => $request->all(), 'cantidad_registros' => $q->count()]
        );

        return Excel::download(new SolicitudesCombustibleExport($q), $filename);
    }

    public function solicitudesMantenimientoExcel(Request $request)
    {
        abort_unless(auth()->check() && auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'operativo', 'liquidador', 'super_admin']), 403);

        $q = SolicitudMantenimiento::query();

        $dateField = $request->string('date_field', 'fecha_sugerida')->toString();

        if ($request->filled('date_from')) {
            $q->where($dateField, '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $q->where($dateField, '<=', $request->input('date_to'));
        }

        if ($request->filled('vehiculo_id')) {
            $q->where('vehiculo_id', $request->input('vehiculo_id'));
        }
        if ($request->filled('estado')) {
            $q->where('estado', $request->input('estado'));
        }
        if ($request->filled('prioridad')) {
            $q->where('prioridad', $request->input('prioridad'));
        }
        if ($request->filled('tipo_solicitud')) {
            $q->where('tipo_solicitud', $request->input('tipo_solicitud'));
        }

        $filename = 'reporte_mantenimiento_'.now()->format('Ymd_His').'.xlsx';

        app(AuditoriaService::class)->registrar(
            AccionBitacoraEnum::EXPORTAR_EXCEL,
            'solicitudes_mantenimiento',
            ['filtros' => $request->all(), 'cantidad_registros' => $q->count()]
        );

        return Excel::download(new SolicitudesMantenimientoExport($q), $filename);
    }

    public function solicitudesTransporteCsv(Request $request)
    {
        abort_unless(
            auth()->check() &&
            auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'operativo', 'liquidador', 'super_admin']),
            403
        );

        $q = SolicitudTransporte::query();

        $dateField = $request->string('date_field', 'fecha_salida')->toString();

        if ($request->filled('date_from')) {
            $q->where($dateField, '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $q->where($dateField, '<=', $request->input('date_to'));
        }

        if ($request->filled('unidad_solicitante_id')) {
            $q->where('unidad_solicitante_id', $request->input('unidad_solicitante_id'));
        }

        if ($request->filled('estado')) {
            $q->where('estado', $request->input('estado'));
        }

        if ($request->filled('prioridad')) {
            $q->where('prioridad', $request->input('prioridad'));
        }

        $filename = 'reporte_transporte_'.now()->format('Ymd_His').'.csv';

        app(AuditoriaService::class)->registrar(
            AccionBitacoraEnum::EXPORTAR_CSV,
            'solicitudes_transporte',
            ['filtros' => $request->all(), 'cantidad_registros' => $q->count()]
        );

        return Excel::download(
            new SolicitudesTransporteExport($q),
            $filename,
            \Maatwebsite\Excel\Excel::CSV
        );
    }

    public function solicitudesMantenimientoCsv(Request $request)
    {
        abort_unless(
            auth()->check() &&
            auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'operativo', 'liquidador', 'super_admin']),
            403
        );

        $q = SolicitudMantenimiento::query();

        $dateField = $request->string('date_field', 'fecha_sugerida')->toString();

        if ($request->filled('date_from')) {
            $q->where($dateField, '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $q->where($dateField, '<=', $request->input('date_to'));
        }

        if ($request->filled('veh_tipo_mantenimiento_id')) {
            $q->where('veh_tipo_mantenimiento_id', $request->input('veh_tipo_mantenimiento_id'));
        }

        if ($request->filled('estado')) {
            $q->where('estado', $request->input('estado'));
        }

        if ($request->filled('prioridad')) {
            $q->where('prioridad', $request->input('prioridad'));
        }

        if ($request->filled('tipo_solicitud')) {
            $q->where('tipo_solicitud', $request->input('tipo_solicitud'));
        }

        $filename = 'reporte_mantenimiento_'.now()->format('Ymd_His').'.csv';

        app(AuditoriaService::class)->registrar(
            AccionBitacoraEnum::EXPORTAR_CSV,
            'solicitudes_mantenimiento',
            ['filtros' => $request->all(), 'cantidad_registros' => $q->count()]
        );

        return Excel::download(
            new SolicitudesMantenimientoExport($q),
            $filename,
            \Maatwebsite\Excel\Excel::CSV
        );
    }

    public function solicitudesCombustibleCsv(Request $request)
    {
        abort_unless(
            auth()->check() &&
            auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'operativo', 'liquidador', 'super_admin']),
            403
        );

        $q = SolicitudCombustible::query();

        $dateField = $request->string('date_field', 'fecha_solicitud')->toString();

        if ($request->filled('date_from')) {
            $q->where($dateField, '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $q->where($dateField, '<=', $request->input('date_to'));
        }

        if ($request->filled('vehiculo_id')) {
            $q->where('vehiculo_id', $request->input('vehiculo_id'));
        }

        if ($request->filled('estado')) {
            $q->where('estado', $request->input('estado'));
        }

        $filename = 'reporte_combustible_'.now()->format('Ymd_His').'.csv';

        app(AuditoriaService::class)->registrar(
            AccionBitacoraEnum::EXPORTAR_CSV,
            'solicitudes_combustible',
            ['filtros' => $request->all(), 'cantidad_registros' => $q->count()]
        );

        return Excel::download(
            new SolicitudesCombustibleExport($q),
            $filename,
            \Maatwebsite\Excel\Excel::CSV
        );
    }
}
