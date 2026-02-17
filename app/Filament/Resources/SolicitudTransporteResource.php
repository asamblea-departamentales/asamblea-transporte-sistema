<?php

namespace App\Filament\Resources;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use App\Filament\Resources\SolicitudTransporteResource\Pages;
use App\Filament\Resources\SolicitudTransporteResource\RelationManagers;
use App\Models\SolicitudTransporte;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use App\Models\HistorialEstado;
use App\Models\BitacoraEvento;
use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;

class SolicitudTransporteResource extends Resource
{
    protected static ?string $model = SolicitudTransporte::class;

    protected static ?string $navigationGroup = 'Aprobaciones';
    protected static ?string $navigationLabel = 'Solicitudes de Transporte';
    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-check';

    //Restricciones de acceso al recurso
    public static function canViewAny(): bool
    {
        return auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']);
    }

    public static function form(Form $form): Form
{
    return $form
        ->schema([
            // ✅ RESUMEN (siempre visible)
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
                ->columns(4)
                ->compact(),

            // ✅ RUTA (colapsable)
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
        if (!$record->destino_adicional) return 'Sin destinos adicionales';

        // 1. Separamos por el guion que divide las direcciones completas
        // Usamos trim para limpiar espacios alrededor
        $destinos = array_map('trim', explode(' - ', $record->destino_adicional));

        // 2. Creamos una lista HTML para que se vea ordenado y no se amontone
        $html = '<ul style="list-style-type: disc; margin-left: 20px; line-height: 1.5;">';
        foreach ($destinos as $destino) {
            if (!empty($destino)) {
                $html .= '<li style="margin-bottom: 8px; color: #374151;">' . e($destino) . '</li>';
            }
        }
        $html .= '</ul>';

        return new \Illuminate\Support\HtmlString($html);
    }),
                ])
                ->columns(3)
                ->collapsible()
                ->collapsed()
                ->compact(),

            // ✅ MOTIVO (colapsable)
            Forms\Components\Section::make('Motivo de la actividad')
                ->schema([
                    Forms\Components\Placeholder::make('motivo_ui')
                        ->label('')
                        ->content(fn (SolicitudTransporte $record) => $record->motivo_actividad ?? '-'),
                ])
                ->collapsible()
                ->collapsed(false)
                ->compact(),

            //  DECISIÓN / AUDITORÍA (colapsable)
            Forms\Components\Section::make('Decisión / Auditoría')
                ->schema([
                    Forms\Components\Placeholder::make('comentario_jefe_ui')
                        ->label('Observaciones de Jefatura')
                        ->content(fn (SolicitudTransporte $record) => $record->comentario_jefe ?? '-')
                        ->columnSpanFull(),

                    Forms\Components\Placeholder::make('vehiculo_ui')
                        ->label('Vehículo Asignado')
                        ->content(fn (SolicitudTransporte $record) => $record->vehiculo ? "{$record->vehiculo->placa} - {$record->vehiculo->tipo->nombre}" : '-')
                        ->columnSpanFull(),
                        
                    Forms\Components\Placeholder::make('motorista_ui')
                        ->label('Motorista Asignado')
                        ->content(fn (SolicitudTransporte $record) => $record->motorista ? "{$record->motorista->nombre} - {$record->motorista->dui}" : '-')
                        ->columnSpanFull(),    

                    Forms\Components\Placeholder::make('autorizador_ui')
                        ->label('Autorizado por')
                        ->content(fn (SolicitudTransporte $record) => $record->autorizador?->name ?? '-'),

                    Forms\Components\Placeholder::make('decidido_en_ui')
                        ->label('Fecha de Decisión')
                        ->content(fn (SolicitudTransporte $record) => optional($record->decidido_en)?->format('d/m/Y H:i') ?? '-'),
                ])
                ->columns(2)
                ->collapsible()
                ->collapsed()
                ->compact(),

            // ✅ HISTORIAL
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
                                    'de'    => $h->estado_anterior ?? '-',
                                    'a'     => $h->estado_nuevo ?? '-',
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
                        ->columns(3)
                        ->columnSpanFull(),
                ])
                ->collapsible()
                ->collapsed(false)
                ->compact(),
        ]);
}


    public static function table(Table $table): Table
{
    return $table
        ->defaultSort('fecha_salida', 'asc')
        ->columns([
            Tables\Columns\TextColumn::make('codigo')
                ->label('Código')
                ->searchable()
                ->sortable()
                ->weight('bold')
                ->copyable(),

            Tables\Columns\TextColumn::make('unidad.nombre')
                ->label('Unidad')
                ->searchable()
                ->sortable()
                ->wrap(), // Permite que el nombre de la unidad baje de línea si es largo

            Tables\Columns\TextColumn::make('solicitante.name')
                ->label('Solicitante')
                ->searchable()
                ->sortable()
                ->toggleable(isToggledHiddenByDefault: true), // Se puede activar si se necesita

            // Prioridad con badge de colores
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

            // MEJORA: Tipo de Vehículo solicitado (el string que viene del front)
            Tables\Columns\TextColumn::make('tipo_vehiculo_nombre')
                ->label('Vehículo Pedido')
                ->placeholder('No especificado')
                ->badge()
                ->color('info')
                ->icon('heroicon-m-truck')
                ->formatStateUsing(fn (string $state): string => ucfirst($state)),

            // Estado configurado con el Enum
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
                ->dateTime('d/m/Y')
                ->description(fn ($record) => $record->hora_salida) // Muestra la hora abajo de la fecha
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

            Tables\Filters\SelectFilter::make('unidad_solicitante_id')
                ->label('Unidad')
                ->relationship('unidad', 'nombre'),
        ])
        ->actions([
            Tables\Actions\ViewAction::make(),

            // OBSERVACIÓN
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
                    in_array($record->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)
                ),

            // PRE-APROBAR
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
                        'accion'       => 'PRE_APROBAR',
                        'user_id'      => auth()->id(),
                    ]);
                })
                ->visible(fn (SolicitudTransporte $record) => 
                    auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    in_array($record->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)
                ),

            // APROBAR
            Tables\Actions\Action::make('aprobar')
                ->label('Aprobar')
                ->color('success')
                ->icon('heroicon-o-check-circle')
                ->modalHeading('Aprobar y Asignar Vehículo')
                ->form([
                    Forms\Components\Textarea::make('comentario_jefe')
                        ->label('Motivo de la aprobación')
                        ->required(),
                    Forms\Components\Section::make('Asignación')
                        ->schema([
                            Forms\Components\Select::make('vehiculo_id')
                                ->label('Vehículo')
                                ->options(fn () => \App\Models\Vehiculo::where('activo', true)->get()->mapWithKeys(fn ($v) => [$v->id => "{$v->placa} - {$v->tipo->nombre}"]))
                                ->searchable()
                                ->required()
                                ->hint(fn ($record) => "Solicitó: " . ($record->tipo_vehiculo_nombre ?? 'N/A'))
                                ->hintColor('warning')
                                ->reactive()
                                ->afterStateUpdated(function ($state, callable $set) {
                                    $vehiculo = \App\Models\Vehiculo::find($state);
                                    if ($asignacion = $vehiculo?->asignacionVigenteMotorista) {
                                        $set('motorista_id', $asignacion->motorista_id);
                                    }
                                }),
                            Forms\Components\Select::make('motorista_id')
                                ->label('Motorista')
                                ->options(fn () => \App\Models\Motorista::where('activo', true)->pluck('nombre', 'id'))
                                ->searchable()
                                ->required(),
                        ])->columns(2),
                ])
                ->action(function (SolicitudTransporte $record, array $data) {
                    $estadoAnterior = $record->estado;
                    $record->update([
                        'estado' => EstadoSolicitudEnum::PROGRAMADA,
                        'comentario_jefe' => $data['comentario_jefe'],
                        'vehiculo_id' => $data['vehiculo_id'],
                        'motorista_id' => $data['motorista_id'],
                        'decidido_por' => auth()->id(),
                        'decidido_en' => now(),
                    ]);

                    HistorialEstado::create([
                        'entidad_tipo' => 'solicitud_transporte',
                        'entidad_id' => $record->id,
                        'estado_anterior' => $estadoAnterior->value,
                        'estado_nuevo' => EstadoSolicitudEnum::PROGRAMADA->value,
                        'user_id' => auth()->id(),
                        'comentario' => $data['comentario_jefe'],
                    ]);
                })
                ->visible(fn (SolicitudTransporte $record) => 
                    auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                    $record->estado === EstadoSolicitudEnum::PRE_APROBADA
                ),

            // RECHAZAR
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
                ->visible(fn (SolicitudTransporte $record) => 
                    in_array($record->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION, EstadoSolicitudEnum::PRE_APROBADA], true)
                ),
        ])


            ->bulkActions([]); //sin acciones masivas por ahora
    }


    public static function getEloquentQuery(): Builder
    {
    return parent::getEloquentQuery()
        ->with(['solicitante', 'unidad', 'autorizador']);
    }   


    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        //Product OWNER: Solo visualizacion + detalle; no creacion/edicion desde Filament
        return [
            'index' => Pages\ListSolicitudTransportes::route('/'),
             //'create' => Pages\CreateSolicitudTransporte::route('/create'), //comentado
            //'edit' => Pages\EditSolicitudTransporte::route('/{record}/edit'), //comentado
            'view' => Pages\ViewSolicitudTransporte::route('/{record}'),
        ];
    }
}
