<?php

namespace App\Domain\Solicitudes\Services;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\Incidencia;
use App\Models\Motorista;
use App\Models\RecepcionEntregaVehiculo;
use App\Models\SolicitudTransporte;
use App\Models\SugerenciaAsignacion;
use App\Models\Vehiculo;

class SugerenciaAsignacionService
{
    public function __construct(
        protected EstadoFlotaService $estadoFlotaService
     ) {}
    public function generar(SolicitudTransporte $solicitud): SugerenciaAsignacion
    {
        // 1. Filtrar vehículos candidatos
        $vehiculosCandidatos = Vehiculo::query()
            ->where('activo', true)
            ->disponibles()
            ->whereHas('tipo', fn ($q) => $q->where('nombre', $solicitud->tipo_vehiculo_nombre))
            ->where('capacidad_personas', '>=', $solicitud->cantidad_personas)
            ->get();
        // 2. Filtrar motoristas candidatos
        $motoristasCandidatos = Motorista::query()
            ->where('activo', true)
            ->disponibles()
            ->get()
            ->filter(fn (Motorista $m) => $this->sinConflictoHorario($m, $solicitud));
        // 3. Puntuar vehículos
        $vehiculoOptimo = $vehiculosCandidatos->sortByDesc(function ($v) {
            return $this->puntuarVehiculo($v);
        })->first();
        // 4. Puntuar motoristas (50% horas, 30% disponibilidad, 20% incidencias)
        $motoristaOptimo = $motoristasCandidatos->sortByDesc(function ($m) {
            return $this->puntuarMotorista($m);
        })->first();
        if (!$vehiculoOptimo || !$motoristaOptimo) {
            throw new \DomainException('No hay recursos disponibles para sugerir una asignación.');
        }
        $scoreConfianza = round(
            ($this->puntuarVehiculo($vehiculoOptimo) * 0.4) +
            ($this->puntuarMotorista($motoristaOptimo) * 0.6)
        );
        $horasPeriodo = $motoristaOptimo->horasEnPeriodo();
        $bullets = $this->generarBullets(
            $motoristaOptimo, $vehiculoOptimo, $solicitud, $horasPeriodo
        );
        $combustible = $this->obtenerCombustible($vehiculoOptimo);
        return SugerenciaAsignacion::updateOrCreate(
            ['solicitud_id' => $solicitud->id],
            [
                'vehiculo_sugerido_id' => $vehiculoOptimo->id,
                'motorista_sugerido_id' => $motoristaOptimo->id,
                'horas_motorista_periodo' => $horasPeriodo,
                'combustible_porcentaje' => $combustible,
                'score_confianza' => $scoreConfianza,
                'bullets_tecnicos' => $bullets,
            ]
        );
    }
    protected function puntuarVehiculo(Vehiculo $v): float
    {
        $score = 0;
        // 40% compatibilidad tipo/capacidad
        $score += 40;
        // 35% combustible
        $combustible = $this->obtenerCombustible($v) ?? 0;
        $score += ($combustible / 100) * 35;
        // 25% kilometraje (menos km = mejor)
        $ultimoKm = RecepcionEntregaVehiculo::where('vehiculo_id', $v->id)
            ->orderByDesc('fecha_hora')->value('kilometraje');
        $score += $ultimoKm ? max(0, 25 - ($ultimoKm / 10000)) : 25;
        return min(100, $score);
    }
    protected function puntuarMotorista(Motorista $m): float
    {
        $horas = $m->horasEnPeriodo();
        // 50% horas acumuladas (menos horas = mejor)
        $scoreHoras = max(0, 100 - ($horas * 10));
        // 30% disponibilidad (siempre 100 porque ya filtramos disponibles)
        // 20% incidencias (sin incidencias = 100)
        $incidencias = Incidencia::where('entidad_tipo', 'solicitud_transporte')
            ->whereIn('entidad_id', SolicitudTransporte::where('motorista_id', $m->id)
                ->where('fecha_salida', '>=', now()->subDays(30))
                ->pluck('id'))
            ->count();
        $scoreIncidencias = max(0, 100 - ($incidencias * 20));
        return ($scoreHoras * 0.5) + (30) + ($scoreIncidencias * 0.2);
    }
    protected function sinConflictoHorario(Motorista $m, SolicitudTransporte $s): bool
    {
        if (!$s->fecha_salida || !$s->fecha_retorno) return true;
        return !SolicitudTransporte::where('motorista_id', $m->id)
            ->whereIn('estado', [
                EstadoSolicitudEnum::PROGRAMADA, EstadoSolicitudEnum::ASIGNADA,
                EstadoSolicitudEnum::EN_EJECUCION, EstadoSolicitudEnum::APROBADA,
            ])
            ->where('id', '!=', $s->id)
            ->where(function ($q) use ($s) {
                $q->where('fecha_salida', '<=', $s->fecha_retorno)
                  ->where('fecha_retorno', '>=', $s->fecha_salida);
            })->exists();
    }
    protected function obtenerCombustible(Vehiculo $v): ?int
    {
        return RecepcionEntregaVehiculo::where('vehiculo_id', $v->id)
            ->orderByDesc('fecha_hora')
            ->value('nivel_combustible');
    }
    protected function generarBullets(Motorista $m, Vehiculo $v, SolicitudTransporte $s, float $horas): array
    {
        $bullets = [];
        $bullets[] = "Motorista con {$horas} horas acumuladas en los últimos 7 días";
        $combustible = $this->obtenerCombustible($v);
        if ($combustible !== null) {
            $bullets[] = "Vehículo con combustible al {$combustible}%";
        }
        $bullets[] = "Capacidad para {$v->capacidad_personas} personas";
        return $bullets;
    }
}