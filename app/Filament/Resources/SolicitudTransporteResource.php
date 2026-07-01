<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA SOLICITUDES DE TRANSPORTE
// -----------------------------------------------------------------------------

namespace App\Filament\Resources;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use App\Domain\Solicitudes\Services\EstadoFlotaService;
use App\Domain\Solicitudes\Services\SolicitudEmailDispatchService;
use App\Filament\Resources\SolicitudTransporteResource\Pages;
use App\Models\BitacoraEvento;
use App\Models\HistorialEstado;
use App\Models\Motorista;
use App\Models\SolicitudTransporte;
use App\Models\Vehiculo;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Log;

class SolicitudTransporteResource extends Resource
{
    protected static ?string $model = SolicitudTransporte::class;
    protected static ?string $recordTitleAttribute = 'codigo';
    protected static ?string $slug = 'solicitud-transporte';
    protected static ?string $navigationGroup = 'Asignaciones';
    protected static ?string $navigationLabel = 'Solicitudes de Transporte';
    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-check';

    public static function canViewAny(): bool
    {
        return auth()->check() && auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'operativo', 'liquidador', 'super_admin']);
    }

    public static function canEdit($record): bool
    {
        return in_array($record->estado?->value, [
            EstadoSolicitudEnum::BORRADOR->value,
            EstadoSolicitudEnum::PENDIENTE->value,
        ]);
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['codigo', 'ticket', 'origen', 'destino', 'motivo_actividad', 'unidad.nombre', 'solicitante.name', 'vehiculo.placa'];
    }

    // =========================================================================
    // MÉTODOS AUXILIARES
    // =========================================================================

    private static function resolverMotoristaParaVehiculo(int $vehiculoId): array
    {
        $vehiculo = Vehiculo::with('asignacionVigenteMotorista.motorista')->find($vehiculoId);
        $motoristaTitular = $vehiculo?->asignacionVigenteMotorista?->motorista;

        if ($motoristaTitular) {
            $ultimoEstado = \App\Models\MotoristaEstado::where('motorista_id', $motoristaTitular->id)
                ->orderByDesc('fecha_inicio')
                ->orderByDesc('id')
                ->first();

            $titularDisponible = ! ($ultimoEstado && ! filter_var($ultimoEstado->activo, FILTER_VALIDATE_BOOLEAN));

            if ($titularDisponible) {
                return [
                    'id' => $motoristaTitular->id,
                    'label' => "✅ {$motoristaTitular->nombre} — DUI: {$motoristaTitular->dui}",
                    'advertencia' => false,
                ];
            }

            $motivoBloqueo = $ultimoEstado?->motivo ?? 'No disponible';
        }

        $motoristasInactivos = \App\Models\MotoristaEstado::orderByDesc('fecha_inicio')
            ->orderByDesc('id')
            ->get()
            ->unique('motorista_id')
            ->filter(fn ($st) => ! filter_var($st->activo, FILTER_VALIDATE_BOOLEAN))
            ->pluck('motorista_id')
            ->toArray();

        $sugerido = Motorista::where('activo', true)
            ->whereNotIn('id', $motoristasInactivos)
            ->when($motoristaTitular, fn ($q) => $q->where('id', '!=', $motoristaTitular->id))
            ->orderBy('nombre')
            ->first();

        if ($motoristaTitular && $sugerido) {
            return [
                'id' => $sugerido->id,
                'label' => "⚠️ {$motoristaTitular->nombre} no disponible ({$motivoBloqueo}). 💡 Sugerido: {$sugerido->nombre} — DUI: {$sugerido->dui}",
                'advertencia' => true,
            ];
        }

        if ($motoristaTitular && !$sugerido) {
            return [
                'id' => null,
                'label' => "❌ {$motoristaTitular->nombre} no disponible y no hay sustitutos.",
                'advertencia' => true,
            ];
        }

        return [
            'id' => $sugerido?->id,
            'label' => $sugerido 
                ? "⚠️ Sin motorista titular. ¿Asignar a {$sugerido->nombre}?" 
                : '❌ Sin motoristas disponibles.',
            'advertencia' => true,
        ];
    }

    private static function afterVehiculoSeleccionado(): \Closure
    {
        return function ($state, callable $set) {
            if (!$state) {
                $set('motorista_id', null);
                $set('motorista_nombre', 'Selecciona un vehículo');
                return;
            }

            $resultado = static::resolverMotoristaParaVehiculo((int) $state);
            $set('motorista_id', $resultado['id']);
            $set('motorista_nombre', $resultado['label']);
        };
    }

    private static function guardarSiMotoristaDisponible(array $data): void
    {
        if (empty($data['motorista_id'])) {
            return;
        }

        $ultimoEstado = \App\Models\MotoristaEstado::where('motorista_id', $data['motorista_id'])
            ->orderByDesc('fecha_inicio')
            ->orderByDesc('id')
            ->first();

        if ($ultimoEstado && ! filter_var($ultimoEstado->activo, FILTER_VALIDATE_BOOLEAN)) {
            Notification::make()
                ->title('Acción Bloqueada')
                ->body('El motorista seleccionado está marcado como NO DISPONIBLE. Seleccioná otro.')
                ->danger()
                ->send();

            \Filament\Support\Exceptions\Halt::throw();
        }
    }

    // =========================================================================
    // FORMULARIO
    // =========================================================================

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Resumen')
                    ->schema([
                        Forms\Components\Placeholder::make('codigo_ui')
                            ->label('Código')
                            ->content(fn (SolicitudTransporte $record) => $record->codigo ?? '-'),

                        Forms\Components\Placeholder::make('unidad_ui')
                            ->label('Unidad Solicitante')
                            ->content(fn (SolicitudTransporte $record) => $record->unidad?->nombre ?? '-'),

                        Forms\Components\Placeholder::make('solicitante_ui')
                            ->label('Solicitante')
                            ->content(fn (SolicitudTransporte $record) => $record->solicitante?->name ?? '-'),

                        Forms\Components\Placeholder::make('salida_ui')
                            ->label('Salida')
                            ->content(fn (SolicitudTransporte $record) => optional($record->fecha_salida)?->format('d/m/Y H:i') ?? '-'),

                        Forms\Components\Placeholder::make('retorno_ui')
                            ->label('Retorno (Estimado)')
                            ->content(fn (SolicitudTransporte $record) => optional($record->fecha_retorno)?->format('d/m/Y H:i') ?? '-'),

                        Forms\Components\Placeholder::make('cantidad_personas_ui')
                            ->label('Cantidad de personas')
                            ->content(fn (SolicitudTransporte $record) => (string) ($record->cantidad_personas ?? '-')),

                        Forms\Components\Placeholder::make('prioridad_ui')
                            ->label('Prioridad')
                            ->content(fn (SolicitudTransporte $record) => $record->prioridad?->value ? strtoupper($record->prioridad->value) : '-'),

                        Forms\Components\Placeholder::make('estado_ui')
                            ->label('Estado')
                            ->content(fn (SolicitudTransporte $record) => $record->estado?->value ? strtoupper($record->estado->value) : '-'),
                    ])
                    ->columns(['default' => 1, 'sm' => 2, 'xl' => 4])
                    ->compact(),

                Forms\Components\Section::make('Ruta')
                    ->schema([
                        Forms\Components\Placeholder::make('origen_ui')
                            ->label('Origen')
                            ->content(fn (SolicitudTransporte $record) => $record->origen ?? '-'),

                        Forms\Components\Placeholder::make('destino_ui')
                            ->label('Destino')
                            ->content(fn (SolicitudTransporte $record) => $record->destino ?? '-'),

                        Forms\Components\Placeholder::make('destino_adicional_ui')
                            ->label('Destinos Adicionales')
                            ->content(function (SolicitudTransporte $record) {
                                // Destinos originales del campo texto
                                $html = '';
                                if ($record->destino_adicional) {
                                    $destinos = array_map('trim', explode(' - ', $record->destino_adicional));
                                    $html .= '<div style="margin-bottom: 8px; font-weight: 600; color: #374151;">Originales:</div>';
                                    $html .= '<ul style="list-style-type: disc; margin-left: 20px; line-height: 1.5;">';
                                    foreach ($destinos as $destino) {
                                        if (!empty($destino)) {
                                            $html .= '<li style="margin-bottom: 4px; color: #374151;">' . e($destino) . '</li>';
                                        }
                                    }
                                    $html .= '</ul>';
                                }

                                // Destinos de la nueva tabla, filtrados por agregado_durante_viaje
                                $duranteViaje = $record->destinosAdicionales->where('agregado_durante_viaje', true);
                                if ($duranteViaje->isNotEmpty()) {
                                    $html .= '<div style="margin-top: 8px; font-weight: 600; color: #374151;">Agregados durante el viaje:</div>';
                                    $html .= '<ul style="list-style-type: none; margin-left: 0; line-height: 1.5;">';
                                    foreach ($duranteViaje as $d) {
                                        $nombreAgregador = $d->agregadoPor?->name ?? $d->agregadoPor?->username ?? 'Desconocido';
                                        $html .= '<li style="margin-bottom: 6px; padding: 6px 10px; background: #fff7ed; border-left: 3px solid #f97316; border-radius: 4px; color: #374151;">';
                                        $html .= '🚩 <strong>' . e($d->nombre) . '</strong>';
                                        $html .= '<br><small style="color: #9a3412;">— El departamento de Transporte agregó este punto (' . e($nombreAgregador) . ').</small>';
                                        $html .= '</li>';
                                    }
                                    $html .= '</ul>';
                                }

                                if (empty($html)) {
                                    return 'Sin destinos adicionales';
                                }
                                return new \Illuminate\Support\HtmlString($html);
                            }),
                    ])
                    ->columns(['default' => 1, 'md' => 2, 'xl' => 3])
                    ->collapsible()
                    ->collapsed()
                    ->compact(),

                Forms\Components\Section::make('Motivo de la actividad')
                    ->schema([
                        Forms\Components\Placeholder::make('motivo_ui')
                            ->label('')
                            ->content(fn (SolicitudTransporte $record) => $record->motivo_actividad ?? '-'),
                    ])
                    ->collapsible()
                    ->collapsed(false)
                    ->compact(),

                Forms\Components\Section::make('Finalización del servicio')
                    ->description('Información del cierre del servicio de transporte')
                    ->icon('heroicon-o-check-badge')
                    ->schema([
                        Forms\Components\Placeholder::make('confirmado_por')
                            ->label('Finalizado por')
                            ->content(fn ($record) => $record->confirmador?->name ?? '—'),

                        Forms\Components\Placeholder::make('confirmado_en')
                            ->label('Fecha de finalización')
                            ->content(fn ($record) => optional($record->confirmado_en)?->format('d/m/Y H:i') ?? '—'),
                    ])
                    ->columns(2)
                    ->visible(fn ($record) => $record->estado === EstadoSolicitudEnum::COMPLETADA),

                Forms\Components\Section::make('Decisión / Auditoría')
                    ->schema([
                        Forms\Components\Placeholder::make('comentario_jefe_ui')
                            ->label('Observaciones de Jefatura')
                            ->content(fn (SolicitudTransporte $record) => $record->comentario_jefe ?? '-')
                            ->columnSpanFull(),

                        Forms\Components\Placeholder::make('vehiculo_ui')
                            ->label('Vehículo Asignado')
                            ->content(fn (SolicitudTransporte $record) => $record->vehiculo
                                ? "{$record->vehiculo->placa} - {$record->vehiculo->tipo->nombre}"
                                : '-'
                            )
                            ->columnSpanFull(),

                        Forms\Components\Placeholder::make('motorista_ui')
                            ->label('Motorista Asignado')
                            ->content(fn (SolicitudTransporte $record) => $record->motorista
                                ? "{$record->motorista->nombre} - {$record->motorista->dui}"
                                : '-'
                            )
                            ->columnSpanFull(),

                        Forms\Components\Placeholder::make('autorizador_ui')
                            ->label('Autorizado por')
                            ->content(fn (SolicitudTransporte $record) => $record->autorizador?->name ?? '-'),

                        Forms\Components\Placeholder::make('decidido_en_ui')
                            ->label('Fecha de Decisión')
                            ->content(fn (SolicitudTransporte $record) => optional($record->decidido_en)?->format('d/m/Y H:i') ?? '-'),
                    ])
                    ->columns(['default' => 1, 'md' => 2])
                    ->collapsible()
                    ->collapsed()
                    ->compact(),

                Forms\Components\Section::make('Historial de estados')
                    ->schema([
                        Forms\Components\Repeater::make('historial_ui')
                            ->label('')
                            ->disabled()
                            ->dehydrated(false)
                            ->default(function (SolicitudTransporte $record) {
                                return HistorialEstado::query()
                                    ->where('entidad_tipo', 'solicitud_transporte')
                                    ->where('entidad_id', $record->id)
                                    ->orderByDesc('created_at')
                                    ->get()
                                    ->map(fn ($h) => [
                                        'fecha' => optional($h->created_at)?->format('d/m/Y H:i') ?? '-',
                                        'de' => $h->estado_anterior ?? '-',
                                        'a' => $h->estado_nuevo ?? '-',
                                        'comentario' => $h->comentario ?? null,
                                    ])
                                    ->toArray();
                            })
                            ->schema([
                                Forms\Components\TextInput::make('fecha')->disabled(),
                                Forms\Components\TextInput::make('de')->label('De')->disabled(),
                                Forms\Components\TextInput::make('a')->label('A')->disabled(),
                                Forms\Components\Textarea::make('comentario')
                                    ->rows(2)
                                    ->disabled()
                                    ->columnSpanFull(),
                            ])
                            ->columns(['default' => 1, 'md' => 3])
                            ->columnSpanFull(),
                    ])
                    ->collapsible()
                    ->collapsed(false)
                    ->compact(),
            ]);
    }

    // =========================================================================
    // TABLA
    // =========================================================================

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('prioridad_orden', 'asc')
            ->contentGrid(['default' => 1, 'md' => 2, 'xl' => 3])
            ->recordUrl(fn (SolicitudTransporte $record) => static::getUrl('view', ['record' => $record]))
            ->columns([
                Tables\Columns\TextColumn::make('codigo')
                    ->label('Código')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->copyable(),

                Tables\Columns\TextColumn::make('ticket')
                    ->label('Ticket')
                    ->sortable()
                    ->searchable()
                    ->weight('bold')
                    ->fontFamily('mono')
                    ->copyable(),

                Tables\Columns\TextColumn::make('unidad.nombre')
                    ->label('Unidad')
                    ->searchable()
                    ->sortable()
                    ->wrap(),

                Tables\Columns\TextColumn::make('solicitante.name')
                    ->label('Solicitante')
                    ->searchable()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('prioridad')
                    ->label('Prioridad')
                    ->badge()
                    ->formatStateUsing(fn (PrioridadSolicitudEnum $state): string => match ($state) {
                        PrioridadSolicitudEnum::ALTA => 'ALTA',
                        PrioridadSolicitudEnum::MEDIA => 'MEDIA',
                        PrioridadSolicitudEnum::BAJA => 'BAJA',
                    })
                    ->color(fn (PrioridadSolicitudEnum $state): string => match ($state) {
                        PrioridadSolicitudEnum::ALTA => 'danger',
                        PrioridadSolicitudEnum::MEDIA => 'warning',
                        PrioridadSolicitudEnum::BAJA => 'success',
                    }),

                Tables\Columns\TextColumn::make('estado')
                    ->label('Estado')
                    ->badge()
                    ->formatStateUsing(fn (EstadoSolicitudEnum $state): string => match ($state) {
                        EstadoSolicitudEnum::BORRADOR => 'Borrador',
                        EstadoSolicitudEnum::PENDIENTE => 'Pendiente',
                        EstadoSolicitudEnum::EN_REVISION => 'En revisión',
                        EstadoSolicitudEnum::PRE_APROBADA => 'Pre-aprobada',
                        EstadoSolicitudEnum::APROBADA => 'Aprobada',
                        EstadoSolicitudEnum::RECHAZADA => 'Rechazada',
                        EstadoSolicitudEnum::PROGRAMADA => 'Programada',
                        EstadoSolicitudEnum::EN_EJECUCION => 'En ejecución',
                        EstadoSolicitudEnum::COMPLETADA => 'Completada',
                        EstadoSolicitudEnum::CANCELADA => 'Cancelada',
                        default => $state->value,
                    })
                    ->color(fn (EstadoSolicitudEnum $state): string => match ($state) {
                        EstadoSolicitudEnum::BORRADOR => 'gray',
                        EstadoSolicitudEnum::PENDIENTE => 'warning',
                        EstadoSolicitudEnum::EN_REVISION => 'info',
                        EstadoSolicitudEnum::PRE_APROBADA => 'warning',
                        EstadoSolicitudEnum::APROBADA => 'success',
                        EstadoSolicitudEnum::RECHAZADA => 'danger',
                        EstadoSolicitudEnum::PROGRAMADA => 'info',
                        EstadoSolicitudEnum::EN_EJECUCION => 'primary',
                        EstadoSolicitudEnum::COMPLETADA => 'success',
                        EstadoSolicitudEnum::CANCELADA => 'gray',
                        default => 'primary',
                    })
                    ->sortable(),

                Tables\Columns\TextColumn::make('fecha_salida')
                    ->label('Fecha Salida')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Creada')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('estado')
                    ->multiple()
                    ->options([
                        EstadoSolicitudEnum::BORRADOR->value => 'Borrador',
                        EstadoSolicitudEnum::PENDIENTE->value => 'Pendiente',
                        EstadoSolicitudEnum::EN_REVISION->value => 'En revisión',
                        EstadoSolicitudEnum::APROBADA->value => 'Aprobada',
                        EstadoSolicitudEnum::RECHAZADA->value => 'Rechazada',
                        EstadoSolicitudEnum::PROGRAMADA->value => 'Programada',
                        EstadoSolicitudEnum::EN_EJECUCION->value => 'En ejecución',
                        EstadoSolicitudEnum::COMPLETADA->value => 'Completada',
                        EstadoSolicitudEnum::CANCELADA->value => 'Cancelada',
                    ]),

                Tables\Filters\SelectFilter::make('prioridad')
                    ->options([
                        PrioridadSolicitudEnum::BAJA->value => 'BAJA',
                        PrioridadSolicitudEnum::MEDIA->value => 'MEDIA',
                        PrioridadSolicitudEnum::ALTA->value => 'ALTA',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),

                Tables\Actions\ActionGroup::make([

                    Tables\Actions\Action::make('observacion')
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
                                    'entidad_tipo' => 'solicitud_transporte',
                                    'entidad_id' => $record->id,
                                    'estado_anterior' => $estadoAnterior?->value,
                                    'estado_nuevo' => $record->estado?->value,
                                    'user_id' => auth()->id(),
                                    'comentario' => $data['comentario_jefe'],
                                ]);
                            }

                            BitacoraEvento::create([
                                'entidad_tipo' => 'solicitud_transporte',
                                'entidad_id' => $record->id,
                                'accion' => AccionBitacoraEnum::OBSERVAR->value,
                                'user_id' => auth()->id(),
                                'datos_extras' => ['comentario' => $data['comentario_jefe']],
                            ]);
                        })
                        ->visible(fn (SolicitudTransporte $record) => 
                            auth()->check() && 
                            auth()->user()->hasRole('operativo') &&
                            in_array($record->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)
                        ),

                    Tables\Actions\Action::make('aprobar')
                        ->label('Aprobar y Programar')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->modalHeading('Aprobar Solicitud')
                        ->form([
                            Forms\Components\Section::make('Asignación de Vehículo y Motorista')
                                ->schema([
                                    Forms\Components\Select::make('vehiculo_id')
                                        ->label('Vehículo')
                                        ->options(function (SolicitudTransporte $record) {
                                            $ocupados = SolicitudTransporte::query()
                                                ->where('id', '!=', $record->id)
                                                ->whereIn('estado', [
                                                    EstadoSolicitudEnum::PROGRAMADA,
                                                    EstadoSolicitudEnum::APROBADA,
                                                    EstadoSolicitudEnum::EN_EJECUCION,
                                                ])
                                                ->where(function ($query) use ($record) {
                                                    $query->where('fecha_salida', '<=', $record->fecha_retorno)
                                                        ->where('fecha_retorno', '>=', $record->fecha_salida);
                                                })
                                                ->pluck('vehiculo_id')
                                                ->filter()
                                                ->unique();

                                            return Vehiculo::where('activo', true)
                                                ->whereNotIn('id', $ocupados)
                                                ->get()
                                                ->mapWithKeys(fn ($v) => [
                                                    $v->id => "{$v->placa} - {$v->tipo->nombre}",
                                                ]);
                                        })
                                        ->searchable()
                                        ->required()
                                        ->hint(fn ($record) => 'Solicitó: ' . ($record->tipo_vehiculo_nombre ?? 'N/A'))
                                        ->hintColor('warning')
                                        ->live()
                                        ->afterStateUpdated(static::afterVehiculoSeleccionado()),

                                    Forms\Components\Hidden::make('motorista_id'),

                                    Forms\Components\Placeholder::make('motorista_nombre')
                                        ->label('Motorista asignado')
                                        ->content(fn ($get) => $get('motorista_nombre') ?? 'Selecciona un vehículo primero')
                                        ->hint(fn ($get) => !$get('motorista_id') ? '⚠ No hay motorista disponible' : null)
                                        ->hintColor('danger'),
                                ])
                                ->columns(2),

                            Forms\Components\Section::make('Firma del Aprobador')
                                ->description('Dibuje su firma. Aparecerá en el PDF de Misión Oficial.')
                                ->schema([
                                    \App\Forms\Components\SignaturePad::make('firma_aprobador')
                                        ->label('Firma')
                                        ->columnSpanFull(),
                                ])
                                ->columnSpanFull(),

                            Forms\Components\Textarea::make('comentario_jefe')
                                ->label('Observaciones adicionales')
                                ->rows(3),
                        ])
                        ->action(function (SolicitudTransporte $record, array $data) {
                            static::guardarSiMotoristaDisponible($data);

                            $estadoAnterior = $record->estado;

                            $record->update([
                                'estado' => EstadoSolicitudEnum::PROGRAMADA,
                                'comentario_jefe' => $data['comentario_jefe'],
                                'decidido_por' => auth()->id(),
                                'decidido_en' => now(),
                                'vehiculo_id' => $data['vehiculo_id'],
                                'motorista_id' => $data['motorista_id'],
                                'firma_aprobador' => $data['firma_aprobador'] ?? null,
                            ]);

                            app(EstadoFlotaService::class)->aplicarPorEstado($record);

                            HistorialEstado::create([
                                'entidad_tipo' => 'solicitud_transporte',
                                'entidad_id' => $record->id,
                                'estado_anterior' => $estadoAnterior?->value,
                                'estado_nuevo' => EstadoSolicitudEnum::PROGRAMADA->value,
                                'user_id' => auth()->id(),
                                'comentario' => $data['comentario_jefe'],
                            ]);

                            BitacoraEvento::create([
                                'entidad_tipo' => 'solicitud_transporte',
                                'entidad_id' => $record->id,
                                'accion' => AccionBitacoraEnum::APROBAR->value,
                                'user_id' => auth()->id(),
                                'datos_extras' => [
                                    'comentario' => $data['comentario_jefe'],
                                    'vehiculo_id' => $data['vehiculo_id'],
                                    'motorista_id' => $data['motorista_id'],
                                ],
                            ]);

                            Notification::make()
                                ->title('Solicitud aprobada con éxito')
                                ->body("La solicitud {$record->codigo} ha sido programada.")
                                ->success()
                                ->send();

                            try {
                                app(SolicitudEmailDispatchService::class)->toSolicitante(
                                    $record, 'transporte', 'solicitud_aprobada'
                                );
                            } catch (\Exception $e) {
                                Log::error('Error en correo de aprobación: '.$e->getMessage());
                            }
                        })
                        ->visible(fn (SolicitudTransporte $record) => 
                            auth()->user()?->hasRole('jefe') && 
                            $record->estado === EstadoSolicitudEnum::PRE_APROBADA
                        ),

                    Tables\Actions\Action::make('mision_oficial')
                        ->label('Misión Oficial')
                        ->icon('heroicon-o-document-text')
                        ->color('info')
                        ->url(fn (SolicitudTransporte $record) => route('reportes.mision-oficial.pdf', [
                            'solicitud_id' => $record->id,
                        ]))
                        ->openUrlInNewTab()
                        ->visible(fn (SolicitudTransporte $record) => 
                            auth()->check() &&
                            auth()->user()->hasAnyRole(['jefe', 'ti', 'super_admin']) &&
                            in_array($record->estado, [EstadoSolicitudEnum::PROGRAMADA, EstadoSolicitudEnum::COMPLETADA], true) &&
                            !empty($record->vehiculo_id) && 
                            !empty($record->motorista_id) &&
                            !empty($record->decidido_por)
                        ),

                    Tables\Actions\Action::make('documento_oficial')
                        ->label('Documento Oficial')
                        ->icon('heroicon-o-printer')
                        ->color('success')
                        ->url(fn ($record) => route('reportes.solicitud-autorizacion.pdf', [
                            'solicitud' => $record->id,
                        ]))
                        ->openUrlInNewTab(),
                ])
                ->label('Más')
                ->icon('heroicon-m-ellipsis-vertical'),
            ])
            ->bulkActions([]);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->with(['solicitante', 'unidad', 'autorizador', 'vehiculo.tipo', 'motorista']);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSolicitudTransportes::route('/'),
            'view' => Pages\ViewSolicitudTransporte::route('/{record}'),
            'edit' => Pages\EditSolicitudTransporte::route('/{record}/edit'),
        ];
    }
}