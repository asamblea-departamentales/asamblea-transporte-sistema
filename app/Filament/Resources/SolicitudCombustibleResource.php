<?php

namespace App\Filament\Resources;

use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum; // si no aplica a combustible, quítalo
use App\Filament\Resources\SolicitudCombustibleResource\Pages;
use App\Models\BitacoraEvento;
use App\Models\HistorialEstado;
use App\Models\SolicitudCombustible;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class SolicitudCombustibleResource extends Resource
{
    protected static ?string $model = SolicitudCombustible::class;

    protected static ?string $navigationGroup = 'Aprobaciones';
    protected static ?string $navigationLabel = 'Solicitudes de Combustible';
    protected static ?string $navigationIcon  = 'heroicon-o-banknotes'; // si te da error, cambia a 'heroicon-o-document-text'
    protected static ?int $navigationSort = 3;

    public static function canViewAny(): bool
    {
        return auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']);
    }

    public static function canCreate(): bool        { return false; }
    public static function canEdit($record): bool   { return false; }
    public static function canDelete($record): bool { return false; }

    public static function form(Form $form): Form
    {
        return $form->schema([

            Forms\Components\Section::make('Resumen')
                ->schema([
                    Forms\Components\Placeholder::make('codigo_ui')
                        ->label('Código')
                        ->content(fn (SolicitudCombustible $record) => $record->codigo ?? '-'),

                    Forms\Components\Placeholder::make('fecha_solicitud_ui')
                        ->label('Fecha de solicitud')
                        ->content(fn (SolicitudCombustible $record) =>
                            optional($record->fecha_solicitud)?->format('d/m/Y') ?? '-'
                        ),

                    Forms\Components\Placeholder::make('periodo_ui')
                        ->label('Periodo')
                        ->content(fn (SolicitudCombustible $record) => $record->periodo ?? '-'),

                    Forms\Components\Placeholder::make('solicitante_ui')
                        ->label('Responsable / Solicitante')
                        ->content(fn (SolicitudCombustible $record) => $record->solicitante?->name ?? '-'),

                    Forms\Components\Placeholder::make('vehiculo_ui')
                        ->label('Vehículo')
                        ->content(fn (SolicitudCombustible $record) =>
                            $record->vehiculo
                                ? "{$record->vehiculo->placa} — {$record->vehiculo->marca?->nombre} {$record->vehiculo->modelo?->nombre}"
                                : '-'
                        ),

                    Forms\Components\Placeholder::make('transporte_ui')
    ->label('Asociado a solicitud de transporte')
    ->content(function (SolicitudCombustible $record) {
        $transporte = $record->solicitudTransporte;

        if (!$transporte) {
            return 'No';
        }

        // Preparamos la información del "globo"
        $info = "📍 Origen: {$transporte->origen}\n" .
                "🏁 Destino: {$transporte->destino}\n" .
                "📝 Motivo: {$transporte->motivo_actividad}";

        // Retornamos un HTML con el atributo tooltip
        return new \Illuminate\Support\HtmlString("
            <span 
                class='cursor-help border-b border-dotted border-primary-500 text-primary-600 font-bold'
                x-tooltip.raw=\"{$info}\"
            >
                Sí: {$transporte->codigo}
            </span>
        ");
    }),

                    Forms\Components\Placeholder::make('estado_ui')
                        ->label('Estado')
                        ->content(fn (SolicitudCombustible $record) =>
                            $record->estado?->value ? strtoupper($record->estado->value) : (string) ($record->estado ?? '-')
                        ),
                ])
                ->columns(['default' => 1, 'sm' => 2, 'xl' => 4])
                ->compact(),

            Forms\Components\Section::make('Detalle de combustible')
                ->schema([
                    Forms\Components\Placeholder::make('cantidad_ui')
                        ->label('Cantidad de combustible')
                        ->content(fn (SolicitudCombustible $record) =>
                            $record->cantidad_combustible !== null ? (string) $record->cantidad_combustible : '-'
                        ),

                    Forms\Components\Placeholder::make('valor_unitario_ui')
                        ->label('Valor unitario')
                        ->content(fn (SolicitudCombustible $record) =>
                            $record->valor_unitario !== null ? '$' . number_format($record->valor_unitario, 2) : '-'
                        ),

                    Forms\Components\Placeholder::make('valor_total_ui')
                        ->label('Valor total')
                        ->content(fn (SolicitudCombustible $record) =>
                            $record->valor_total !== null ? '$' . number_format($record->valor_total, 2) : '-'
                        ),

                    Forms\Components\Placeholder::make('observaciones_ui')
                        ->label('Observaciones')
                        ->content(fn (SolicitudCombustible $record) => $record->observaciones ?? '-')
                        ->columnSpanFull(),
                ])
                ->columns(['default' => 1, 'md' => 3])
                ->collapsible()
                ->collapsed(false)
                ->compact(),

            Forms\Components\Section::make('Adjuntos')
                ->schema([
                    Forms\Components\Placeholder::make('adjuntos_ui')
                        ->label('')
                        ->content(function (SolicitudCombustible $record) {
                            if (empty($record->adjuntos)) {
                                return 'Sin adjuntos registrados.';
                            }
                            $links = collect($record->adjuntos)->map(function ($path) {
                                $url  = asset('storage/' . $path);
                                $name = basename($path);
                                return "<a href='{$url}' target='_blank' class='text-primary-600 underline'>{$name}</a>";
                            })->join('<br>');

                            return new \Illuminate\Support\HtmlString($links);
                        }),
                ])
                ->collapsible()
                ->collapsed()
                ->compact(),

            Forms\Components\Section::make('Decisión / Auditoría')
                ->schema([
                    Forms\Components\Placeholder::make('aprobador_ui')
                        ->label('Aprobado / Rechazado por')
                        ->content(fn (SolicitudCombustible $record) => $record->aprobador?->name ?? '-'),

                    Forms\Components\Placeholder::make('fecha_aprobacion_ui')
                        ->label('Fecha de decisión')
                        ->content(fn (SolicitudCombustible $record) =>
                            optional($record->fecha_aprobacion)?->format('d/m/Y H:i') ?? '-'
                        ),

                    Forms\Components\Placeholder::make('motivo_rechazo_ui')
                        ->label('Motivo de rechazo')
                        ->content(fn (SolicitudCombustible $record) => $record->motivo_rechazo ?? '-')
                        ->columnSpanFull(),
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
                        ->default(function (SolicitudCombustible $record) {
                            return HistorialEstado::query()
                                ->where('entidad_tipo', 'solicitud_combustible')
                                ->where('entidad_id', $record->id)
                                ->orderByDesc('created_at')
                                ->get()
                                ->map(fn ($h) => [
                                    'fecha'      => optional($h->created_at)?->format('d/m/Y H:i') ?? '-',
                                    'de'         => $h->estado_anterior ?? '-',
                                    'a'          => $h->estado_nuevo ?? '-',
                                    'comentario' => $h->comentario ?? null,
                                ])
                                ->toArray();
                        })
                        ->schema([
                            Forms\Components\TextInput::make('fecha')->disabled(),
                            Forms\Components\TextInput::make('de')->label('De')->disabled(),
                            Forms\Components\TextInput::make('a')->label('A')->disabled(),
                            Forms\Components\Textarea::make('comentario')->rows(2)->disabled()->columnSpanFull(),
                        ])
                        ->columns(['default' => 1, 'md' => 3])
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
            ->defaultSort('created_at', 'desc')
            ->contentGrid([
                'default' => 1,
                'md'      => 2,
                'xl'      => 3,
            ])
            ->recordUrl(fn (SolicitudCombustible $record) => static::getUrl('view', ['record' => $record]))
            ->columns([

                Tables\Columns\TextColumn::make('codigo')
                    ->label('Código')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->fontFamily('mono')
                    ->copyable(),

                Tables\Columns\TextColumn::make('vehiculo.placa')
                    ->label('Vehículo')
                    ->description(fn ($record) =>
                        trim("{$record->vehiculo?->marca?->nombre} {$record->vehiculo?->modelo?->nombre}")
                    )
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('fecha_solicitud')
                    ->label('Fecha')
                    ->date('d/m/Y')
                    ->sortable(),

                Tables\Columns\TextColumn::make('valor_total')
                    ->label('Total')
                    ->money('USD')
                    ->sortable(),

                Tables\Columns\TextColumn::make('estado')
                    ->label('Estado')
                    ->badge()
                    ->formatStateUsing(fn (EstadoSolicitudEnum $state): string => match ($state) {
                        EstadoSolicitudEnum::BORRADOR     => 'Borrador',
                        EstadoSolicitudEnum::PENDIENTE    => 'Pendiente',
                        EstadoSolicitudEnum::EN_REVISION  => 'En Revisión',
                        EstadoSolicitudEnum::PRE_APROBADA => 'Pre-Aprobada',
                        EstadoSolicitudEnum::APROBADA     => 'Aprobada',
                        EstadoSolicitudEnum::RECHAZADA    => 'Rechazada',
                        EstadoSolicitudEnum::EN_EJECUCION => 'En Ejecución',
                        EstadoSolicitudEnum::COMPLETADA   => 'Completada',
                        EstadoSolicitudEnum::CANCELADA    => 'Cancelada',
                        default                           => $state->value,
                    })
                    ->color(fn (EstadoSolicitudEnum $state): string => match ($state) {
                        EstadoSolicitudEnum::BORRADOR     => 'gray',
                        EstadoSolicitudEnum::PENDIENTE    => 'warning',
                        EstadoSolicitudEnum::EN_REVISION  => 'info',
                        EstadoSolicitudEnum::PRE_APROBADA => 'warning',
                        EstadoSolicitudEnum::APROBADA     => 'success',
                        EstadoSolicitudEnum::RECHAZADA    => 'danger',
                        EstadoSolicitudEnum::EN_EJECUCION => 'primary',
                        EstadoSolicitudEnum::COMPLETADA   => 'success',
                        EstadoSolicitudEnum::CANCELADA    => 'gray',
                        default                           => 'gray',
                    })
                    ->sortable(),

                Tables\Columns\IconColumn::make('tiene_adjuntos')
                    ->label('Adjuntos')
                    ->boolean()
                    ->getStateUsing(fn ($record) => ! empty($record->adjuntos))
                    ->trueIcon('heroicon-o-paper-clip')
                    ->falseIcon('heroicon-o-minus')
                    ->trueColor('success')
                    ->falseColor('gray'),

                Tables\Columns\TextColumn::make('solicitante.name')
                    ->label('Solicitante')
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->searchable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Creada')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

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
                            Forms\Components\Textarea::make('observaciones')
                                ->label('Observación')
                                ->rows(4)
                                ->required()
                                ->maxLength(2000),
                        ])
                        ->action(function (SolicitudCombustible $record, array $data) {
                            $estadoAnterior = $record->estado;

                            $record->observaciones = $data['observaciones'];

                            if ($record->estado === EstadoSolicitudEnum::PENDIENTE) {
                                $record->estado = EstadoSolicitudEnum::EN_REVISION;
                            }

                            $record->save();

                            if ($estadoAnterior !== $record->estado) {
                                HistorialEstado::create([
                                    'entidad_tipo'    => 'solicitud_combustible',
                                    'entidad_id'      => $record->id,
                                    'estado_anterior' => $estadoAnterior?->value,
                                    'estado_nuevo'    => $record->estado?->value,
                                    'user_id'         => auth()->id(),
                                    'comentario'      => $data['observaciones'],
                                ]);
                            }

                            BitacoraEvento::create([
                                'entidad_tipo' => 'solicitud_combustible',
                                'entidad_id'   => $record->id,
                                'accion'       => AccionBitacoraEnum::OBSERVAR->value,
                                'user_id'      => auth()->id(),
                                'datos_extras' => ['comentario' => $data['observaciones']],
                            ]);
                        })
                        ->visible(fn (SolicitudCombustible $record) =>
                            auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                            in_array($record->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)
                        ),

                    Tables\Actions\Action::make('pre_aprobar')
                        ->label('Pre-Aprobar')
                        ->color('warning')
                        ->icon('heroicon-o-clock')
                        ->requiresConfirmation()
                        ->modalHeading('Pre-aprobar Solicitud de Combustible')
                        ->action(function (SolicitudCombustible $record) {
                            $estadoAnterior = $record->estado;

                            $record->estado = EstadoSolicitudEnum::PRE_APROBADA;
                            $record->save();

                            HistorialEstado::create([
                                'entidad_tipo'    => 'solicitud_combustible',
                                'entidad_id'      => $record->id,
                                'estado_anterior' => $estadoAnterior?->value,
                                'estado_nuevo'    => $record->estado?->value,
                                'user_id'         => auth()->id(),
                                'comentario'      => 'Solicitud pre-aprobada.',
                            ]);

                            BitacoraEvento::create([
                                'entidad_tipo' => 'solicitud_combustible',
                                'entidad_id'   => $record->id,
                                'accion'       => 'PRE_APROBAR',
                                'user_id'      => auth()->id(),
                            ]);
                        })
                        ->visible(fn (SolicitudCombustible $record) =>
                            auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                            in_array($record->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION], true)
                        ),

                    Tables\Actions\Action::make('aprobar')
                        ->label('Aprobar')
                        ->color('success')
                        ->icon('heroicon-o-check-circle')
                        ->modalHeading('Aprobar Solicitud de Combustible')
                        ->form([
                            Forms\Components\Textarea::make('observaciones')
                                ->label('Observaciones de aprobación')
                                ->rows(3)
                                ->required()
                                ->maxLength(2000)
                                ->columnSpanFull(),
                        ])
                        ->action(function (SolicitudCombustible $record, array $data) {
                            $estadoAnterior = $record->estado;

                            $record->update([
                                'estado'           => EstadoSolicitudEnum::APROBADA,
                                'observaciones'    => $data['observaciones'],
                                'aprobador_id'     => auth()->id(),
                                'fecha_aprobacion' => now(),
                            ]);

                            HistorialEstado::create([
                                'entidad_tipo'    => 'solicitud_combustible',
                                'entidad_id'      => $record->id,
                                'estado_anterior' => $estadoAnterior?->value,
                                'estado_nuevo'    => EstadoSolicitudEnum::APROBADA->value,
                                'user_id'         => auth()->id(),
                                'comentario'      => $data['observaciones'],
                            ]);

                            BitacoraEvento::create([
                                'entidad_tipo' => 'solicitud_combustible',
                                'entidad_id'   => $record->id,
                                'accion'       => AccionBitacoraEnum::APROBAR->value,
                                'user_id'      => auth()->id(),
                                'datos_extras' => ['observaciones' => $data['observaciones']],
                            ]);
                        })
                        ->visible(fn (SolicitudCombustible $record) =>
                            auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                            $record->estado === EstadoSolicitudEnum::PRE_APROBADA
                        ),

                    Tables\Actions\Action::make('rechazar')
                        ->label('Rechazar')
                        ->color('danger')
                        ->icon('heroicon-o-x-circle')
                        ->modalHeading('Rechazar Solicitud de Combustible')
                        ->form([
                            Forms\Components\Textarea::make('motivo_rechazo')
                                ->label('Motivo del rechazo')
                                ->rows(3)
                                ->required()
                                ->maxLength(2000),
                        ])
                        ->action(function (SolicitudCombustible $record, array $data) {
                            $estadoAnterior = $record->estado;

                            $record->update([
                                'estado'           => EstadoSolicitudEnum::RECHAZADA,
                                'motivo_rechazo'   => $data['motivo_rechazo'],
                                'aprobador_id'     => auth()->id(),
                                'fecha_aprobacion' => now(),
                            ]);

                            HistorialEstado::create([
                                'entidad_tipo'    => 'solicitud_combustible',
                                'entidad_id'      => $record->id,
                                'estado_anterior' => $estadoAnterior?->value,
                                'estado_nuevo'    => EstadoSolicitudEnum::RECHAZADA->value,
                                'user_id'         => auth()->id(),
                                'comentario'      => $data['motivo_rechazo'],
                            ]);

                            BitacoraEvento::create([
                                'entidad_tipo' => 'solicitud_combustible',
                                'entidad_id'   => $record->id,
                                'accion'       => AccionBitacoraEnum::RECHAZAR->value,
                                'user_id'      => auth()->id(),
                                'datos_extras' => ['motivo' => $data['motivo_rechazo']],
                            ]);
                        })
                        ->visible(fn (SolicitudCombustible $record) =>
                            auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                            in_array($record->estado, [
                                EstadoSolicitudEnum::PENDIENTE,
                                EstadoSolicitudEnum::EN_REVISION,
                                EstadoSolicitudEnum::PRE_APROBADA,
                            ], true)
                        ),

                ])
                ->label('Más')
                ->icon('heroicon-m-ellipsis-vertical'),
            ])
            ->bulkActions([]);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with([
            'vehiculo.marca',
            'vehiculo.modelo',
            'solicitante',
            'aprobador',
            'solicitudTransporte',
        ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSolicitudCombustibles::route('/'),
            'view'  => Pages\ViewSolicitudCombustible::route('/{record}'),
        ];
    }
}