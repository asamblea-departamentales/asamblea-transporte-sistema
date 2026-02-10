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
                //Formulario de aprobacion
                Forms\Components\Section::make('Informacion de la Solicitud')
                ->schema([
                    Forms\Components\TextInput::make('codigo')
                    ->disabled(),
                    Forms\Components\Select::make('unidad_solicitante_id')
                    ->label('Unidad Solicitante')
                    ->relationship('unidad', 'nombre')
                    ->disabled(),

                    Forms\Components\TextInput::make('solicitante.id')
                    ->label('Solicitante')
                    ->disabled()
                        ->formatStateUsing(fn ($state, SolicitudTransporte $record) => $record->solicitante?->name ?? '-'),

                    Forms\Components\Textarea::make('motivo_actividad')
                    ->disabled()
                    ->columnSpanFull(),

                    //Esta parte habria que hacerla en base al mapa del frontend
                    Forms\Components\TextInput::make('origen')
                    ->disabled(),
                    Forms\Components\TextInput::make('destino')
                    ->disabled(),

                    //Agregado
                    Forms\Components\TextInput::make('destino_adicional')
                     ->label('Destino Adicional')
                     ->disabled() // Lo mantenemos deshabilitado para la vista de revisión
                     ->placeholder('Opcional')
                     ->maxLength(255)
                     // Esta función transforma el valor nulo en el texto que quieres ver
                     ->formatStateUsing(fn ($state) => $state ?? 'Sin destino adicional'),                    //=================================================================

                    Forms\Components\DateTimePicker::make('fecha_salida')
                    ->disabled(),
                    Forms\Components\DateTimePicker::make('fecha_retorno')
                    ->disabled(),

                    Forms\Components\TextInput::make('cantidad_personas')
                    ->numeric()
                    ->disabled(),

                    Forms\Components\Select::make('prioridad')
                 ->disabled()
                 ->options([
                    PrioridadSolicitudEnum::BAJA->value => 'BAJA',
                    PrioridadSolicitudEnum::MEDIA->value => 'MEDIA',
                    PrioridadSolicitudEnum::ALTA->value => 'ALTA',
                  ]),


                    Forms\Components\Select::make('estado')
    ->disabled()
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

                ])
                ->columns(2),

                Forms\Components\Section::make('Decision / Auditoria')
                ->schema([
                    Forms\Components\Textarea::make('comentario_jefe')
                    ->label('Observaciones de Jefatura')
                    ->disabled()
                    ->columnSpanFull(),

                    Forms\Components\TextInput::make('autorizador.name')
                    ->label('Autorizado por: ')
                    ->disabled(),

                    Forms\Components\DateTimePicker::make('decidido_en')
                    ->label('Fecha de Decisión')
                    ->disabled(),
                ])
                ->columns(2),
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

                // Estado configurado correctamente con el Enum
                Tables\Columns\TextColumn::make('estado')
    ->label('Estado')
    ->badge()
    ->formatStateUsing(fn (EstadoSolicitudEnum $state): string => match ($state) {
        EstadoSolicitudEnum::BORRADOR => 'Borrador',
        EstadoSolicitudEnum::PENDIENTE => 'Pendiente',
        EstadoSolicitudEnum::EN_REVISION => 'En revisión',
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
    ->modalHeading('Aprobar Solicitud')
    ->modalSubmitActionLabel('Aprobar y Programar')
    ->form([
        Forms\Components\Textarea::make('comentario_jefe')
            ->label('Motivo de la aprobación')
            ->rows(4)
            ->required()
            ->maxLength(2000),
    ])
    ->action(function (SolicitudTransporte $record, array $data) {
        $estadoAnterior = $record->estado;

        $record->estado = EstadoSolicitudEnum::PROGRAMADA; // ✅ ahora queda PROGRAMADA
        $record->comentario_jefe = $data['comentario_jefe']; // ✅ motivo obligatorio
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
            'accion'       => AccionBitacoraEnum::APROBAR->value,
            'user_id'      => auth()->id(),
            'datos_extra'  => [
                'comentario' => $data['comentario_jefe'],
            ],
        ]);
    })
    ->visible(fn (SolicitudTransporte $record) =>
        in_array($record->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)
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
            in_array($record->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)
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
