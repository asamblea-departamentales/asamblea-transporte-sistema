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
use Filament\Tables\Columns\TextColumn\TextColumnSize;
use Filament\Support\Enums\Alignment;
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
            Tables\Columns\Layout\Stack::make([
                // --- CABECERA: Código y Estado ---
                Tables\Columns\Layout\Split::make([
                    Tables\Columns\TextColumn::make('codigo')
                        ->weight('bold')
                        ->fontFamily('mono')
                        ->size(Tables\Columns\TextColumn\TextColumnSize::Large)
                        ->color('primary')
                        ->searchable(),
                    
                    Tables\Columns\TextColumn::make('estado')
                        ->badge()
                        ->formatStateUsing(fn (EstadoSolicitudEnum $state) => match ($state) {
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
                        ->color(fn (EstadoSolicitudEnum $state) => match ($state) {
                            EstadoSolicitudEnum::PENDIENTE    => 'warning',
                            EstadoSolicitudEnum::EN_REVISION  => 'info',
                            EstadoSolicitudEnum::PRE_APROBADA => 'warning',
                            EstadoSolicitudEnum::APROBADA     => 'success',
                            EstadoSolicitudEnum::RECHAZADA    => 'danger',
                            EstadoSolicitudEnum::EN_EJECUCION => 'primary',
                            EstadoSolicitudEnum::COMPLETADA   => 'success',
                            default                           => 'gray',
                        })
                        ->grow(false),
                ]),

                // --- CUERPO: Información del Vehículo ---
                Tables\Columns\Layout\Stack::make([
                    Tables\Columns\TextColumn::make('vehiculo.placa')
                        ->weight('black')
                        ->size(Tables\Columns\TextColumn\TextColumnSize::Large)
                        ->icon('heroicon-s-truck')
                        ->iconColor('gray')
                        ->description(fn ($record) => 
                            trim("{$record->vehiculo?->marca?->nombre} {$record->vehiculo?->modelo?->nombre}")
                        )
                        ->searchable(),
                ])->space(1),

                // --- DETALLES SECUNDARIOS: Usuario y Fecha ---
                Tables\Columns\Layout\Grid::make(2)
                    ->schema([
                        Tables\Columns\TextColumn::make('solicitante.name')
                            ->label('Solicitante')
                            ->icon('heroicon-m-user')
                            ->color('gray')
                            ->size(Tables\Columns\TextColumn\TextColumnSize::Small)
                            ->limit(20),

                        Tables\Columns\TextColumn::make('fecha_solicitud')
                            ->label('Fecha')
                            ->date('d M, Y')
                            ->icon('heroicon-m-calendar')
                            ->color('gray')
                            ->size(Tables\Columns\TextColumn\TextColumnSize::Small)
                            ->alignment(\Filament\Support\Enums\Alignment::End),
                    ]),

                // --- FOOTER: Galones y Precio Total ---
                Tables\Columns\Layout\Split::make([
                    Tables\Columns\TextColumn::make('cantidad_combustible')
                        ->suffix(' galones')
                        ->weight('medium')
                        ->icon('heroicon-m-funnel')
                        ->color('info'),

                    Tables\Columns\TextColumn::make('valor_total')
                        ->money('USD')
                        ->weight('black')
                        ->size(Tables\Columns\TextColumn\TextColumnSize::Large)
                        ->alignment(\Filament\Support\Enums\Alignment::End)
                        ->color(fn ($record) => match ($record->estado) {
                            EstadoSolicitudEnum::RECHAZADA => 'danger',
                            EstadoSolicitudEnum::APROBADA  => 'success',
                            default                        => 'primary',
                        }),
                ])->extraAttributes([
                    'class' => 'mt-3 pt-3 border-t border-gray-200 dark:border-gray-700'
                ]),

                // --- INDICADOR DE ADJUNTOS ---
                Tables\Columns\IconColumn::make('tiene_adjuntos')
                    ->getStateUsing(fn ($record) => !empty($record->adjuntos))
                    ->boolean()
                    ->trueIcon('heroicon-m-paper-clip')
                    ->falseIcon('')
                    ->trueColor('info')
                    ->label('')
                    ->size(Tables\Columns\IconColumn\IconColumnSize::Small),

            ])->space(3)->extraAttributes([
                'class' => 'p-5 rounded-xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 hover:ring-primary-500 transition'
            ]),
        ])
        ->filters([
            Tables\Filters\SelectFilter::make('estado')
                ->label('Estado')
                ->options(collect(EstadoSolicitudEnum::cases())
                    ->mapWithKeys(fn ($e) => [$e->value => ucfirst(str_replace('_', ' ', $e->value))])
                ),
            Tables\Filters\Filter::make('pendientes')
                ->label('Solo Pendientes')
                ->query(fn (Builder $q) => $q->whereIn('estado', [
                    EstadoSolicitudEnum::PENDIENTE->value,
                    EstadoSolicitudEnum::EN_REVISION->value,
                ])),
            Tables\Filters\SelectFilter::make('vehiculo_id')
                ->label('Vehículo')
                ->relationship('vehiculo', 'placa'),
        ])
        ->actions([
            Tables\Actions\ActionGroup::make([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make()
                    ->visible(fn ($record) => $record->estado === EstadoSolicitudEnum::PENDIENTE),
                
                // --- ACCIÓN: OBSERVACIÓN ---
                Tables\Actions\Action::make('observacion')
                    ->label('Observación')
                    ->icon('heroicon-o-chat-bubble-left-ellipsis')
                    ->modalHeading('Agregar Observación')
                    ->form([
                        Forms\Components\Textarea::make('observaciones')
                            ->label('Comentario Técnico')
                            ->rows(4)
                            ->required(),
                    ])
                    ->action(function (SolicitudCombustible $record, array $data) {
                        $estadoAnterior = $record->estado;
                        $record->observaciones = $data['observaciones'];
                        if ($record->estado === EstadoSolicitudEnum::PENDIENTE) {
                            $record->estado = EstadoSolicitudEnum::EN_REVISION;
                        }
                        $record->save();

                        HistorialEstado::create([
                            'entidad_tipo' => 'solicitud_combustible',
                            'entidad_id' => $record->id,
                            'estado_anterior' => $estadoAnterior?->value,
                            'estado_nuevo' => $record->estado?->value,
                            'user_id' => auth()->id(),
                            'comentario' => $data['observaciones'],
                        ]);
                    })
                    ->visible(fn ($record) => auth()->user()->hasAnyRole(['jefe', 'admin', 'ti'])),

                // --- ACCIÓN: PRE-APROBAR ---
                Tables\Actions\Action::make('pre_aprobar')
                    ->label('Pre-Aprobar')
                    ->color('warning')
                    ->icon('heroicon-o-clock')
                    ->requiresConfirmation()
                    ->action(function (SolicitudCombustible $record) {
                        $estadoAnterior = $record->estado;
                        $record->update(['estado' => EstadoSolicitudEnum::PRE_APROBADA]);

                        HistorialEstado::create([
                            'entidad_tipo' => 'solicitud_combustible',
                            'entidad_id' => $record->id,
                            'estado_anterior' => $estadoAnterior?->value,
                            'estado_nuevo' => $record->estado->value,
                            'user_id' => auth()->id(),
                            'comentario' => 'Solicitud pre-aprobada.',
                        ]);
                    })
                    ->visible(fn ($record) => 
                        auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) && 
                        in_array($record->estado, [EstadoSolicitudEnum::PENDIENTE, EstadoSolicitudEnum::EN_REVISION])
                    ),

                // --- ACCIÓN: APROBAR ---
                Tables\Actions\Action::make('aprobar')
                    ->label('Aprobar Final')
                    ->color('success')
                    ->icon('heroicon-o-check-circle')
                    ->form([
                        Forms\Components\Textarea::make('observaciones')
                            ->label('Notas de aprobación')
                            ->required(),
                    ])
                    ->action(function (SolicitudCombustible $record, array $data) {
                        $estadoAnterior = $record->estado;
                        $record->update([
                            'estado' => EstadoSolicitudEnum::APROBADA,
                            'observaciones' => $data['observaciones'],
                            'aprobador_id' => auth()->id(),
                            'fecha_aprobacion' => now(),
                        ]);

                        HistorialEstado::create([
                            'entidad_tipo' => 'solicitud_combustible',
                            'entidad_id' => $record->id,
                            'estado_anterior' => $estadoAnterior?->value,
                            'estado_nuevo' => EstadoSolicitudEnum::APROBADA->value,
                            'user_id' => auth()->id(),
                            'comentario' => $data['observaciones'],
                        ]);
                    })
                    ->visible(fn ($record) => 
                        auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) && 
                        $record->estado === EstadoSolicitudEnum::PRE_APROBADA
                    ),
                
                Tables\Actions\DeleteAction::make()
                    ->visible(fn ($record) => $record->estado === EstadoSolicitudEnum::PENDIENTE),
            ])
            ->label('Gestionar')
            ->icon('heroicon-m-cog-6-tooth')
            ->button()
            ->color('gray'),
        ])
        ->bulkActions([
            Tables\Actions\BulkActionGroup::make([
                Tables\Actions\DeleteBulkAction::make(),
            ]),
        ]);
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