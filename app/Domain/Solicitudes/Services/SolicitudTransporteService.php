<?php

namespace App\Domain\Solicitudes\Services;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Models\BitacoraEvento;
use App\Models\DecisionOperativa;
use App\Models\Motorista;
use App\Models\SolicitudDestinoAdicional;
use App\Models\SolicitudTransporte;
use App\Models\SugerenciaAsignacion;
use App\Models\User;
use App\Models\Vehiculo;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SolicitudTransporteService
{
    public function __construct(
        private SolicitudWorkflowService $workflow,
    ) {}

    public function crear(array $data, User $user): SolicitudTransporte
    {
        $tipoVehiculoNombre = $data['tipo_vehiculo'];
        $destinoReal = $data['destino_principal'];
        $destinoAdicional = $data['destino_adicional'] ?? null;
        $destinosAdicionales = $data['destinos_adicionales'] ?? [];

        unset($data['tipo_vehiculo'], $data['destino_principal'], $data['destino_adicional'], $data['destinos_adicionales']);

        return DB::transaction(function () use ($data, $tipoVehiculoNombre, $destinoReal, $destinoAdicional, $destinosAdicionales, $user) {
            if (! empty($data['hora_salida']) && ! empty($data['fecha_salida'])) {
                $fecha = $data['fecha_salida'] instanceof Carbon ? $data['fecha_salida'] : Carbon::parse($data['fecha_salida']);
                $data['fecha_salida'] = Carbon::parse($fecha->format('Y-m-d').' '.$data['hora_salida']);
            }
            unset($data['hora_salida']);

            if (! empty($data['hora_retorno']) && ! empty($data['fecha_retorno'])) {
                $fecha = $data['fecha_retorno'] instanceof Carbon ? $data['fecha_retorno'] : Carbon::parse($data['fecha_retorno']);
                $data['fecha_retorno'] = Carbon::parse($fecha->format('Y-m-d').' '.$data['hora_retorno']);
            }
            unset($data['hora_retorno']);

            if (! empty($data['fecha_salida']) && ! empty($data['fecha_retorno'])) {
                $data['horas_estimadas'] = round(
                    Carbon::parse($data['fecha_salida'])->diffInMinutes(Carbon::parse($data['fecha_retorno']), true) / 60,
                    2
                );
            }

            $solicitud = SolicitudTransporte::create([
                ...$data,
                'destino' => $destinoReal,
                'destino_adicional' => $destinoAdicional,
                'tipo_vehiculo_nombre' => $tipoVehiculoNombre,
                'solicitante_id' => $user->id,
                'prioridad_grupo' => $user->grupo?->nivel_prioridad ?? 'baja',
                'estado' => EstadoSolicitudEnum::BORRADOR,
            ]);

            $orden = 0;

            if (! empty($destinosAdicionales) && is_array($destinosAdicionales)) {
                foreach ($destinosAdicionales as $d) {
                    SolicitudDestinoAdicional::create([
                        'solicitud_transporte_id' => $solicitud->id,
                        'nombre' => $d['nombre'] ?? 'Destino adicional',
                        'lat' => $d['lat'] ?? null,
                        'lng' => $d['lng'] ?? null,
                        'agregado_por' => null,
                        'agregado_durante_viaje' => false,
                        'orden' => $orden++,
                    ]);
                }
            } elseif ($destinoAdicional) {
                $nombres = array_map('trim', preg_split('/\s*(?:\|| - )\s*/', $destinoAdicional));
                $nombres = array_filter($nombres, fn ($n) => $n !== '');
                foreach ($nombres as $nombre) {
                    SolicitudDestinoAdicional::create([
                        'solicitud_transporte_id' => $solicitud->id,
                        'nombre' => $nombre,
                        'agregado_por' => null,
                        'agregado_durante_viaje' => false,
                        'orden' => $orden++,
                    ]);
                }
            }

            return $this->enviarSolicitud($solicitud, $user->id);
        });
    }

    public function enviarSolicitud(SolicitudTransporte $solicitud, int $userId): SolicitudTransporte
    {
        $this->workflow->enviar($solicitud, User::findOrFail($userId));
        $this->registrarEvento($solicitud, AccionBitacoraEnum::ENVIAR->value, $userId, null);

        return $solicitud;
    }

    public function observar(SolicitudTransporte $solicitud, int $jefeId, ?string $comentario): SolicitudTransporte
    {
        $solicitud->comentario_jefe = $comentario;

        $this->workflow->observar($solicitud, User::findOrFail($jefeId), $comentario);
        $this->registrarEvento($solicitud, AccionBitacoraEnum::OBSERVAR->value, $jefeId, ['comentario' => $comentario]);

        return $solicitud;
    }

    public function aprobar(SolicitudTransporte $solicitud, int $jefeId): SolicitudTransporte
    {
        if ($solicitud->solicitante_id === $jefeId) {
            throw new \DomainException('No puedes aprobar tu propia solicitud.');
        }

        $solicitud->decidido_por = $jefeId;
        $solicitud->decidido_en = now();

        $this->workflow->transicionar($solicitud, EstadoSolicitudEnum::APROBADA, User::findOrFail($jefeId), null, ['accion' => 'aprobar']);
        $this->registrarEvento($solicitud, AccionBitacoraEnum::APROBAR->value, $jefeId);

        return $solicitud;
    }

    public function rechazar(SolicitudTransporte $solicitud, int $jefeId, string $comentario): SolicitudTransporte
    {
        $solicitud->comentario_jefe = $comentario;
        $solicitud->decidido_por = $jefeId;
        $solicitud->decidido_en = now();

        $this->workflow->rechazar($solicitud, User::findOrFail($jefeId), $comentario);
        $this->registrarEvento($solicitud, AccionBitacoraEnum::RECHAZAR->value, $jefeId, ['comentario' => $comentario]);

        return $solicitud;
    }

    public function preAprobar(SolicitudTransporte $solicitud, int $jefeId): SolicitudTransporte
    {
        $this->workflow->transicionar($solicitud, EstadoSolicitudEnum::PRE_APROBADA, User::findOrFail($jefeId), 'Solicitud pre-aprobada.', ['accion' => 'pre_aprobar']);
        $this->registrarEvento($solicitud, AccionBitacoraEnum::PRE_APROBAR->value, $jefeId, null);

        return $solicitud;
    }

    public function generarSugerencia(SolicitudTransporte $solicitud): SugerenciaAsignacion
    {
        return app(SugerenciaAsignacionService::class)->generar($solicitud);
    }

    public function asignarRecursos(
        SolicitudTransporte $solicitud,
        int $userId,
        int $vehiculoId,
        int $motoristaId,
        ?string $justificacion = null
    ): array {
        if (! in_array($solicitud->estado, [EstadoSolicitudEnum::EN_REVISION, EstadoSolicitudEnum::PRE_APROBADA], true)) {
            throw new \DomainException('Solo se pueden asignar recursos a solicitudes en revisión o pre-aprobadas.');
        }

        return DB::transaction(function () use ($solicitud, $userId, $vehiculoId, $motoristaId, $justificacion) {
            $v = Vehiculo::lockForUpdate()->find($vehiculoId);
            if ($v && ! $v->esta_disponible) {
                throw new \DomainException("El vehículo {$v->placa} seleccionado ya no está disponible.");
            }
            $m = Motorista::lockForUpdate()->find($motoristaId);
            if ($m && ! $m->esta_disponible) {
                throw new \DomainException("El motorista {$m->nombre} seleccionado ya no está disponible.");
            }

            $sugerencia = $solicitud->sugerencia;
            if (! $sugerencia) {
                $sugerencia = $this->generarSugerencia($solicitud);
            }

            $cambio = $this->detectarCambio($sugerencia, $vehiculoId, $motoristaId);

            DecisionOperativa::updateOrCreate(
                ['decidable_id' => $solicitud->id, 'decidable_type' => SolicitudTransporte::class],
                [
                    'usuario_operativo_id' => $userId,
                    'vehiculo_final_id' => $vehiculoId,
                    'motorista_final_id' => $motoristaId,
                    'cambio_detectado' => $cambio,
                    'justificacion' => $cambio !== 'ninguno' ? $justificacion : null,
                ]
            );

            if ($solicitud->decision_final !== null) {
                if ($solicitud->vehiculo_id) {
                    $v = Vehiculo::find($solicitud->vehiculo_id);
                    if ($v) {
                        app(EstadoFlotaService::class)->liberarVehiculo($v);
                    }
                }
                if ($solicitud->motorista_id) {
                    $m = Motorista::find($solicitud->motorista_id);
                    if ($m) {
                        app(EstadoFlotaService::class)->liberarMotorista($m, $solicitud->codigo);
                    }
                }
                $solicitud->decision_final = null;
                $solicitud->vehiculo_id = null;
                $solicitud->motorista_id = null;
                $solicitud->decidido_por = null;
                $solicitud->decidido_en = null;
                $solicitud->comentario_jefe = null;
            }

            if ($solicitud->estado !== EstadoSolicitudEnum::PRE_APROBADA) {
                $this->workflow->transicionar($solicitud, EstadoSolicitudEnum::PRE_APROBADA, User::findOrFail($userId), $justificacion, ['accion' => 'asignar_recursos']);
            } else {
                $solicitud->save();
            }

            $this->registrarEvento($solicitud, AccionBitacoraEnum::ASIGNAR_RECURSOS->value, $userId, [
                'vehiculo_id' => $vehiculoId,
                'motorista_id' => $motoristaId,
                'cambio_detectado' => $cambio,
            ]);

            return [
                'cambio_detectado' => $cambio,
                'estado_nuevo' => EstadoSolicitudEnum::PRE_APROBADA->value,
            ];
        });
    }

    public function aprobarConDecision(
        SolicitudTransporte $solicitud,
        int $jefeId,
        string $decisionFinal,
        string $comentario,
        ?string $firma = null,
        ?int $vehiculoId = null,
        ?int $motoristaId = null
    ): array {
        if ($solicitud->solicitante_id === $jefeId) {
            throw new \DomainException('No puedes aprobar tu propia solicitud.');
        }

        if ($solicitud->estado !== EstadoSolicitudEnum::PRE_APROBADA) {
            throw new \DomainException('Solo se puede aprobar una solicitud en pre-aprobada.');
        }

        return DB::transaction(function () use ($solicitud, $jefeId, $decisionFinal, $comentario, $firma, $vehiculoId, $motoristaId) {
            $solicitud = SolicitudTransporte::lockForUpdate()->findOrFail($solicitud->id);

            if ($solicitud->estado !== EstadoSolicitudEnum::PRE_APROBADA) {
                throw new \DomainException('Solo se puede aprobar una solicitud en pre-aprobada.');
            }

            $vehiculoAnteriorId = $solicitud->vehiculo_id;
            $motoristaAnteriorId = $solicitud->motorista_id;

            if ($decisionFinal === 'manual') {
                if (! $vehiculoId || ! $motoristaId) {
                    throw new \DomainException('Para decisión manual debe proporcionar vehículo y motorista.');
                }
                $v = Vehiculo::lockForUpdate()->find($vehiculoId);
                $m = Motorista::lockForUpdate()->find($motoristaId);
                if ($v && ! $v->esta_disponible) {
                    throw new \DomainException("El vehículo {$v->placa} seleccionado ya no está disponible.");
                }
                if ($m && ! $m->esta_disponible) {
                    throw new \DomainException("El motorista {$m->nombre} seleccionado ya no está disponible.");
                }
                $solicitud->vehiculo_id = $vehiculoId;
                $solicitud->motorista_id = $motoristaId;
            } elseif ($decisionFinal === 'operativo') {
                $decision = $solicitud->decisionOperativa;
                if (! $decision) {
                    throw new \DomainException('No hay decisión operativa registrada.');
                }
                $vOp = Vehiculo::lockForUpdate()->find($decision->vehiculo_final_id);
                if ($vOp && ! $vOp->esta_disponible) {
                    throw new \DomainException(
                        "El vehículo {$vOp->placa} asignado por el operativo ya no está disponible. Solicite una re-asignación."
                    );
                }
                $mOp = Motorista::lockForUpdate()->find($decision->motorista_final_id);
                if ($mOp && ! $mOp->esta_disponible) {
                    throw new \DomainException(
                        "El motorista {$mOp->nombre} asignado por el operativo ya no está disponible. Solicite una re-asignación."
                    );
                }
                $solicitud->vehiculo_id = $decision->vehiculo_final_id;
                $solicitud->motorista_id = $decision->motorista_final_id;
            } else {
                $sugerencia = $solicitud->sugerencia;
                if (! $sugerencia) {
                    throw new \DomainException('No hay sugerencia del sistema.');
                }
                $solicitud->vehiculo_id = $sugerencia->vehiculo_sugerido_id;
                $solicitud->motorista_id = $sugerencia->motorista_sugerido_id;
            }

            if ($decisionFinal === 'sistema') {
                $vehiculoSugerido = Vehiculo::lockForUpdate()->find($solicitud->vehiculo_id);
                $motoristaSugerido = Motorista::lockForUpdate()->find($solicitud->motorista_id);

                if ($vehiculoSugerido && ! $vehiculoSugerido->esta_disponible) {
                    throw new \DomainException(
                        "El vehículo {$vehiculoSugerido->placa} sugerido por el sistema ya no está disponible. "
                        .'Solicite al operativo una re-asignación.'
                    );
                }
                if ($motoristaSugerido && ! $motoristaSugerido->esta_disponible) {
                    throw new \DomainException(
                        "El motorista {$motoristaSugerido->nombre} sugerido por el sistema ya no está disponible. "
                        .'Solicite al operativo una re-asignación.'
                    );
                }
            }

            if ($vehiculoAnteriorId) {
                $v = Vehiculo::find($vehiculoAnteriorId);
                if ($v) {
                    app(EstadoFlotaService::class)->liberarVehiculo($v);
                }
            }
            if ($motoristaAnteriorId) {
                $m = Motorista::find($motoristaAnteriorId);
                if ($m) {
                    app(EstadoFlotaService::class)->liberarMotorista($m, $solicitud->codigo);
                }
            }

            if ($solicitud->fecha_salida && $solicitud->fecha_retorno) {
                $solicitud->horas_estimadas = round(
                    $solicitud->fecha_retorno->diffInMinutes($solicitud->fecha_salida) / 60, 2
                );
            }

            $solicitud->decision_final = $decisionFinal;
            $solicitud->decidido_por = $jefeId;
            $solicitud->decidido_en = now();
            $solicitud->comentario_jefe = $comentario;
            if ($firma) {
                $solicitud->firma_aprobador = $firma;
            }

            $this->workflow->transicionar($solicitud, EstadoSolicitudEnum::APROBADA, User::findOrFail($jefeId), $comentario, ['accion' => 'aprobar_con_decision']);

            $vNuevo = Vehiculo::find($solicitud->vehiculo_id);
            $mNuevo = Motorista::find($solicitud->motorista_id);
            if ($vNuevo) {
                app(EstadoFlotaService::class)->reservarVehiculo($vNuevo, $solicitud->codigo);
            }
            if ($mNuevo) {
                app(EstadoFlotaService::class)->ocuparMotorista($mNuevo, $solicitud->codigo);
            }

            $decisionLabels = [
                'operativo' => 'asignación previa del operativo',
                'sistema' => 'sugerencia del sistema',
                'manual' => 'asignación manual del jefe',
            ];
            $label = $decisionLabels[$decisionFinal] ?? $decisionFinal;
            $vPlaca = $vNuevo?->placa ?? 'N/A';
            $mNombre = $mNuevo?->nombre ?? 'N/A';
            $comentarioEnriquecido = "Aprobado vía {$label}. Vehículo: {$vPlaca}, Motorista: {$mNombre}";
            if ($comentario) {
                $comentarioEnriquecido .= ". Observación: {$comentario}";
            }

            $this->registrarEvento($solicitud, AccionBitacoraEnum::APROBAR->value, $jefeId, [
                'decision_final' => $decisionFinal,
            ]);

            return [
                'success' => true,
                'estado_final' => EstadoSolicitudEnum::APROBADA->value,
                'recursos_consolidados' => [
                    'vehiculo_id' => $solicitud->vehiculo_id,
                    'motorista_id' => $solicitud->motorista_id,
                ],
            ];
        });
    }

    public function desbloquear(SolicitudTransporte $solicitud, int $userId): array
    {
        if (! in_array($solicitud->estado, [
            EstadoSolicitudEnum::APROBADA,
            EstadoSolicitudEnum::PRE_APROBADA,
            EstadoSolicitudEnum::RECHAZADA,
        ], true)) {
            throw new \DomainException('Solo se puede desbloquear una solicitud aprobada, pre-aprobada o rechazada.');
        }

        return DB::transaction(function () use ($solicitud, $userId) {
            $solicitud->decision_final = null;
            $solicitud->vehiculo_id = null;
            $solicitud->motorista_id = null;
            $solicitud->decidido_por = null;
            $solicitud->decidido_en = null;

            $this->workflow->transicionar($solicitud, EstadoSolicitudEnum::PENDIENTE, User::findOrFail($userId), 'Solicitud desbloqueada para re-asignación.', ['accion' => 'desbloquear']);

            app(EstadoFlotaService::class)->aplicarPorEstado($solicitud);

            $this->registrarEvento($solicitud, AccionBitacoraEnum::DESBLOQUEAR->value, $userId);

            return [
                'message' => "Solicitud {$solicitud->codigo} desbloqueada para re-asignación.",
                'estado_nuevo' => EstadoSolicitudEnum::PENDIENTE->value,
            ];
        });
    }

    public function reasignar(
        SolicitudTransporte $solicitud,
        int $jefeId,
        int $vehiculoId,
        int $motoristaId,
        string $motivoReasignacion
    ): SolicitudTransporte {
        if (! in_array($solicitud->estado, [
            EstadoSolicitudEnum::APROBADA,
            EstadoSolicitudEnum::PROGRAMADA,
        ], true)) {
            throw new \DomainException('Solo se puede reasignar solicitudes aprobadas o programadas.');
        }

        return DB::transaction(function () use ($solicitud, $jefeId, $vehiculoId, $motoristaId, $motivoReasignacion) {
            $v = Vehiculo::find($vehiculoId);
            $m = Motorista::find($motoristaId);
            if ($v && ! $v->esta_disponible) {
                throw new \DomainException("El vehículo {$v->placa} seleccionado no está disponible.");
            }
            if ($m && ! $m->esta_disponible) {
                throw new \DomainException("El motorista {$m->nombre} seleccionado no está disponible.");
            }

            $vehiculoAnteriorId = $solicitud->vehiculo_id;
            $motoristaAnteriorId = $solicitud->motorista_id;

            $solicitud->vehiculo_id = $vehiculoId;
            $solicitud->motorista_id = $motoristaId;
            $solicitud->save();

            if ($vehiculoAnteriorId) {
                $vAnterior = Vehiculo::find($vehiculoAnteriorId);
                if ($vAnterior) {
                    app(EstadoFlotaService::class)->liberarVehiculo($vAnterior);
                }
            }
            if ($motoristaAnteriorId) {
                $mAnterior = Motorista::find($motoristaAnteriorId);
                if ($mAnterior) {
                    app(EstadoFlotaService::class)->liberarMotorista($mAnterior, $solicitud->codigo);
                }
            }

            if ($v) {
                app(EstadoFlotaService::class)->reservarVehiculo($v, $solicitud->codigo);
            }
            if ($m) {
                app(EstadoFlotaService::class)->ocuparMotorista($m, $solicitud->codigo);
            }

            $this->registrarEvento($solicitud, AccionBitacoraEnum::REASIGNAR->value, $jefeId, [
                'vehiculo_anterior_id' => $vehiculoAnteriorId,
                'vehiculo_nuevo_id' => $vehiculoId,
                'motorista_anterior_id' => $motoristaAnteriorId,
                'motorista_nuevo_id' => $motoristaId,
                'motivo' => $motivoReasignacion,
            ]);

            return $solicitud;
        });
    }

    protected function detectarCambio(SugerenciaAsignacion $sugerencia, int $vehiculoId, int $motoristaId): string
    {
        $cambioV = $sugerencia->vehiculo_sugerido_id !== $vehiculoId;
        $cambioM = $sugerencia->motorista_sugerido_id !== $motoristaId;

        if ($cambioV && $cambioM) {
            return 'ambos';
        }
        if ($cambioV) {
            return 'vehiculo';
        }
        if ($cambioM) {
            return 'chofer';
        }

        return 'ninguno';
    }

    public function finalizar(SolicitudTransporte $solicitud, int $userId): SolicitudTransporte
    {
        if (! in_array($solicitud->estado, [
            EstadoSolicitudEnum::PROGRAMADA,
            EstadoSolicitudEnum::APROBADA,
            EstadoSolicitudEnum::ASIGNADA,
            EstadoSolicitudEnum::EN_EJECUCION,
        ], true)) {
            throw new \DomainException('Solo se pueden finalizar solicitudes en estado PROGRAMADA, APROBADA, ASIGNADA o EN_EJECUCION.');
        }

        return DB::transaction(function () use ($solicitud, $userId) {
            $solicitud = SolicitudTransporte::lockForUpdate()->findOrFail($solicitud->id);

            if ($solicitud->fecha_salida_real && $solicitud->fecha_retorno_real) {
                if ($solicitud->fecha_llegada_destino && $solicitud->fecha_inicio_retorno) {
                    $horasIda = $solicitud->fecha_salida_real
                        ->diffInMinutes($solicitud->fecha_llegada_destino, true) / 60;
                    $horasRet = $solicitud->fecha_inicio_retorno
                        ->diffInMinutes($solicitud->fecha_retorno_real, true) / 60;
                    $horasEsp = $solicitud->fecha_llegada_destino
                        ->diffInMinutes($solicitud->fecha_inicio_retorno, true) / 60;
                    $solicitud->horas_reales = round($horasIda + $horasRet, 2);
                    $solicitud->horas_espera = round($horasEsp, 2);
                } else {
                    $solicitud->horas_reales = round(
                        $solicitud->fecha_salida_real
                            ->diffInMinutes($solicitud->fecha_retorno_real, true) / 60, 2
                    );
                    $solicitud->horas_espera = 0;
                }
            }

            $solicitud->confirmado_por = $userId;
            $solicitud->confirmado_en = now();

            $this->workflow->transicionar($solicitud, EstadoSolicitudEnum::COMPLETADA, User::findOrFail($userId), 'Finalizada por el solicitante.', ['accion' => 'completar']);

            $this->registrarEvento($solicitud, AccionBitacoraEnum::COMPLETAR->value, $userId);

            app(EstadoFlotaService::class)->aplicarPorEstado($solicitud);

            return $solicitud;
        });
    }

    public function cancelar(SolicitudTransporte $solicitud, int $userId, ?string $motivoCancelacion = null): SolicitudTransporte
    {
        if (! in_array($solicitud->estado, [
            EstadoSolicitudEnum::BORRADOR,
            EstadoSolicitudEnum::PENDIENTE,
        ], true)) {
            throw new \DomainException('Solo se puede cancelar una solicitud en estado Borrador o Pendiente.');
        }

        if ($solicitud->solicitante_id !== $userId) {
            throw new \DomainException('Solo el solicitante puede cancelar esta solicitud.');
        }

        $solicitud->motivo_cancelacion = $motivoCancelacion;

        $this->workflow->cancelar($solicitud, User::findOrFail($userId), $motivoCancelacion);
        $this->registrarEvento($solicitud, AccionBitacoraEnum::CANCELAR->value, $userId, [
            'motivo_cancelacion' => $motivoCancelacion,
        ]);

        return $solicitud;
    }

    public function programar(SolicitudTransporte $solicitud, int $userId): array
    {
        if ($solicitud->estado !== EstadoSolicitudEnum::PRE_APROBADA) {
            throw new \DomainException('Solo se pueden programar solicitudes en pre-aprobada.');
        }
        if (! $solicitud->decision_final) {
            throw new \DomainException('La solicitud debe tener una decisión aprobada antes de programar.');
        }
        if (! $solicitud->vehiculo_id || ! $solicitud->motorista_id) {
            throw new \DomainException('La solicitud debe tener vehículo y motorista consolidados.');
        }

        $vehiculo = Vehiculo::find($solicitud->vehiculo_id);
        $motorista = Motorista::find($solicitud->motorista_id);
        if ($vehiculo && ! $vehiculo->esta_disponible) {
            throw new \DomainException(
                "El vehículo {$vehiculo->placa} consolidado ya no está disponible. "
                .'Solicite al operativo una re-asignación antes de programar.'
            );
        }
        if ($motorista && ! $motorista->esta_disponible) {
            throw new \DomainException(
                "El motorista {$motorista->nombre} consolidado ya no está disponible. "
                .'Solicite al operativo una re-asignación antes de programar.'
            );
        }

        return DB::transaction(function () use ($solicitud, $userId) {
            $this->workflow->transicionar($solicitud, EstadoSolicitudEnum::PROGRAMADA, User::findOrFail($userId), 'Solicitud programada.', ['accion' => 'programar']);

            app(EstadoFlotaService::class)->aplicarPorEstado($solicitud);

            $this->registrarEvento($solicitud, AccionBitacoraEnum::PROGRAMAR->value, $userId, [
                'accion' => 'programar',
            ]);

            return [
                'message' => "Solicitud {$solicitud->codigo} programada exitosamente.",
                'estado_nuevo' => EstadoSolicitudEnum::PROGRAMADA->value,
            ];
        });
    }

    public function recursosDisponibles(string $fechaSalida, string $fechaRetorno): array
    {
        $fechaSalida = Carbon::parse($fechaSalida);
        $fechaRetorno = Carbon::parse($fechaRetorno);

        $vehiculosOcupados = SolicitudTransporte::query()
            ->whereNotNull('vehiculo_id')
            ->whereIn('estado', [
                EstadoSolicitudEnum::EN_EJECUCION,
                EstadoSolicitudEnum::PROGRAMADA,
                EstadoSolicitudEnum::APROBADA,
                EstadoSolicitudEnum::ASIGNADA,
            ])
            ->where(function ($query) use ($fechaSalida, $fechaRetorno) {
                $query->where('fecha_salida', '<=', $fechaRetorno)
                    ->where('fecha_retorno', '>=', $fechaSalida);
            })
            ->pluck('vehiculo_id')
            ->filter()
            ->unique();

        $motoristasOcupados = SolicitudTransporte::query()
            ->whereNotNull('motorista_id')
            ->whereIn('estado', [
                EstadoSolicitudEnum::EN_EJECUCION,
                EstadoSolicitudEnum::PROGRAMADA,
                EstadoSolicitudEnum::APROBADA,
                EstadoSolicitudEnum::ASIGNADA,
            ])
            ->where(function ($query) use ($fechaSalida, $fechaRetorno) {
                $query->where('fecha_salida', '<=', $fechaRetorno)
                    ->where('fecha_retorno', '>=', $fechaSalida);
            })
            ->pluck('motorista_id')
            ->filter()
            ->unique();

        $vehiculos = Vehiculo::query()
            ->where('activo', true)
            ->whereNotIn('id', $vehiculosOcupados)
            ->with('vehMarca', 'ultimaRecepcionEntrega')
            ->get()
            ->map(fn ($vehiculo) => [
                'id' => $vehiculo->id,
                'placa' => $vehiculo->placa,
                'marca' => $vehiculo->vehMarca?->nombre,
                'capacidad' => $vehiculo->capacidad_personas,
                'nivel_combustible' => $vehiculo->ultimaRecepcionEntrega ? [
                    'valor' => $vehiculo->ultimaRecepcionEntrega->nivel_combustible,
                    'label' => $vehiculo->ultimaRecepcionEntrega->nivel_combustible_label,
                ] : null,
            ]);

        $motoristas = Motorista::query()
            ->disponibles()
            ->where('activo', true)
            ->whereNotIn('id', $motoristasOcupados)
            ->with('tipoLicencia')
            ->get()
            ->map(fn ($motorista) => [
                'id' => $motorista->id,
                'nombre' => $motorista->nombre,
                'licencia' => $motorista->tipoLicencia?->nombre,
            ]);

        return [
            'vehiculos' => $vehiculos,
            'motoristas' => $motoristas,
        ];
    }

    // ── Helpers ──────────────────────────────────────────

    private function registrarEvento(SolicitudTransporte $solicitud, string $accion, int $userId, ?array $extra = null): void
    {
        BitacoraEvento::create([
            'entidad_tipo' => 'solicitud_transporte',
            'entidad_id' => $solicitud->id,
            'accion' => $accion,
            'user_id' => $userId,
            'datos_extras' => $extra,
        ]);
    }
}
