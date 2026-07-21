<?php

namespace App\Domain\Solicitudes\Services\Dashboard;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\Incidencia;
use App\Models\SolicitudCombustible;
use App\Models\SolicitudMantenimiento;
use App\Models\SolicitudTransporte;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function summary(Request $request): array
    {
        $user = $request->user();

        $qTransporte = SolicitudTransporte::query();
        $qMantenimiento = SolicitudMantenimiento::query();
        $qCombustible = SolicitudCombustible::query();

        if (! $user->hasAnyRole(['jefe', 'admin', 'ti', 'super_admin'])) {
            $qTransporte->where('solicitante_id', $user->id);
            $qMantenimiento->where('solicitante_id', $user->id);
            $qCombustible->where('solicitante_id', $user->id);
        }

        $estadosPendientes = [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION];
        $estadosAprobados = [EstadoSolicitudEnum::APROBADA, EstadoSolicitudEnum::PRE_APROBADA];

        if ($user->hasRole('jefe')) {
            $estadosPendientes = [EstadoSolicitudEnum::PRE_APROBADA];
            $estadosAprobados = [EstadoSolicitudEnum::APROBADA];
        }

        $estadosEnProceso = [EstadoSolicitudEnum::PROGRAMADA, EstadoSolicitudEnum::EN_EJECUCION];
        $estadoCompletado = EstadoSolicitudEnum::COMPLETADA;

        $tCounts = (clone $qTransporte)->selectRaw('estado, COUNT(*) as total')->groupBy('estado')->pluck('total', 'estado')->toArray();
        $mCounts = (clone $qMantenimiento)->selectRaw('estado, COUNT(*) as total')->groupBy('estado')->pluck('total', 'estado')->toArray();
        $cCounts = (clone $qCombustible)->selectRaw('estado, COUNT(*) as total')->groupBy('estado')->pluck('total', 'estado')->toArray();

        $sum = function (array $counts, array $estados) {
            $total = 0;
            foreach ($estados as $estado) {
                $total += $counts[$estado->value] ?? 0;
            }

            return $total;
        };

        $get = function (array $counts, EstadoSolicitudEnum $estado) {
            return $counts[$estado->value] ?? 0;
        };

        return [
            'pending' => $sum($tCounts, $estadosPendientes) + $sum($mCounts, $estadosPendientes) + $sum($cCounts, $estadosPendientes),
            'in_progress' => $sum($tCounts, $estadosEnProceso) + $sum($mCounts, $estadosEnProceso) + $sum($cCounts, $estadosEnProceso),
            'accepted' => $get($tCounts, EstadoSolicitudEnum::APROBADA) + $sum($mCounts, $estadosAprobados) + $sum($cCounts, $estadosAprobados),
            'completed' => $get($tCounts, $estadoCompletado) + $get($mCounts, $estadoCompletado) + $get($cCounts, $estadoCompletado),
            'by_module' => [
                'transporte' => [
                    'pending' => $sum($tCounts, $estadosPendientes),
                    'in_progress' => $sum($tCounts, $estadosEnProceso),
                    'accepted' => $get($tCounts, EstadoSolicitudEnum::APROBADA),
                    'completed' => $get($tCounts, $estadoCompletado),
                ],
                'mantenimiento' => [
                    'pending' => $sum($mCounts, $estadosPendientes),
                    'in_progress' => $sum($mCounts, $estadosEnProceso),
                    'accepted' => $sum($mCounts, $estadosAprobados),
                    'completed' => $get($mCounts, $estadoCompletado),
                ],
                'combustible' => [
                    'pending' => $sum($cCounts, $estadosPendientes),
                    'in_progress' => $sum($cCounts, $estadosEnProceso),
                    'accepted' => $sum($cCounts, $estadosAprobados),
                    'completed' => $get($cCounts, $estadoCompletado),
                ],
            ],
        ];
    }

    public function recientes(Request $request): array
    {
        $user = $request->user();

        $qTransporte = SolicitudTransporte::query();
        $qMantenimiento = SolicitudMantenimiento::query();
        $qCombustible = SolicitudCombustible::query();

        if (! $user->hasAnyRole(['jefe', 'admin', 'ti', 'super_admin'])) {
            $qTransporte->where('solicitante_id', $user->id);
            $qMantenimiento->where('solicitante_id', $user->id);
            $qCombustible->where('solicitante_id', $user->id);
        }

        $transporte = $qTransporte->latest('created_at')->take(5)->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'code' => $s->codigo,
                'ticket' => $s->ticket,
                'date' => optional($s->fecha_salida ?? $s->created_at)->format('Y-m-d H:i'),
                'type' => 'Transporte',
                'status' => $s->estado?->value ?? (string) $s->estado,
            ]);

        $mantenimiento = $qMantenimiento->latest('created_at')->take(5)->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'code' => $s->codigo,
                'ticket' => $s->ticket,
                'date' => optional($s->fecha_sugerida ?? $s->created_at)->format('Y-m-d H:i'),
                'type' => 'Mantenimiento',
                'status' => $s->estado?->value ?? (string) $s->estado,
            ]);

        $combustible = $qCombustible->latest('created_at')->take(5)->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'code' => $s->codigo,
                'ticket' => $s->ticket,
                'date' => optional($s->fecha_solicitud ?? $s->created_at)->format('Y-m-d H:i'),
                'type' => 'Combustible',
                'status' => $s->estado?->value ?? (string) $s->estado,
            ]);

        $rows = $transporte
            ->concat($mantenimiento)
            ->concat($combustible)
            ->sortByDesc('date')
            ->take(10)
            ->values();

        return ['data' => $rows];
    }

    public function historialJefatura(Request $request): LengthAwarePaginator
    {
        $perPage = (int) $request->query('per_page', 15);
        $page = Paginator::resolveCurrentPage();
        $estadosTransporte = [EstadoSolicitudEnum::APROBADA->value, EstadoSolicitudEnum::PROGRAMADA->value, EstadoSolicitudEnum::COMPLETADA->value, EstadoSolicitudEnum::RECHAZADA->value, EstadoSolicitudEnum::EN_EJECUCION->value];
        $estadosOtros = [EstadoSolicitudEnum::APROBADA->value, EstadoSolicitudEnum::COMPLETADA->value, EstadoSolicitudEnum::RECHAZADA->value, EstadoSolicitudEnum::EN_EJECUCION->value];

        $first = DB::table('solicitud_transportes')
            ->select('id', 'codigo', 'ticket', 'updated_at', DB::raw("'Transporte' as type"), 'estado')
            ->whereIn('estado', $estadosTransporte);

        $union = DB::table('solicitudes_mantenimiento')
            ->select('id', 'codigo', DB::raw('NULL as ticket'), 'updated_at', DB::raw("'Mantenimiento' as type"), 'estado')
            ->whereIn('estado', $estadosOtros)
            ->unionAll($first);

        $union = DB::table('solicitudes_combustible')
            ->select('id', 'codigo', 'numero_vale_ticket as ticket', 'updated_at', DB::raw("'Combustible' as type"), 'estado')
            ->whereIn('estado', $estadosOtros)
            ->unionAll($union);

        $total = DB::query()->fromSub($union, 'u')->count();

        $rows = $union->orderByDesc('updated_at')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id, 'code' => $s->codigo, 'ticket' => $s->ticket,
                'date' => Carbon::parse($s->updated_at)->format('Y-m-d H:i'),
                'type' => $s->type, 'status' => $s->estado,
            ]);

        return new LengthAwarePaginator(
            $rows, $total, $perPage, $page,
            ['path' => Paginator::resolveCurrentPath()]
        );
    }

    public function pendientesJefatura(Request $request): LengthAwarePaginator
    {
        $perPage = (int) $request->query('per_page', 15);
        $page = Paginator::resolveCurrentPage();

        $estadoPre = EstadoSolicitudEnum::PRE_APROBADA->value;

        $first = DB::table('solicitud_transportes')
            ->select('id', 'codigo', 'ticket', 'updated_at',
                DB::raw("'Transporte' as type"), 'estado',
                'fecha_salida as fecha_ejecucion')
            ->where('estado', $estadoPre);

        $union = DB::table('solicitudes_mantenimiento')
            ->select('id', 'codigo', DB::raw('NULL as ticket'), 'updated_at',
                DB::raw("'Mantenimiento' as type"), 'estado',
                'fecha_sugerida as fecha_ejecucion')
            ->where('estado', $estadoPre)
            ->unionAll($first);

        $union = DB::table('solicitudes_combustible')
            ->select('id', 'codigo', 'numero_vale_ticket as ticket', 'updated_at',
                DB::raw("'Combustible' as type"), 'estado',
                'fecha_solicitud as fecha_ejecucion')
            ->where('estado', $estadoPre)
            ->unionAll($union);

        $total = DB::query()->fromSub($union, 'u')->count();

        $rows = $union->orderByDesc('updated_at')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'code' => $s->codigo,
                'ticket' => $s->ticket,
                'date' => Carbon::parse($s->updated_at)->format('Y-m-d H:i'),
                'type' => $s->type,
                'status' => $s->estado,
                'fecha_ejecucion' => $s->fecha_ejecucion,
            ]);

        return new LengthAwarePaginator(
            $rows, $total, $perPage, $page,
            ['path' => Paginator::resolveCurrentPath()]
        );
    }

    public function getKpis(): array
    {
        $total = SolicitudCombustible::count() + SolicitudMantenimiento::count();

        $enEjecucion =
            SolicitudCombustible::where('estado', EstadoSolicitudEnum::EN_EJECUCION)->count() +
            SolicitudMantenimiento::where('estado', EstadoSolicitudEnum::EN_EJECUCION)->count();

        $completadas =
            SolicitudCombustible::where('estado', EstadoSolicitudEnum::COMPLETADA)->count() +
            SolicitudMantenimiento::where('estado', EstadoSolicitudEnum::COMPLETADA)->count();

        $liquidadas =
            SolicitudCombustible::where('estado', EstadoSolicitudEnum::LIQUIDADA)->count() +
            SolicitudMantenimiento::where('estado', EstadoSolicitudEnum::LIQUIDADA)->count();

        return compact('total', 'enEjecucion', 'completadas', 'liquidadas');
    }

    public function getFinanzas(): array
    {
        $combustible = SolicitudCombustible::sum('valor_total');

        $mantenimiento = SolicitudMantenimiento::sum('costo_real')
            ?: SolicitudMantenimiento::sum('costo_estimado');

        return [
            'combustible' => $combustible,
            'mantenimiento' => $mantenimiento,
            'total' => $combustible + $mantenimiento,
        ];
    }

    public function getAlertas(): array
    {
        $incidencias = class_exists(Incidencia::class)
            ? Incidencia::where('estado', 'abierta')->count()
            : 0;

        $sinComprobantes = SolicitudCombustible::whereNull('comprobantes')
            ->orWhere('comprobantes', '[]')
            ->count();

        return [
            'incidencias' => $incidencias,
            'sinComprobantes' => $sinComprobantes,
        ];
    }

    public function getActividad(): array
    {
        $comb = SolicitudCombustible::with('solicitante')->latest()->take(5)->get()
            ->map(fn ($s) => [
                'codigo' => $s->codigo,
                'modulo' => 'Combustible',
                'estado' => $s->estado?->value ?? $s->estado,
                'solicitante' => $s->solicitante?->name ?? '-',
                'fecha' => $s->created_at,
            ])->toBase();

        $mant = SolicitudMantenimiento::with('solicitante')->latest()->take(5)->get()
            ->map(fn ($s) => [
                'codigo' => $s->codigo,
                'modulo' => 'Mantenimiento',
                'estado' => $s->estado?->value ?? $s->estado,
                'solicitante' => $s->solicitante?->name ?? '-',
                'fecha' => $s->created_at,
            ])->toBase();

        $trans = SolicitudTransporte::with('solicitante')->latest()->take(5)->get()
            ->map(fn ($s) => [
                'codigo' => $s->codigo,
                'modulo' => 'Transporte',
                'estado' => $s->estado?->value ?? $s->estado,
                'solicitante' => $s->solicitante?->name ?? '-',
                'fecha' => $s->created_at,
            ])->toBase();

        return $comb->merge($mant)->merge($trans)
            ->sortByDesc('fecha')
            ->take(10)
            ->values()
            ->all();
    }
}
