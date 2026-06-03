<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA SOLICITUDES DE TRANSPORTE
// -----------------------------------------------------------------------------
// Este archivo define la lógica para gestionar las solicitudes de transporte
// dentro del sistema. Aquí se configuran los formularios, las tablas y las
// acciones que los usuarios pueden realizar sobre las solicitudes. Está pensado
// para que cualquier persona, incluso sin experiencia en Laravel o Filament,
// pueda entender cómo se administra el flujo de trabajo de las solicitudes.
//
// Cada sección y método tiene comentarios explicativos para facilitar la
// comprensión, especialmente para ingenieros con experiencia tradicional o que
// no están familiarizados con frameworks modernos.


namespace App\Filament\Resources;

//Resource de Filament para gestionar las Solicitudes de Transporte, con formularios personalizados, acciones específicas y 
//lógica de negocio integrada para resolver motoristas disponibles según el vehículo seleccionado, además de incluir un historial de estados y observaciones de jefatura.

// Imports para los emails
use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use App\Domain\Solicitudes\Services\EstadoFlotaService;
use App\Filament\Resources\SolicitudTransporteResource\Pages;
use App\Mail\NotificacionEventMail;
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
use Filament\Tables\Actions\Action;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

// Esta clase representa el "recurso" de Solicitudes de Transporte.
// Un recurso es una pantalla o módulo donde se pueden ver, crear y gestionar registros.
class SolicitudTransporteResource extends Resource
{

    // Indica el modelo principal que representa una solicitud de transporte en la base de datos.
    protected static ?string $model = SolicitudTransporte::class;

    // "Slug" es el nombre corto que se usa en la URL para este recurso.
    protected static ?string $slug = 'solicitud-transporte';

    // Agrupa este recurso en el menú bajo "Asignaciones".
    protected static ?string $navigationGroup = 'Asignaciones';

    // Nombre que aparece en el menú de navegación.
    protected static ?string $navigationLabel = 'Solicitudes de Transporte';

    // Icono visual para identificar este recurso en el menú.
    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-check';

