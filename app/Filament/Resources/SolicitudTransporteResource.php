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
                        ->label('Retorno')
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
                        ->label('Destino Adicional')
                        ->content(fn (SolicitudTransporte $record) => $record->destino_adicional ?? 'Sin destino adicional'),
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
                Tables\Columns\TextColumn::make('codigo')->searchable()->sortable(),

                Tables\Columns\TextColumn::make('unidad.nombre')
                    ->label('Unidad')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('solicitante.name')
                    ->label('Solicitante')
                    ->searchable()
                    ->sortable(),

                //Prioridad con badge de colores
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
                    ->label('Tipo de Vehículo')
                    ->placeholder('No especificado') //Por si viene vacio
                    ->badge()
                    ->color('gray'),

                // Estado configurado correctamente con el Enum
                Tables\Columns\TextColumn::make('estado')
    ->label('Estado')
    ->badge()
    ->formatStateUsing(fn (EstadoSolicitudEnum $state): string => match ($state) {
        EstadoSolicitudEnum::BORRADOR => 'Borrador',
        EstadoSolicitudEnum::PENDIENTE => 'Pendiente',
        EstadoSolicitudEnum::EN_REVISION => 'En revisión',
        EstadoSolicitudEnum::PRE_APROBADA => 'Pre-aprobada', //Agregado
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
        EstadoSolicitudEnum::PRE_APROBADA => 'warning', //Agregado
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
                    ->label('Salida')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Creada')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
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

    //---------------------------------------------------------------------
    // OBSERVACIÓN (solo comentario; si está PENDIENTE => pasa a EN_REVISION)
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

            // Guardar comentario
            $record->comentario_jefe = $data['comentario_jefe'];

            // Si está PENDIENTE, pasa a EN_REVISION
            if ($record->estado === EstadoSolicitudEnum::PENDIENTE) {
                $record->estado = EstadoSolicitudEnum::EN_REVISION;
            }

            $record->save();

            // HISTORIAL: solo si cambió el estado
            if ($estadoAnterior !== $record->estado) {
                HistorialEstado::create([
                    'entidad_tipo'   => 'solicitud_transporte',
                    'entidad_id'     => $record->id,
                    'estado_anterior'=> $estadoAnterior?->value,
                    'estado_nuevo'   => $record->estado?->value,
                    'user_id'        => auth()->id(),
                    'comentario'     => $data['comentario_jefe'],
                ]);
            }

            // BITÁCORA: registra acción
            BitacoraEvento::create([
                'entidad_tipo' => 'solicitud_transporte',
                'entidad_id'   => $record->id,
                'accion'       => AccionBitacoraEnum::OBSERVAR->value,
                'user_id'      => auth()->id(),
                'datos_extras'  => [
                    'comentario' => $data['comentario_jefe'],
                ],
            ]);
        })
        ->visible(fn (SolicitudTransporte $record) =>
            in_array($record->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)
        ),

        //------------------------------------------------------------------
        Tables\Actions\Action::make('pre_aprobar')
    ->label('Pre-Aprobar')
    ->color('warning')
    ->icon('heroicon-o-clock')
    ->requiresConfirmation()
    ->modalHeading('Pre-aprobar Solicitud')
    ->modalDescription('¿Desea marcar esta solicitud como pre-aprobada? Esto notificará que la revisión inicial es correcta.')
    ->action(function (SolicitudTransporte $record) {
        $estadoAnterior = $record->estado;

        // Cambiamos el estado
        $record->estado = EstadoSolicitudEnum::PRE_APROBADA;
        $record->save();

        // Registramos en el historial
        HistorialEstado::create([
            'entidad_tipo'   => 'solicitud_transporte',
            'entidad_id'     => $record->id,
            'estado_anterior'=> $estadoAnterior?->value,
            'estado_nuevo'   => $record->estado?->value,
            'user_id'        => auth()->id(),
            'comentario'     => 'Solicitud pre-aprobada en revisión inicial.',
        ]);

        // Registramos en bitácora
        BitacoraEvento::create([
            'entidad_tipo' => 'solicitud_transporte',
            'entidad_id'   => $record->id,
            'accion'       => 'PRE_APROBAR', // Asegúrate de tener este caso en tu Enum de acciones
            'user_id'      => auth()->id(),
        ]);
    })
    // DENTRO DE Tables\Actions\Action::make('pre_aprobar')
