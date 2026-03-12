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
use App\Domain\Solicitudes\Services\SolicitudCombustibleService;
use App\Models\ContratoCombustible;
use App\Models\SerieVale;
use Filament\Notifications\Notification;
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
        $record->cantidad_combustible !== null 
            ? '$' . number_format((float) $record->cantidad_combustible, 2) 
            : '-'
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

           Forms\Components\Section::make('Comprobantes')
    ->schema([
        Forms\Components\Placeholder::make('comprobantes_ui')
            ->label('')
            ->content(function (SolicitudCombustible $record) {
                if (empty($record->comprobantes)) {
                    return 'Sin comprobantes registrados.';
                }

                $images = collect($record->comprobantes)->map(function ($path) {
                    $url = asset('storage/' . $path);
                    $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
                    $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
                    
                    // Si es una imagen, mostramos la miniatura
                    if (in_array($extension, $imageExtensions)) {
                        return "
                            <div style='margin-bottom: 20px; border: 1px solid #e5e7eb; padding: 10px; border-radius: 8px; display: inline-block;'>
                                <img src='{$url}' 
                                     style='max-width: 250px; height: auto; border-radius: 4px;' 
                                     alt='Comprobante'>
                                <br>
                                <a href='{$url}' target='_blank' style='font-size: 0.75rem; color: #0284c7; text-decoration: underline; margin-top: 5px; display: block;'>
                                    Ver imagen completa ({$extension})
                                </a>
                            </div>";
                    }
                    
                    // Si es un PDF u otro archivo, mostramos un icono de documento
                    $icon = ($extension === 'pdf') ? '📄 PDF' : '📁 Archivo';
                    return "
                        <div style='margin-bottom: 20px; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; background: #f9fafb; display: flex; align-items: center; gap: 10px; max-width: 350px;'>
                            <span style='font-size: 1.5rem;'>{$icon}</span>
                            <div>
                                <p style='font-weight: bold; margin: 0; font-size: 0.85rem;'>Documento Adjunto</p>
                                <a href='{$url}' target='_blank' style='font-size: 0.75rem; color: #0284c7; text-decoration: underline;'>
                                    Abrir / Descargar {$extension}
                                </a>
                            </div>
                        </div>";
                })->join('');

                return new \Illuminate\Support\HtmlString("<div style='display: flex; flex-wrap: wrap; gap: 15px;'>{$images}</div>");
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
        ->striped()
        ->recordUrl(fn (SolicitudCombustible $record) => static::getUrl('view', ['record' => $record]))
        ->columns([
            Tables\Columns\TextColumn::make('codigo')
                ->label('Solicitud')
                ->searchable()
                ->sortable()
                ->weight('bold')
                ->fontFamily('mono')
                ->color('primary')
                ->wrap()
                ->description(function ($record) {
                    $placa = $record->vehiculo?->placa ?? 'Sin vehículo';
                    $solicitante = $record->solicitante?->name ?? 'Sin solicitante';
                    $fecha = $record->fecha_solicitud
                        ? \Carbon\Carbon::parse($record->fecha_solicitud)->format('d/m/Y')
                        : 'Sin fecha';

                    return "Vehículo: {$placa} • {$solicitante} • {$fecha}";
                }),

            Tables\Columns\TextColumn::make('vehiculo')
                ->label('Vehículo')
                ->formatStateUsing(function ($state, $record) {
                    return trim(
                        ($record->vehiculo?->marca?->nombre ?? '') . ' ' .
                        ($record->vehiculo?->modelo?->nombre ?? '')
                    ) ?: 'Sin información';
                })
                ->description(fn ($record) => 'Placa: ' . ($record->vehiculo?->placa ?? 'N/A'))
                ->toggleable()
                ->visibleFrom('md'),

            Tables\Columns\TextColumn::make('solicitante.name')
                ->label('Solicitante')
                ->icon('heroicon-m-user')
                ->searchable()
                ->sortable()
                ->limit(30)
                ->toggleable()
                ->visibleFrom('lg'),

            Tables\Columns\TextColumn::make('fecha_solicitud')
                ->label('Fecha')
                ->date('d/m/Y')
                ->sortable()
                ->description(fn ($record) => optional($record->created_at)?->diffForHumans())
                ->toggleable()
                ->visibleFrom('md'),

          Tables\Columns\TextColumn::make('cantidad_combustible')
    ->label('Combustible')
    ->formatStateUsing(fn ($state) => '$' . number_format((float) $state, 2))
    ->badge()
    ->color('success') // Cambié a 'success' (verde) porque suele asociarse mejor a dinero/pagos
    ->sortable()
    ->toggleable()
    ->visibleFrom('sm'),

            Tables\Columns\TextColumn::make('valor_total')
                ->label('Valor')
                ->money('USD')
                ->sortable()
                ->weight('bold')
                ->color(fn ($record) => match ($record->estado) {
                    EstadoSolicitudEnum::RECHAZADA => 'danger',
                    EstadoSolicitudEnum::APROBADA  => 'success',
                    default                        => 'gray',
                }),

            Tables\Columns\TextColumn::make('estado')
                ->badge()
                ->sortable()
                ->formatStateUsing(fn (EstadoSolicitudEnum $state) => match ($state) {
                    EstadoSolicitudEnum::BORRADOR     => 'Borrador',
                    EstadoSolicitudEnum::PENDIENTE    => 'Pendiente',
                    EstadoSolicitudEnum::EN_REVISION  => 'En revisión',
                    EstadoSolicitudEnum::PRE_APROBADA => 'Pre-aprobada',
                    EstadoSolicitudEnum::APROBADA     => 'Aprobada',
                    EstadoSolicitudEnum::RECHAZADA    => 'Rechazada',
                    EstadoSolicitudEnum::EN_EJECUCION => 'En ejecución',
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
                }),

            Tables\Columns\IconColumn::make('tiene_adjuntos')
                ->label('Adj.')
                ->getStateUsing(fn ($record) => ! empty($record->adjuntos))
                ->boolean()
                ->trueIcon('heroicon-m-paper-clip')
                ->falseIcon('heroicon-m-minus')
                ->trueColor('info')
                ->falseColor('gray')
                ->visibleFrom('md'),
        ])
        ->filters([
            Tables\Filters\SelectFilter::make('estado')
                ->label('Estado')
                ->options(
                    collect(EstadoSolicitudEnum::cases())
                        ->mapWithKeys(fn ($e) => [$e->value => ucfirst(str_replace('_', ' ', $e->value))])
                ),

            Tables\Filters\Filter::make('pendientes')
                ->label('Solo pendientes')
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

                Tables\Actions\Action::make('observacion')
                    ->label('Observación')
                    ->icon('heroicon-o-chat-bubble-left-ellipsis')
                    ->modalHeading('Agregar observación')
                    ->form([
                        Forms\Components\Textarea::make('observaciones')
                            ->label('Comentario técnico')
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

                Tables\Actions\Action::make('pre_aprobar')
                    ->label('Pre-aprobar')
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

                Tables\Actions\Action::make('aprobar')
                    ->label('Aprobar final')
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

                Tables\Actions\Action::make('asignar_vales')
                    ->label('Asignar Cupones')
                    ->color('primary')
                    ->icon('heroicon-o-ticket')
                    ->modalHeading('Asignar Cupones de Combustible')
                    ->modalDescription('Selecciona el contrato, la serie y la cantidad de cupones a asignar.')
                    ->modalWidth('xl')
                    ->form([
                        Forms\Components\Select::make('contrato_id')
                            ->label('Contrato')
                            ->options(
                                ContratoCombustible::where('activo', true)
                                    ->get()
                                    ->mapWithKeys(fn ($c) => [
                                        $c->id => "{$c->numero_contrato} — {$c->nombre} (Disponible: $" . number_format($c->monto_disponible, 2) . ")"
                                    ])
                            )
                            ->required()
                            ->searchable()
                            ->live()
                            ->afterStateUpdated(fn ($set) => $set('serie_vale_id', null)),

                        Forms\Components\Select::make('serie_vale_id')
                            ->label('Serie de Vales')
                            ->options(fn ($get) =>
                                SerieVale::where('contrato_id', $get('contrato_id'))
                                    ->where('activo', true)
                                    ->get()
                                    ->mapWithKeys(fn ($s) => [
                                        $s->id => "{$s->nombre} — Val: $" . number_format($s->valor, 2) .
                                                  " | Correlativo: {$s->correlativo_inicio}-{$s->correlativo_fin}" .
                                                  " | Siguiente: " . ($s->correlativo_actual ?: $s->correlativo_inicio)
                                    ])
                            )
                            ->required()
                            ->searchable()
                            ->live()
                            ->disabled(fn ($get) => !$get('contrato_id'))
                            ->helperText('Primero selecciona un contrato.'),

                        Forms\Components\TextInput::make('cantidad_vales')
                            ->label('Cantidad de Vales')
                            ->numeric()
                            ->required()
                            ->minValue(1)
                            ->live(debounce: 500)
                            ->helperText(function ($get) {
                                $serieId = $get('serie_vale_id');
                                $cantidad = (int) ($get('cantidad_vales') ?? 0);

                                if (!$serieId || $cantidad <= 0) return null;

                                $serie = SerieVale::find($serieId);
                                if (!$serie) return null;

                                $inicio = $serie->correlativo_actual ?: $serie->correlativo_inicio;
                                $fin    = $inicio + $cantidad - 1;
                                $monto  = $cantidad * (float) $serie->valor;

                                return "Rango: {$inicio} – {$fin} | Monto total: $" . number_format($monto, 2);
                            }),

                        Forms\Components\Placeholder::make('resumen_asignacion')
                            ->label('Resumen')
                            ->content(function ($get) {
                                $serieId  = $get('serie_vale_id');
                                $cantidad = (int) ($get('cantidad_vales') ?? 0);

                                if (!$serieId || $cantidad <= 0) {
                                    return new \Illuminate\Support\HtmlString('<span class="text-gray-400 text-sm">Selecciona una serie y cantidad para ver el resumen.</span>');
                                }

                                $serie = SerieVale::find($serieId);
                                if (!$serie) return '-';

                                $inicio = $serie->correlativo_actual ?: $serie->correlativo_inicio;
                                $fin    = $inicio + $cantidad - 1;
                                $monto  = $cantidad * (float) $serie->valor;

                                $disponibles = $serie->correlativo_fin - $inicio + 1;
                                $alerta      = $fin > $serie->correlativo_fin
                                    ? '<span class="text-red-600 font-bold">⚠ Sin suficientes vales en esta serie.</span>'
                                    : '<span class="text-green-600">✓ Vales disponibles suficientes.</span>';

                                return new \Illuminate\Support\HtmlString("
                                    <div class='text-sm space-y-1'>
                                        <div><span class='font-medium'>Serie:</span> {$serie->nombre}</div>
                                        <div><span class='font-medium'>Valor por vale:</span> \$" . number_format($serie->valor, 2) . "</div>
                                        <div><span class='font-medium'>Correlativo:</span> {$inicio} → {$fin}</div>
                                        <div><span class='font-medium'>Monto total:</span> <strong>\$" . number_format($monto, 2) . "</strong></div>
                                        <div><span class='font-medium'>Vales disponibles en serie:</span> {$disponibles}</div>
                                        <div>{$alerta}</div>
                                    </div>
                                ");
                            }),
                    ])
                    ->action(function (SolicitudCombustible $record, array $data) {
                        try {
                            app(SolicitudCombustibleService::class)->asignarVales(
                                $record,
                                auth()->id(),
                                [
                                    'contrato_id'   => $data['contrato_id'],
                                    'serie_vale_id' => $data['serie_vale_id'],
                                    'cantidad_vales'=> $data['cantidad_vales'],
                                ]
                            );

                            Notification::make()
                                ->title('Vales asignados correctamente')
                                ->body("Se asignaron {$data['cantidad_vales']} vales a la solicitud {$record->codigo}.")
                                ->success()
                                ->send();

                        } catch (\DomainException $e) {
                            Notification::make()
                                ->title('No se pudo asignar')
                                ->body($e->getMessage())
                                ->danger()
                                ->send();
                        }
                    })
                    ->visible(fn ($record) =>
                        auth()->user()->hasAnyRole(['jefe', 'admin', 'ti']) &&
                        $record->estado === EstadoSolicitudEnum::APROBADA
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