    // Controla quién puede ver la lista de solicitudes.
    public static function canViewAny(): bool
    {
        return auth()->check() && auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'operativo', 'liquidador', 'super_admin']);
    }

    public static function canEdit($record): bool
    {
        return in_array($record->estado->value, [
            EstadoSolicitudEnum::BORRADOR->value,
            EstadoSolicitudEnum::PENDIENTE->value,
        ]);
    }

    // =========================================================================
    // -------------------------------------------------------------------------
    // MÉTODO AUXILIAR: Selección automática de motorista según vehículo
    // -------------------------------------------------------------------------
    // Este método busca el motorista más adecuado para un vehículo específico.
    // Si el titular no está disponible, sugiere un sustituto.
    // =========================================================================
    private static function resolverMotoristaParaVehiculo(int $vehiculoId): array
    {
        $vehiculo = Vehiculo::with('asignacionVigenteMotorista.motorista')->find($vehiculoId);
        $motoristaTitular = $vehiculo?->asignacionVigenteMotorista?->motorista;

        // 1. Verificar disponibilidad del titular
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

        // 2. Buscar sustituto disponible
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

        if ($motoristaTitular && ! $sugerido) {
            return [
                'id' => null,
                'label' => "❌ {$motoristaTitular->nombre} no disponible y no hay sustitutos.",
                'advertencia' => true,
            ];
        }

        if (! $motoristaTitular) {
            return [
                'id' => null,
                'label' => $sugerido
                    ? "⚠️ Sin motorista titular. ¿Asignar a {$sugerido->nombre}?"
                    : '❌ Sin motorista titular y sin sustitutos disponibles.',
                'advertencia' => true,
            ];
        }

        return [
            'id' => null,
            'label' => '❌ Sin motorista titular y sin sustitutos disponibles.',
            'advertencia' => true,
        ];
    }

    // =========================================================================
    // -------------------------------------------------------------------------
    // MÉTODO AUXILIAR: Actualización automática del motorista al elegir vehículo
    // -------------------------------------------------------------------------
    // Este método se usa para que, al seleccionar un vehículo, el sistema
    // automáticamente sugiera el motorista más adecuado y muestre su información.
    // =========================================================================
    private static function afterVehiculoSeleccionado(): \Closure
    {
        return function ($state, callable $set) {
            if (! $state) {
                $set('motorista_id', null);
                $set('motorista_nombre', 'Selecciona un vehículo');

                return;
            }

            $resultado = static::resolverMotoristaParaVehiculo((int) $state);
            $set('motorista_id', $resultado['id']);
            $set('motorista_nombre', $resultado['label']);
        };
    }

    // =========================================================================
    // -------------------------------------------------------------------------
    // MÉTODO AUXILIAR: Verifica que el motorista esté disponible antes de guardar
    // -------------------------------------------------------------------------
    // Si el motorista seleccionado está marcado como NO DISPONIBLE, bloquea la acción.
    // =========================================================================
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
    // -------------------------------------------------------------------------
    // FORMULARIO PRINCIPAL
    // -------------------------------------------------------------------------
    // Aquí se define cómo se ve y se comporta el formulario para ver o editar
    // una solicitud de transporte. Cada sección tiene campos específicos y
    // explicaciones para el usuario.
    // =========================================================================
    public static function form(Form $form): Form
    {
        // El formulario se divide en varias secciones para mostrar información relevante.
        // Cada sección tiene un propósito claro y los campos muestran datos importantes
        // de la solicitud, como el código, unidad solicitante, fechas, motivo, etc.
        return $form
            ->schema([
                // Sección de resumen general de la solicitud
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
                                if (! $record->destino_adicional) {
                                    return 'Sin destinos adicionales';
                                }

                                $destinos = array_map('trim', explode(' - ', $record->destino_adicional));

                                $html = '<ul style="list-style-type: disc; margin-left: 20px; line-height: 1.5;">';
                                foreach ($destinos as $destino) {
                                    if (! empty($destino)) {
                                        $html .= '<li style="margin-bottom: 8px; color: #374151;">'.e($destino).'</li>';
                                    }
                                }
                                $html .= '</ul>';

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
                            ->content(fn ($record) => optional($record->confirmado_en)?->format('d/m/Y H:i') ?? '—'
                            ),
                    ])
                    ->columns(2)
                    ->visible(fn ($record) => $record->estado === EstadoSolicitudEnum::COMPLETADA
                    ),

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
                            ->content(fn (SolicitudTransporte $record) => optional($record->decidido_en)?->format('d/m/Y H:i') ?? '-'
                            ),
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
    // TABLE
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

                Tables\Columns\TextColumn::make('prioridad_grupo')
                    ->label('Prioridad Grupo')
                    ->badge()
                    ->color(fn ($state) => ($state instanceof \App\Domain\Solicitudes\Enums\NivelPrioridadEnum ? $state : \App\Domain\Solicitudes\Enums\NivelPrioridadEnum::tryFrom($state))?->color() ?? 'gray')
                    ->formatStateUsing(fn ($state) => ($state instanceof \App\Domain\Solicitudes\Enums\NivelPrioridadEnum ? $state : \App\Domain\Solicitudes\Enums\NivelPrioridadEnum::tryFrom($state))?->label() ?? 'Baja')
                    ->sortable(),

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

                Tables\Columns\TextColumn::make('tipo_vehiculo_nombre')
                    ->label('Vehículo Pedido')
                    ->placeholder('No especificado')
                    ->badge()
                    ->color('info')
                    ->icon('heroicon-m-truck')
                    ->formatStateUsing(fn (string $state): string => ucfirst($state))
                    ->toggleable(isToggledHiddenByDefault: true),

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

                Tables\Columns\TextColumn::make('horas_estimadas')
                    ->label('Horas Est.')
                    ->formatStateUsing(fn ($state) => $state ? number_format($state, 2) . ' h' : '—')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('horas_reales')
                    ->label('Horas Reales')
                    ->formatStateUsing(fn ($state) => $state ? number_format($state, 2) . ' h' : '—')
                    ->toggleable(isToggledHiddenByDefault: true),

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

                Tables\Filters\SelectFilter::make('prioridad_grupo')
                    ->label('Nivel de prioridad (Grupo)')
                    ->options([
                        'critica' => 'Crítica',
                        'alta'    => 'Alta',
                        'media'   => 'Media',
                        'baja'    => 'Baja',
                    ]),

                Tables\Filters\SelectFilter::make('unidad_solicitante_id')
                    ->label('Unidad')
                    ->relationship('unidad', 'nombre'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),

                Tables\Actions\ActionGroup::make([

                    // ---------------------------------------------------------
                    // OBSERVACIÓN
                    // ---------------------------------------------------------
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
                        ->visible(fn (SolicitudTransporte $record) => auth()->check() &&
                            auth()->user()->hasRole('operativo') &&
                            in_array($record->estado, [
                                EstadoSolicitudEnum::PENDIENTE,
                                EstadoSolicitudEnum::EN_REVISION,
                            ], true)
                        ),

                    // ---------------------------------------------------------
                    // PRE-APROBAR
                    // ---------------------------------------------------------
                    Tables\Actions\Action::make('pre_aprobar')
                        ->label('Pre-Aprobar')
                        ->color('warning')
                        ->icon('heroicon-o-clock')
                        ->requiresConfirmation()
                        ->modalHeading('Pre-aprobar Solicitud')
                        ->action(function (SolicitudTransporte $record) {
                            $estadoAnterior = $record->estado;
                            $record->estado = EstadoSolicitudEnum::PRE_APROBADA;
                            $record->save();

                            HistorialEstado::create([
                                'entidad_tipo' => 'solicitud_transporte',
                                'entidad_id' => $record->id,
                                'estado_anterior' => $estadoAnterior?->value,
                                'estado_nuevo' => $record->estado?->value,
                                'user_id' => auth()->id(),
                                'comentario' => 'Solicitud pre-aprobada en revisión inicial.',
                            ]);

                            BitacoraEvento::create([
                                'entidad_tipo' => 'solicitud_transporte',
                                'entidad_id' => $record->id,
                                'accion' => AccionBitacoraEnum::PRE_APROBAR->value,
                                'user_id' => auth()->id(),
                            ]);
                        })
                        ->visible(fn (SolicitudTransporte $record) => auth()->check() &&
                            auth()->user()->hasRole('operativo') &&
                            $record->estado === EstadoSolicitudEnum::EN_REVISION
                        ),

                    // ---------------------------------------------------------
                    // ASIGNAR TRANSPORTE
                    // ---------------------------------------------------------
                    Tables\Actions\Action::make('asignar_transporte')
                        ->label('Asignar transporte')
                        ->icon('heroicon-o-truck')
                        ->color('info')
                        ->modalHeading('Asignar Vehículo y Motorista')
                        ->visible(fn (SolicitudTransporte $record) => auth()->check() &&
                            auth()->user()->hasRole('jefe') &&
                            in_array($record->estado, [
                                EstadoSolicitudEnum::APROBADA,
                                EstadoSolicitudEnum::PROGRAMADA,
                            ], true)
                        )
                        ->form([
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
                                            $query->where(function ($q) use ($record) {
                                                $q->where('fecha_salida', '<=', $record->fecha_retorno)
                                                    ->where('fecha_retorno', '>=', $record->fecha_salida);
                                            });
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
                                ->live()
                                ->afterStateUpdated(static::afterVehiculoSeleccionado()),

                            Forms\Components\Hidden::make('motorista_id'),

                            Forms\Components\Placeholder::make('motorista_nombre')
                                ->label('Motorista asignado')
                                ->content(fn ($get) => $get('motorista_nombre') ?? 'Selecciona un vehículo')
                                ->hint(fn ($get) => ! $get('motorista_id') ? '⚠ Este vehículo no tiene motorista disponible' : null)
                                ->hintColor('danger'),
                        ])
                        ->action(function (SolicitudTransporte $record, array $data) {
                            static::guardarSiMotoristaDisponible($data);

                            $estadoAnterior = $record->estado;

                            $record->update([
                                'vehiculo_id' => $data['vehiculo_id'],
                                'motorista_id' => $data['motorista_id'],
                                'estado' => EstadoSolicitudEnum::ASIGNADA,
                            ]);

                            app(EstadoFlotaService::class)->aplicarPorEstado($record);

                            HistorialEstado::create([
                                'entidad_tipo' => 'solicitud_transporte',
                                'entidad_id' => $record->id,
                                'estado_anterior' => $estadoAnterior->value,
                                'estado_nuevo' => EstadoSolicitudEnum::ASIGNADA->value,
                                'user_id' => auth()->id(),
                                'comentario' => 'Vehículo y motorista asignados.',
                            ]);

                            BitacoraEvento::create([
                                'entidad_tipo' => 'solicitud_transporte',
                                'entidad_id' => $record->id,
                                'accion' => AccionBitacoraEnum::ASIGNAR->value,
                                'user_id' => auth()->id(),
                                'datos_extras' => [
                                    'vehiculo_id' => $data['vehiculo_id'],
                                    'motorista_id' => $data['motorista_id'],
                                ],
                            ]);
                        }),

                    // ---------------------------------------------------------
                    // APROBAR
                    // ---------------------------------------------------------
                    Action::make('aprobar')
                        ->label('Aprobar')
                        ->color('success')
                        ->icon('heroicon-o-check-circle')
                        ->modalHeading('Aprobar y Asignar Vehículo')
                        ->modalWidth('2xl')
                        ->successNotification(null)
                        ->form([
                            Forms\Components\Textarea::make('comentario_jefe')
                                ->label('Motivo de la aprobación')
                                ->rows(4)
                                ->required()
                                ->maxLength(2000)
                                ->columnSpanFull(),

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
                                        ->hint(fn ($record) => 'Solicitó: '.($record->tipo_vehiculo_nombre ?? 'N/A'))
                                        ->hintColor('warning')
                                        ->live()
                                        ->afterStateUpdated(static::afterVehiculoSeleccionado()),

                                    Forms\Components\Hidden::make('motorista_id'),

                                    Forms\Components\Placeholder::make('motorista_nombre')
                                        ->label('Motorista asignado')
                                        ->content(fn ($get) => $get('motorista_nombre') ?? 'Selecciona un vehículo primero')
                                        ->hint(fn ($get) => ! $get('motorista_id') ? '⚠ No hay motorista disponible' : null)
                                        ->hintColor('danger'),
                                ])
                                ->columns(2),

                            // NUEVO PARA LA FIRMA
                            Forms\Components\Section::make('Firma del Aprobador')
                                ->description('Dibuje su firma. Aparecerá en el PDF de Misión Oficial.')
                                ->schema([
                                    \App\Forms\Components\SignaturePad::make('firma_aprobador')
                                        ->label('Firma')
                                        ->columnSpanFull(),
                                ])
                                ->columnSpanFull(),
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
                                'firma_aprobador' => $data['firma_aprobador'] ?? null,  // ← nuevo
                            ]);

                            app(EstadoFlotaService::class)->aplicarPorEstado($record);

                            HistorialEstado::create([
                                'entidad_tipo' => 'solicitud_transporte',
                                'entidad_id' => $record->id,
                                'estado_anterior' => $estadoAnterior->value,
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
                                $record->load(['vehiculo.tipo', 'motorista', 'solicitante', 'unidad']);

                                $payload = [
                                    'tipo' => 'transporte',
                                    'evento' => 'solicitud_aprobada',
                                    'mensaje' => 'Tu solicitud de transporte ha sido APROBADA.',
                                    'solicitud' => [
                                        'codigo' => $record->codigo,
                                        'estado' => 'aprobado',
                                        'vehiculo' => $record->vehiculo->placa ?? 'N/A',
                                        'motorista' => $record->motorista->nombre ?? 'N/A',
                                        'fecha_salida' => $record->fecha_salida,
                                        'destino' => $record->destino,
                                    ],
                                    'solicitante' => [
                                        'name' => $record->solicitante->name,
                                        'email' => $record->solicitante->email,
                                    ],
                                    'timestamp' => now()->toIso8601String(),
                                ];

                                Mail::to($record->solicitante->email)->send(
                                    new NotificacionEventMail('✅ Solicitud de Transporte APROBADA', $payload)
                                );
                            } catch (\Exception $e) {
                                Log::error('Error en correo de aprobación: '.$e->getMessage());
                            }
                        })
                        ->visible(fn (SolicitudTransporte $record) => auth()->user()?->hasRole('jefe') &&
                                                    $record->estado === EstadoSolicitudEnum::PRE_APROBADA
                        ),

                    // ---------------------------------------------------------
                    // MISIÓN OFICIAL
                    // ---------------------------------------------------------
                    Tables\Actions\Action::make('mision_oficial')
                        ->label('Misión Oficial')
                        ->icon('heroicon-o-document-text')
                        ->color('info')
                        ->url(fn (SolicitudTransporte $record) => route('reportes.mision-oficial.pdf', [
                            'solicitud_id' => $record->id,
                        ]))
                        ->openUrlInNewTab()
                        ->visible(fn (SolicitudTransporte $record) => auth()->check() &&
                            auth()->user()->hasAnyRole(['jefe', 'ti', 'super_admin']) &&
                            in_array($record->estado, [
                                EstadoSolicitudEnum::PROGRAMADA,
                                EstadoSolicitudEnum::COMPLETADA,
                            ], true) &&
                            ! empty($record->vehiculo_id) &&
                            ! empty($record->motorista_id) &&
                            ! empty($record->decidido_por)
                        ),

                    // ---------------------------------------------------------
                    // DOCUMENTO OFICIAL
                    // ---------------------------------------------------------
                    Tables\Actions\Action::make('documento_oficial')
                        ->label('Documento Oficial')
                        ->icon('heroicon-o-printer')
                        ->color('success')
                        ->url(fn ($record) => route('reportes.solicitud-autorizacion.pdf', [
                            'solicitud' => $record->id,
                        ]))
                        ->openUrlInNewTab(),

                    // ---------------------------------------------------------
                    // RECHAZAR
                    // ---------------------------------------------------------
                    Tables\Actions\Action::make('rechazar')
                        ->label('Rechazar')
                        ->color('danger')
                        ->icon('heroicon-o-x-circle')
                        ->form([
                            Forms\Components\Textarea::make('comentario_jefe')
                                ->label('Motivo del rechazo')
                                ->required(),
                        ])
                        ->action(function (SolicitudTransporte $record, array $data) {
                            $estadoAnterior = $record->estado;

                            $record->update([
                                'estado' => EstadoSolicitudEnum::RECHAZADA,
                                'comentario_jefe' => $data['comentario_jefe'],
                                'decidido_por' => auth()->id(),
                                'decidido_en' => now(),
                            ]);

                            HistorialEstado::create([
                                'entidad_tipo' => 'solicitud_transporte',
                                'entidad_id' => $record->id,
                                'estado_anterior' => $estadoAnterior->value,
                                'estado_nuevo' => EstadoSolicitudEnum::RECHAZADA->value,
                                'user_id' => auth()->id(),
                                'comentario' => $data['comentario_jefe'],
                            ]);
                        })
                        ->visible(fn (SolicitudTransporte $record) => auth()->check() && (
                            (
                                auth()->user()->hasRole('operativo') &&
                                in_array($record->estado, [
                                    EstadoSolicitudEnum::PENDIENTE,
                                    EstadoSolicitudEnum::EN_REVISION,
                                ], true)
                            ) || (
                                auth()->user()->hasRole('jefe') &&
                                $record->estado === EstadoSolicitudEnum::PRE_APROBADA
                            )
                        )
                        ),

                ])
                    ->label('Más')
                    ->icon('heroicon-m-ellipsis-vertical'),
            ])
            ->bulkActions([]);
    }

    // =========================================================================
    // ELOQUENT QUERY
    // =========================================================================
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