->visible(fn (SolicitudTransporte $record) => 
    auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
    in_array($record->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)
),

    //---------------------------------------------------------------------
    // APROBAR
    Tables\Actions\Action::make('aprobar')
    ->label('Aprobar')
    ->color('success')
    ->icon('heroicon-o-check-circle')
    ->modalHeading('Aprobar y Asignar Vehiculo')
    ->modalSubmitActionLabel('Aprobar y Programar')
    ->form([
        Forms\Components\Textarea::make('comentario_jefe')
            ->label('Motivo de la aprobación')
            ->rows(4)
            ->required()
            ->maxLength(2000),

        Forms\Components\Section::make('Asignación de Vehículo y Motorista')
            ->schema([
                Forms\Components\Select::make('vehiculo_id')
                    ->label('Vehículo')
                    ->options(function () {
                        return \App\Models\Vehiculo::where('activo', true)
                            ->with('tipo')
                            ->get()
                            ->mapWithKeys(fn ($v) => [
                                $v->id => "{$v->placa} - {$v->tipo->nombre} ({$v->capacidad_personas} personas)"
                            ]);
                    })
                    ->searchable()
                    ->required()
                    ->reactive()
                    ->afterStateUpdated(function ($state, callable $set) {
                        // Auto-seleccionar motorista asignado al vehículo
                        $vehiculo = \App\Models\Vehiculo::find($state);
                        $asignacion = $vehiculo?->asignacionVigenteMotorista;
                        if ($asignacion) {
                            $set('motorista_id', $asignacion->motorista_id);
                        }
                    })
                    ->helperText('Selecciona el vehículo a asignar'),
                
                Forms\Components\Select::make('motorista_id')
                    ->label('Motorista')
                    ->options(function () {
                        return \App\Models\Motorista::where('activo', true)
                            ->get()
                            ->mapWithKeys(fn ($m) => [
                                $m->id => "{$m->nombre} - {$m->dui}"
                            ]);
                    })
                    ->searchable()
                    ->required()
                    ->helperText('Motorista asignado (se auto-completa según el vehículo)'),
            ])
            ->columns(2),
    ])    
    ->action(function (SolicitudTransporte $record, array $data) {
        $estadoAnterior = $record->estado;

        $record->estado = EstadoSolicitudEnum::PROGRAMADA; //  ahora queda PROGRAMADA
        $record->comentario_jefe = $data['comentario_jefe']; //  motivo obligatorio
        $record->decidido_por = auth()->id();
        $record->decidido_en = now();
        $record->vehiculo_id = $data['vehiculo_id']; // asignación de vehículo
        $record->motorista_id = $data['motorista_id']; // asignación de
        $record->save();

        // HISTORIAL
        HistorialEstado::create([
            'entidad_tipo'   => 'solicitud_transporte',
            'entidad_id'     => $record->id,
            'estado_anterior'=> $estadoAnterior?->value,
            'estado_nuevo'   => $record->estado?->value,
            'user_id'        => auth()->id(),
            'comentario'     => $data['comentario_jefe'],
        ]);

        // BITÁCORA
        BitacoraEvento::create([
            'entidad_tipo' => 'solicitud_transporte',
            'entidad_id'   => $record->id,
            'accion'       => AccionBitacoraEnum::APROBAR->value,
            'user_id'      => auth()->id(),
            'datos_extra'  => [
                'comentario' => $data['comentario_jefe'],
                'vehiculo_id' => $data['vehiculo_id'],
                'motorista_id' => $data['motorista_id'],
            ],
        ]);
    })
    ->visible(fn (SolicitudTransporte $record) =>
    auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
    $record->estado === EstadoSolicitudEnum::PRE_APROBADA
),


    //---------------------------------------------------------------------
    // RECHAZAR
    Tables\Actions\Action::make('rechazar')
        ->label('Rechazar')
        ->color('danger')
        ->icon('heroicon-o-x-circle')
        ->modalHeading('Rechazar Solicitud')
        ->modalSubmitActionLabel('Rechazar Solicitud')
        ->form([
            Forms\Components\Textarea::make('comentario_jefe')
                ->label('Motivo del rechazo')
                ->rows(4)
                ->required()
                ->maxLength(2000),
        ])
        ->action(function (SolicitudTransporte $record, array $data) {
            $estadoAnterior = $record->estado;

            $record->estado = EstadoSolicitudEnum::RECHAZADA;
            $record->comentario_jefe = $data['comentario_jefe'];
            $record->decidido_por = auth()->id();
            $record->decidido_en = now();
            $record->save();

            // HISTORIAL
            HistorialEstado::create([
                'entidad_tipo'   => 'solicitud_transporte',
                'entidad_id'     => $record->id,
                'estado_anterior'=> $estadoAnterior?->value,
                'estado_nuevo'   => $record->estado?->value,
                'user_id'        => auth()->id(),
                'comentario'     => $data['comentario_jefe'],
            ]);

            // BITÁCORA
            BitacoraEvento::create([
                'entidad_tipo' => 'solicitud_transporte',
                'entidad_id'   => $record->id,
                'accion'       => AccionBitacoraEnum::RECHAZAR->value,
                'user_id'      => auth()->id(),
                'datos_extras'  => [
                    'comentario' => $data['comentario_jefe'],
                ],
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
