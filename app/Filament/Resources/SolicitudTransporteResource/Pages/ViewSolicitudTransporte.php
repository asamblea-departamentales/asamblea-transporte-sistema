<?php

namespace App\Filament\Resources\SolicitudTransporteResource\Pages;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Filament\Resources\SolicitudTransporteResource;
use App\Mail\NotificacionEventMail;
use App\Models\BitacoraEvento;
use App\Models\HistorialEstado;
use App\Models\SolicitudTransporte;
use Filament\Actions;
use Filament\Forms;
use Filament\Forms\Components\Actions as ComponentsActions;
use Filament\Resources\Pages\ViewRecord;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ViewSolicitudTransporte extends ViewRecord
{
    protected static string $resource = SolicitudTransporteResource::class;

    protected function getHeaderActions(): array
    {
        return [

            // ── OBSERVACIÓN ───────────────────────────────────────────────
            Actions\Action::make('observacion')
                ->button()
                ->size('lg')
                ->label('Observación')
                ->icon('heroicon-o-chat-bubble-left-ellipsis')
                ->modalHeading('Agregar Observación')
                ->modalSubmitActionLabel('Guardar Observación')
                ->form([
                    Forms\Components\Textarea::make('comentario_jefe')
                        ->label('Observación del jefe')
                        ->rows(4)
                        ->required()
                        ->maxLength(2000),
                ])
                ->action(function (SolicitudTransporte $record, array $data) {
                    $estadoAnterior = $record->estado;

                    $record->comentario_jefe = $data['comentario_jefe'];

                    if ($record->estado === EstadoSolicitudEnum::PENDIENTE) {
                        $record->estado = EstadoSolicitudEnum::EN_REVISION;
                    }

                    $record->save();

                    if ($estadoAnterior !== $record->estado) {
                        HistorialEstado::create([
                            'entidad_tipo'    => 'solicitud_transporte',
                            'entidad_id'      => $record->id,
                            'estado_anterior' => $estadoAnterior?->value,
                            'estado_nuevo'    => $record->estado?->value,
                            'user_id'         => auth()->id(),
                            'comentario'      => $data['comentario_jefe'],
                        ]);
                    }

                    BitacoraEvento::create([
                        'entidad_tipo' => 'solicitud_transporte',
                        'entidad_id'   => $record->id,
                        'accion'       => AccionBitacoraEnum::OBSERVAR->value,
                        'user_id'      => auth()->id(),
                        'datos_extras' => ['comentario' => $data['comentario_jefe']],
                    ]);
                })
                ->visible(fn (SolicitudTransporte $record) =>
                    auth()->check() &&
                    auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    in_array($record->estado, [
                        EstadoSolicitudEnum::PENDIENTE,
                        EstadoSolicitudEnum::EN_REVISION,
                    ], true)
                ),

            // ── PRE-APROBAR ───────────────────────────────────────────────
            Actions\Action::make('pre_aprobar')
                ->button()
                ->size('lg')
                ->label('Pre-Aprobar')
                ->color('warning')
                ->icon('heroicon-o-clock')
                ->requiresConfirmation()
                ->modalHeading('Pre-aprobar Solicitud')
                ->modalDescription('¿Desea marcar esta solicitud como pre-aprobada?')
                ->action(function (SolicitudTransporte $record) {
                    $estadoAnterior = $record->estado;

                    $record->estado = EstadoSolicitudEnum::PRE_APROBADA;
                    $record->save();

                    HistorialEstado::create([
                        'entidad_tipo'    => 'solicitud_transporte',
                        'entidad_id'      => $record->id,
                        'estado_anterior' => $estadoAnterior?->value,
                        'estado_nuevo'    => $record->estado?->value,
                        'user_id'         => auth()->id(),
                        'comentario'      => 'Solicitud pre-aprobada en revisión inicial.',
                    ]);

                    BitacoraEvento::create([
                        'entidad_tipo' => 'solicitud_transporte',
                        'entidad_id'   => $record->id,
                        'accion'       => AccionBitacoraEnum::PRE_APROBAR->value,
                        'user_id'      => auth()->id(),
                    ]);
                })
                ->visible(fn (SolicitudTransporte $record) =>
                    auth()->check() &&
                    auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    in_array($record->estado, [
                        EstadoSolicitudEnum::PENDIENTE,
                        EstadoSolicitudEnum::EN_REVISION,
                    ], true)
                ),

            // ── APROBAR / PROGRAMAR ── modal mejorado ─────────────────────
            Actions\Action::make('aprobar')
                ->button()
                ->size('lg')
                ->label('Programar y Aprobar')
                ->color('success')
                ->icon('heroicon-o-check-circle')
                ->modalHeading('Programar Solicitud de Transporte')
                ->modalDescription(fn (SolicitudTransporte $record) =>
                    "Solicitud {$record->codigo} · {$record->origen} → {$record->destino}"
                )
                ->modalSubmitActionLabel('✔ Confirmar programación')
                ->modalWidth('2xl')
                ->form([
                    // Resumen visual de la solicitud en verde
                    Forms\Components\Section::make('')
                        ->schema([
                            Forms\Components\Placeholder::make('resumen_aprobar')
                                ->label('')
                                ->content(function () {
                                    $record  = $this->record;
                                    $salida  = optional($record->fecha_salida)?->format('d/m/Y H:i') ?? '—';
                                    $retorno = optional($record->fecha_retorno)?->format('d/m/Y H:i') ?? '—';
                                    $vehiculo = $record->tipo_vehiculo_nombre ?? 'No especificado';

                                    return new \Illuminate\Support\HtmlString("
                                        <div style='background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);border:1.5px solid #bbf7d0;border-radius:14px;padding:16px 20px;display:grid;grid-template-columns:repeat(2,1fr);gap:12px 24px;font-size:13px;'>
                                            <div>
                                                <div style='font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#6b7280;font-weight:600;margin-bottom:3px;'>Solicitante</div>
                                                <div style='font-weight:600;color:#111827;'>{$record->solicitante?->name}</div>
                                            </div>
                                            <div>
                                                <div style='font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#6b7280;font-weight:600;margin-bottom:3px;'>Personas</div>
                                                <div style='font-weight:600;color:#111827;'>{$record->cantidad_personas}</div>
                                            </div>
                                            <div>
                                                <div style='font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#6b7280;font-weight:600;margin-bottom:3px;'>Salida</div>
                                                <div style='font-weight:600;color:#111827;'>📅 {$salida}</div>
                                            </div>
                                            <div>
                                                <div style='font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#6b7280;font-weight:600;margin-bottom:3px;'>Retorno estimado</div>
                                                <div style='font-weight:600;color:#111827;'>📅 {$retorno}</div>
                                            </div>
                                            <div style='grid-column:span 2;'>
                                                <div style='font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#6b7280;font-weight:600;margin-bottom:3px;'>Ruta</div>
                                                <div style='font-weight:600;color:#111827;'>📍 {$record->origen} → {$record->destino}</div>
                                            </div>
                                            <div style='grid-column:span 2;'>
                                                <div style='font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#6b7280;font-weight:600;margin-bottom:3px;'>Vehículo solicitado</div>
                                                <div style='font-weight:600;color:#0369a1;'>🚗 {$vehiculo}</div>
                                            </div>
                                        </div>
                                    ");
                                }),
                        ])
                        ->compact(),

                    // Comentario de decisión
                    Forms\Components\Section::make('Decisión')
                        ->description('El comentario quedará registrado en el historial de la solicitud.')
                        ->icon('heroicon-o-document-text')
                        ->schema([
                            Forms\Components\Textarea::make('comentario_jefe')
                                ->label('Motivo de la programación')
                                ->placeholder('Ej: Solicitud validada, recursos disponibles para la fecha indicada...')
                                ->rows(3)
                                ->required()
                                ->maxLength(2000)
                                ->columnSpanFull(),
                        ])
                        ->compact(),

                    // Asignación de vehículo y motorista
                    Forms\Components\Section::make('Asignación de Vehículo')
                        ->description('Solo se muestran vehículos sin conflicto de horario para las fechas de esta solicitud.')
                        ->icon('heroicon-o-truck')
                        ->schema([
                            Forms\Components\Select::make('vehiculo_id')
                                ->label('Vehículo disponible')
                                ->options(function () {
                                    $record = $this->record;

                                    $ocupados = SolicitudTransporte::query()
                                        ->where('id', '!=', $record->id)
                                        ->whereIn('estado', [
                                            EstadoSolicitudEnum::PROGRAMADA,
                                            EstadoSolicitudEnum::APROBADA,
                                            EstadoSolicitudEnum::EN_EJECUCION,
                                        ])
                                        ->where(function ($query) use ($record) {
                                            $query->where(function ($q) use ($record) {
                                                $q->where('fecha_salida', '<=', $record->fecha_retorno)
                                                  ->where('fecha_retorno', '>=', $record->fecha_salida);
                                            });
                                        })
                                        ->pluck('vehiculo_id')
                                        ->filter()
                                        ->unique();

                                    return \App\Models\Vehiculo::where('activo', true)
                                        ->whereNotIn('id', $ocupados)
                                        ->with('tipo')
                                        ->get()
                                        ->mapWithKeys(fn ($v) => [
                                            $v->id => "{$v->placa} — {$v->tipo->nombre}"
                                        ]);
                                })
                                ->hint('Solicitó: ' . ($this->record->tipo_vehiculo_nombre ?? 'N/A'))
                                ->hintColor('warning')
                                ->searchable()
                                ->required()
                                ->live()
                                ->afterStateUpdated(function ($state, callable $set) {
                                    if (!$state) {
                                        $set('motorista_nombre', null);
                                        $set('motorista_id', null);
                                        return;
                                    }
                                    $vehiculo  = \App\Models\Vehiculo::find($state);
                                    $motorista = $vehiculo?->asignacionVigenteMotorista?->motorista;
                                    $set('motorista_nombre', $motorista
                                        ? "{$motorista->nombre} — DUI: {$motorista->dui}"
                                        : 'sin_motorista');
                                    $set('motorista_id', $motorista?->id);
                                })
                                ->columnSpan(1),

                            Forms\Components\Hidden::make('motorista_id'),

                            Forms\Components\Placeholder::make('motorista_nombre')
                                ->label('Motorista del vehículo')
                                ->content(function ($get) {
                                    $nombre = $get('motorista_nombre');

                                    if (! $nombre) {
                                        return new \Illuminate\Support\HtmlString("<div style='background:#f9fafb;border:1.5px dashed #e5e7eb;border-radius:12px;padding:14px 18px;color:#9ca3af;font-size:13px;display:flex;align-items:center;gap:8px;'>👤 Selecciona un vehículo para ver el motorista</div>");
                                    }

                                    if ($nombre === 'sin_motorista') {
                                        return new \Illuminate\Support\HtmlString("<div style='background:#fef2f2;border:1.5px solid #fca5a5;border-radius:12px;padding:14px 18px;color:#dc2626;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;'>⚠️ Este vehículo no tiene motorista asignado</div>");
                                    }

                                    return new \Illuminate\Support\HtmlString("<div style='background:#f0fdf4;border:1.5px solid #86efac;border-radius:12px;padding:14px 18px;color:#166534;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;'>✅ {$nombre}</div>");
                                })
                                ->columnSpan(1),
                        ])
                        ->columns(2)
                        ->compact(),
                ])
                ->action(function (SolicitudTransporte $record, array $data) {
                    $estadoAnterior = $record->estado;

                    $record->estado          = EstadoSolicitudEnum::PROGRAMADA;
                    $record->vehiculo_id     = $data['vehiculo_id'];
                    $record->motorista_id    = $data['motorista_id'];
                    $record->comentario_jefe = $data['comentario_jefe'];
                    $record->decidido_por    = auth()->id();
                    $record->decidido_en     = now();
                    $record->save();

                    HistorialEstado::create([
                        'entidad_tipo'    => 'solicitud_transporte',
                        'entidad_id'      => $record->id,
                        'estado_anterior' => $estadoAnterior?->value,
                        'estado_nuevo'    => EstadoSolicitudEnum::PROGRAMADA->value,
                        'user_id'         => auth()->id(),
                        'comentario'      => $data['comentario_jefe'],
                    ]);

                    BitacoraEvento::create([
                        'entidad_tipo' => 'solicitud_transporte',
                        'entidad_id'   => $record->id,
                        'accion'       => AccionBitacoraEnum::APROBAR->value,
                        'user_id'      => auth()->id(),
                        'datos_extras' => [
                            'comentario'   => $data['comentario_jefe'],
                            'vehiculo_id'  => $data['vehiculo_id'],
                            'motorista_id' => $data['motorista_id'],
                        ],
                    ]);

                    try {
                        $record->load(['vehiculo.tipo', 'motorista', 'solicitante', 'unidad']);

                        $payload = [
                            'tipo'    => 'transporte',
                            'evento'  => 'solicitud_aprobada',
                            'mensaje' => 'Tu solicitud de transporte ha sido APROBADA y programada exitosamente.',
                            'solicitud' => [
                                'codigo'               => $record->codigo,
                                'estado'               => 'aprobada',
                                'tipo_vehiculo_nombre' => $record->vehiculo?->tipo?->nombre ?? 'No asignado',
                                'cantidad_personas'    => $record->cantidad_personas,
                                'origen'               => $record->origen,
                                'destino'              => $record->destino,
                                'destino_adicional'    => $record->destino_adicional,
                                'fecha_salida'         => $record->fecha_salida,
                                'fecha_retorno'        => $record->fecha_retorno,
                                'motivo_actividad'     => $record->motivo_actividad,
                                'vehiculo_placa'       => $record->vehiculo?->placa ?? 'N/A',
                                'motorista_nombre'     => $record->motorista?->nombre ?? 'N/A',
                            ],
                            'solicitante' => [
                                'name'  => $record->solicitante->name,
                                'email' => $record->solicitante->email,
                                'unidad' => [
                                    'nombre' => $record->unidad?->nombre ?? 'N/A',
                                    'siglas' => $record->unidad?->siglas ?? 'N/A',
                                ],
                            ],
                            'timestamp' => now()->format(\DateTimeInterface::ATOM),
                        ];

                        Mail::to($record->solicitante->email)->send(
                            new NotificacionEventMail('✅ Solicitud de Transporte APROBADA', $payload)
                        );
                    } catch (\Exception $e) {
                        Log::error('Error enviando correo de aprobación: ' . $e->getMessage());
                    }
                })
                ->visible(fn (SolicitudTransporte $record) =>
                    auth()->check() &&
                    auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    $record->estado === EstadoSolicitudEnum::PRE_APROBADA
                ),

            // ── ASIGNAR TRANSPORTE ── modal mejorado ──────────────────────
            Actions\Action::make('asignar_transporte')
                ->button()
                ->size('lg')
                ->label('Asignar Transporte')
                ->color('info')
                ->icon('heroicon-o-truck')
                ->modalHeading('Asignar Vehículo y Motorista')
                ->modalDescription(fn (SolicitudTransporte $record) =>
                    "Solicitud {$record->codigo} · {$record->origen} → {$record->destino}"
                )
                ->modalSubmitActionLabel('🚗 Confirmar asignación')
                ->modalWidth('2xl')
                ->form([
                    // Resumen visual en azul
                    Forms\Components\Section::make('')
                        ->schema([
                            Forms\Components\Placeholder::make('resumen_asignacion')
                                ->label('')
                                ->content(function () {
                                    $record  = $this->record;
                                    $salida  = optional($record->fecha_salida)?->format('d/m/Y H:i') ?? '—';
                                    $retorno = optional($record->fecha_retorno)?->format('d/m/Y H:i') ?? '—';
                                    $vehiculo = $record->tipo_vehiculo_nombre ?? 'No especificado';

                                    return new \Illuminate\Support\HtmlString("
                                        <div style='background:linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%);border:1.5px solid #bfdbfe;border-radius:14px;padding:16px 20px;display:grid;grid-template-columns:repeat(2,1fr);gap:12px 24px;font-size:13px;'>
                                            <div>
                                                <div style='font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#6b7280;font-weight:600;margin-bottom:3px;'>Solicitante</div>
                                                <div style='font-weight:600;color:#111827;'>{$record->solicitante?->name}</div>
                                            </div>
                                            <div>
                                                <div style='font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#6b7280;font-weight:600;margin-bottom:3px;'>Personas</div>
                                                <div style='font-weight:600;color:#111827;'>{$record->cantidad_personas}</div>
                                            </div>
                                            <div>
                                                <div style='font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#6b7280;font-weight:600;margin-bottom:3px;'>Salida</div>
                                                <div style='font-weight:600;color:#111827;'>📅 {$salida}</div>
                                            </div>
                                            <div>
                                                <div style='font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#6b7280;font-weight:600;margin-bottom:3px;'>Retorno estimado</div>
                                                <div style='font-weight:600;color:#111827;'>📅 {$retorno}</div>
                                            </div>
                                            <div style='grid-column:span 2;'>
                                                <div style='font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#6b7280;font-weight:600;margin-bottom:3px;'>Ruta</div>
                                                <div style='font-weight:600;color:#111827;'>📍 {$record->origen} → {$record->destino}</div>
                                            </div>
                                            <div style='grid-column:span 2;'>
                                                <div style='font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#6b7280;font-weight:600;margin-bottom:3px;'>Vehículo solicitado</div>
                                                <div style='font-weight:600;color:#0369a1;'>🚗 {$vehiculo}</div>
                                            </div>
                                        </div>
                                    ");
                                }),
                        ])
                        ->compact(),

                    Forms\Components\Section::make('Selección de Vehículo')
                        ->description('Solo se muestran vehículos sin conflicto de horario para esta solicitud.')
                        ->icon('heroicon-o-truck')
                        ->schema([
                            Forms\Components\Select::make('vehiculo_id')
                                ->label('Vehículo disponible')
                                ->options(function () {
                                    $record = $this->record;

                                    $ocupados = SolicitudTransporte::query()
                                        ->where('id', '!=', $record->id)
                                        ->whereIn('estado', [
                                            EstadoSolicitudEnum::PROGRAMADA,
                                            EstadoSolicitudEnum::APROBADA,
                                            EstadoSolicitudEnum::EN_EJECUCION,
                                        ])
                                        ->where(function ($query) use ($record) {
                                            $query->where(function ($q) use ($record) {
                                                $q->where('fecha_salida', '<=', $record->fecha_retorno)
                                                  ->where('fecha_retorno', '>=', $record->fecha_salida);
                                            });
                                        })
                                        ->pluck('vehiculo_id')
                                        ->filter()
                                        ->unique();

                                    return \App\Models\Vehiculo::where('activo', true)
                                        ->whereNotIn('id', $ocupados)
                                        ->with('tipo')
                                        ->get()
                                        ->mapWithKeys(fn ($v) => [
                                            $v->id => "{$v->placa} — {$v->tipo->nombre}"
                                        ]);
                                })
                                ->searchable()
                                ->required()
                                ->live()
                                ->afterStateUpdated(function ($state, callable $set) {
                                    $vehiculo  = \App\Models\Vehiculo::find($state);
                                    $motorista = $vehiculo?->asignacionVigenteMotorista?->motorista;
                                    $set('motorista_nombre', $motorista
                                        ? "{$motorista->nombre} — DUI: {$motorista->dui}"
                                        : 'sin_motorista');
                                    $set('motorista_id', $motorista?->id);
                                })
                                ->columnSpan(1),

                            Forms\Components\Hidden::make('motorista_id'),

                            Forms\Components\Placeholder::make('motorista_nombre')
                                ->label('Motorista del vehículo')
                                ->content(function ($get) {
                                    $nombre = $get('motorista_nombre');

                                    if (! $nombre) {
                                        return new \Illuminate\Support\HtmlString("<div style='background:#f9fafb;border:1.5px dashed #e5e7eb;border-radius:12px;padding:14px 18px;color:#9ca3af;font-size:13px;display:flex;align-items:center;gap:8px;'>👤 Selecciona un vehículo para ver el motorista</div>");
                                    }

                                    if ($nombre === 'sin_motorista') {
                                        return new \Illuminate\Support\HtmlString("<div style='background:#fef2f2;border:1.5px solid #fca5a5;border-radius:12px;padding:14px 18px;color:#dc2626;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;'>⚠️ Este vehículo no tiene motorista asignado</div>");
                                    }

                                    return new \Illuminate\Support\HtmlString("<div style='background:#f0fdf4;border:1.5px solid #86efac;border-radius:12px;padding:14px 18px;color:#166534;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;'> {$nombre}</div>");
                                })
                                ->columnSpan(1),
                        ])
                        ->columns(2)
                        ->compact(),
                ])
                ->action(function (SolicitudTransporte $record, array $data) {
                    $estadoAnterior = $record->estado;

                    $record->update([
                        'vehiculo_id'  => $data['vehiculo_id'],
                        'motorista_id' => $data['motorista_id'],
                        'estado'       => EstadoSolicitudEnum::ASIGNADA,
                    ]);

                    HistorialEstado::create([
                        'entidad_tipo'    => 'solicitud_transporte',
                        'entidad_id'      => $record->id,
                        'estado_anterior' => $estadoAnterior->value,
                        'estado_nuevo'    => EstadoSolicitudEnum::ASIGNADA->value,
                        'user_id'         => auth()->id(),
                        'comentario'      => 'Vehículo y motorista asignados.',
                    ]);

                    BitacoraEvento::create([
                        'entidad_tipo' => 'solicitud_transporte',
                        'entidad_id'   => $record->id,
                        'accion'       => AccionBitacoraEnum::ASIGNAR->value,
                        'user_id'      => auth()->id(),
                        'datos_extras' => [
                            'vehiculo_id'  => $data['vehiculo_id'],
                            'motorista_id' => $data['motorista_id'],
                        ],
                    ]);
                })
               ->visible(fn (SolicitudTransporte $record) =>
    auth()->check() &&
    auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
    $record->estado === EstadoSolicitudEnum::PROGRAMADA
),

            // ── RECHAZAR ── modal mejorado ────────────────────────────────
            Actions\Action::make('rechazar')
                ->button()
                ->size('lg')
                ->label('Rechazar')
                ->color('danger')
                ->icon('heroicon-o-x-circle')
                ->modalHeading('Rechazar Solicitud')
                ->modalDescription(fn (SolicitudTransporte $record) =>
                    "Solicitud {$record->codigo} — esta acción quedará registrada en el historial."
                )
                ->modalSubmitActionLabel('✕ Confirmar rechazo')
                ->modalWidth('lg')
                ->form([
                    // Resumen compacto en rojo
                    Forms\Components\Section::make('')
                        ->schema([
                            Forms\Components\Placeholder::make('resumen_rechazo')
                                ->label('')
                                ->content(function () {
                                    $record = $this->record;

                                    return new \Illuminate\Support\HtmlString("
                                        <div style='background:linear-gradient(135deg,#fff1f2 0%,#ffe4e6 100%);border:1.5px solid #fecdd3;border-radius:14px;padding:14px 18px;display:grid;grid-template-columns:repeat(2,1fr);gap:10px 20px;font-size:13px;'>
                                            <div>
                                                <div style='font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#9ca3af;font-weight:600;margin-bottom:3px;'>Código</div>
                                                <div style='font-weight:700;color:#111827;font-family:monospace;'>{$record->codigo}</div>
                                            </div>
                                            <div>
                                                <div style='font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#9ca3af;font-weight:600;margin-bottom:3px;'>Solicitante</div>
                                                <div style='font-weight:600;color:#111827;'>{$record->solicitante?->name}</div>
                                            </div>
                                            <div style='grid-column:span 2;'>
                                                <div style='font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#9ca3af;font-weight:600;margin-bottom:3px;'>Ruta</div>
                                                <div style='font-weight:600;color:#111827;'>📍 {$record->origen} → {$record->destino}</div>
                                            </div>
                                        </div>
                                    ");
                                }),
                        ])
                        ->compact(),

                    Forms\Components\Section::make('Motivo del rechazo')
                        ->description('El motivo será enviado al solicitante por correo electrónico.')
                        ->icon('heroicon-o-exclamation-triangle')
                        ->schema([
                            Forms\Components\Textarea::make('comentario_jefe')
                                ->label('Escribe el motivo')
                                ->placeholder('Ej: No hay disponibilidad de vehículos para esa fecha...')
                                ->rows(4)
                                ->required()
                                ->maxLength(2000)
                                ->columnSpanFull(),
                        ])
                        ->compact(),
                ])
                ->action(function (SolicitudTransporte $record, array $data) {
                    $estadoAnterior = $record->estado;

                    $record->estado          = EstadoSolicitudEnum::RECHAZADA;
                    $record->comentario_jefe = $data['comentario_jefe'];
                    $record->decidido_por    = auth()->id();
                    $record->decidido_en     = now();
                    $record->save();

                    HistorialEstado::create([
                        'entidad_tipo'    => 'solicitud_transporte',
                        'entidad_id'      => $record->id,
                        'estado_anterior' => $estadoAnterior?->value,
                        'estado_nuevo'    => $record->estado?->value,
                        'user_id'         => auth()->id(),
                        'comentario'      => $data['comentario_jefe'],
                    ]);

                    BitacoraEvento::create([
                        'entidad_tipo' => 'solicitud_transporte',
                        'entidad_id'   => $record->id,
                        'accion'       => AccionBitacoraEnum::RECHAZAR->value,
                        'user_id'      => auth()->id(),
                        'datos_extras' => ['comentario' => $data['comentario_jefe']],
                    ]);

                    try {
                        $record->load(['solicitante', 'unidad']);

                        $payload = [
                            'tipo'    => 'transporte',
                            'evento'  => 'solicitud_rechazada',
                            'mensaje' => 'Tu solicitud de transporte ha sido RECHAZADA.',
                            'solicitud' => [
                                'codigo'           => $record->codigo,
                                'estado'           => 'rechazada',
                                'origen'           => $record->origen,
                                'destino'          => $record->destino,
                                'fecha_salida'     => $record->fecha_salida,
                                'motivo_actividad' => $record->motivo_actividad,
                                'comentario_jefe'  => $data['comentario_jefe'],
                            ],
                            'solicitante' => [
                                'name'  => $record->solicitante->name,
                                'email' => $record->solicitante->email,
                                'unidad' => [
                                    'nombre' => $record->unidad?->nombre ?? 'N/A',
                                    'siglas' => $record->unidad?->siglas ?? 'N/A',
                                ],
                            ],
                            'timestamp' => now()->format(\DateTimeInterface::ATOM),
                        ];

                        Mail::to($record->solicitante->email)->send(
                            new NotificacionEventMail(' Solicitud de Transporte RECHAZADA', $payload)
                        );
                    } catch (\Exception $e) {
                        Log::error('Error enviando correo de rechazo: ' . $e->getMessage());
                    }
                })
                ->visible(fn (SolicitudTransporte $record) =>
                    auth()->check() &&
                    auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    in_array($record->estado, [
                        EstadoSolicitudEnum::PENDIENTE,
                        EstadoSolicitudEnum::EN_REVISION,
                        EstadoSolicitudEnum::PRE_APROBADA,
                    ], true)
                ),

            //Agregado para generar mision oficial para una solicitud especifica
            Actions\Action::make('mision_oficial')
                ->button()
                ->size('lg')
                ->label('Misión Oficial')
                ->color('gray')
                ->icon('heroicon-o-document-text') 
                ->url(fn (SolicitudTransporte $record) => 
                    route ('reportes.mision-oficial.pdf', $record->id)
                )
                ->openUrlInNewTab()
                ->visible(fn (SolicitudTransporte $record) =>
                    auth()->check()
                    && auth()->user()->hasAnyRole(['jefe', 'admin', 'ti'])
                    && in_array($record->estado, [
                        EstadoSolicitudEnum::PROGRAMADA,
                        EstadoSolicitudEnum::ASIGNADA,
                        EstadoSolicitudEnum::COMPLETADA,
                    ], true)
                ),

        ];
    }

    protected function canCreate(): bool
    {
        return false;
    }
}