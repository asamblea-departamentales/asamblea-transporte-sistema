<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA SOLICITUDES DE MANTENIMIENTO
// -----------------------------------------------------------------------------
// Este archivo define la lógica para gestionar las solicitudes de mantenimiento
// de vehículos dentro del sistema. Aquí se configuran los formularios, las tablas
// y las acciones que los usuarios pueden realizar sobre las solicitudes de mantenimiento.
// Los comentarios están pensados para que cualquier ingeniero, incluso sin
// experiencia en Laravel o Filament, pueda entender cómo se administra este proceso.


namespace App\Filament\Resources;

// Imports para emails

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use App\Filament\Resources\SolicitudMantenimientoResource\Pages;
use App\Models\HistorialEstado;
use App\Models\SolicitudMantenimiento;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

// Esta clase representa el "recurso" de Solicitudes de Mantenimiento.
// Un recurso es una pantalla o módulo donde se pueden ver y gestionar solicitudes de mantenimiento.
class SolicitudMantenimientoResource extends Resource
{

    // Indica el modelo principal que representa una solicitud de mantenimiento en la base de datos.
    protected static ?string $model = SolicitudMantenimiento::class;

    // Columna que se muestra como título en la búsqueda global.
    protected static ?string $recordTitleAttribute = 'codigo';

    // Agrupa este recurso en el menú bajo "Procesos".
    protected static ?string $navigationGroup = 'Procesos';
    // Nombre que aparece en el menú de navegación.
    protected static ?string $navigationLabel = 'Solicitudes de Mantenimiento';
    // Icono visual para identificar este recurso en el menú.
    protected static ?string $navigationIcon = 'heroicon-o-wrench-screwdriver';
    // Nombre singular y plural para mostrar en la interfaz.
    protected static ?string $modelLabel = 'Solicitud de Mantenimiento';
    protected static ?string $pluralModelLabel = 'Solicitudes de Mantenimiento';
    // Orden en el que aparece en el menú.
    protected static ?int $navigationSort = 2;


    // Controla quién puede ver la lista de solicitudes de mantenimiento.
    public static function canViewAny(): bool
    {
        return auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'solicitante', 'operativo', 'liquidador', 'super_admin']);
    }


    // En este recurso, no se permite crear, editar ni eliminar solicitudes desde la interfaz.
    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit($record): bool
    {
        return in_array($record->estado->value, [
            EstadoSolicitudEnum::BORRADOR->value,
            EstadoSolicitudEnum::PENDIENTE->value,
        ]);
    }

    public static function canDelete($record): bool
    {
        return false;
    }

    // Columnas por las que se puede buscar desde la barra de búsqueda global.
    public static function getGloballySearchableAttributes(): array
    {
        return ['codigo', 'ticket', 'vehiculo.placa', 'solicitante.name', 'tipoMantenimiento.nombre'];
    }


    // ------------------------------------------------------------------------- 
    // FORMULARIO PRINCIPAL
    // ------------------------------------------------------------------------- 
    // Aquí se define cómo se ve y se comporta el formulario para ver una solicitud
    // de mantenimiento. Cada campo tiene validaciones y explicaciones.

    public static function form(Form $form): Form
    {
        return $form->schema([

            Forms\Components\Section::make('Resumen')
                ->schema([
                    Forms\Components\Placeholder::make('codigo_ui')
                        ->label('Código')
                        ->content(fn (SolicitudMantenimiento $record) => $record->codigo ?? '-'),

                    Forms\Components\Placeholder::make('solicitante_ui')
                        ->label('Solicitante')
                        ->content(fn (SolicitudMantenimiento $record) => $record->solicitante?->name ?? '-'),

                    Forms\Components\Placeholder::make('vehiculo_ui')
                        ->label('Vehículo')
                        ->content(fn (SolicitudMantenimiento $record) => $record->vehiculo
                                ? "{$record->vehiculo->placa} — {$record->vehMarca?->nombre} {$record->vehiculo->vehModelo?->nombre}"
                                : '-'
                        ),

                    Forms\Components\Placeholder::make('tipo_mantenimiento_ui')
                        ->label('Tipo de Mantenimiento')
                        ->content(fn (SolicitudMantenimiento $record) => $record->tipoMantenimiento?->nombre ?? '-'),

                    Forms\Components\Placeholder::make('tipo_solicitud_ui')
                        ->label('Tipo de Solicitud')
                        ->content(fn (SolicitudMantenimiento $record) => match ($record->tipo_solicitud) {
                            'taller' => 'Taller',
                            'llantas' => 'Llantas',
                            default => '-',
                        }),

                    Forms\Components\Placeholder::make('prioridad_ui')
                        ->label('Prioridad')
                        ->content(fn (SolicitudMantenimiento $record) => $record->prioridad?->value ? strtoupper($record->prioridad->value) : '-'
                        ),

                    Forms\Components\Placeholder::make('fecha_sugerida_ui')
                        ->label('Fecha Sugerida')
                        ->content(fn (SolicitudMantenimiento $record) => optional($record->fecha_sugerida)?->format('d/m/Y') ?? '-'
                        ),

                    Forms\Components\Placeholder::make('estado_ui')
                        ->label('Estado')
                        ->content(fn (SolicitudMantenimiento $record) => $record->estado?->value ? strtoupper($record->estado->value) : '-'
                        ),
                ])
                ->columns(['default' => 1, 'sm' => 2, 'xl' => 4])
                ->compact(),

            Forms\Components\Section::make('Detalle del Servicio')
                ->schema([
                    Forms\Components\Placeholder::make('detalle_ui')
                        ->label('')
                        ->content(fn (SolicitudMantenimiento $record) => $record->detalle ?? '-'),
                ])
                ->collapsible()
                ->collapsed(false)
                ->compact(),

            Forms\Components\Section::make('Costos')
                ->schema([
                    Forms\Components\Placeholder::make('costo_estimado_ui')
                        ->label('Costo Estimado')
                        ->content(fn (SolicitudMantenimiento $record) => $record->costo_estimado ? '$'.number_format($record->costo_estimado, 2) : '-'
                        ),

                    Forms\Components\Placeholder::make('costo_real_ui')
                        ->label('Costo Real')
                        ->content(fn (SolicitudMantenimiento $record) => $record->costo_real ? '$'.number_format($record->costo_real, 2) : 'Pendiente'
                        ),

                    Forms\Components\Placeholder::make('fecha_realizada_ui')
                        ->label('Fecha Realizada')
                        ->content(fn (SolicitudMantenimiento $record) => optional($record->fecha_realizada)?->format('d/m/Y') ?? 'Pendiente'
                        ),
                ])
                ->columns(['default' => 1, 'md' => 3])
                ->collapsible()
                ->collapsed()
                ->compact(),

            Forms\Components\Section::make('Adjuntos')
                ->schema([
                    Forms\Components\Placeholder::make('adjuntos_ui')
                        ->label('')
                        ->content(function (SolicitudMantenimiento $record) {
                            if (empty($record->adjuntos)) {
                                return 'Sin adjuntos registrados.';
                            }
                            $links = collect($record->adjuntos)->map(function ($path) {
                                $url = asset('storage/'.$path);
                                $name = basename($path);

                                return "<a href='{$url}' target='_blank' class='text-primary-600 underline'>{$name}</a>";
                            })->join('<br>');

                            return new \Illuminate\Support\HtmlString($links);
                        }),
                ])
                ->collapsible()
                ->collapsed()
                ->compact(),

            Forms\Components\Section::make('Estado de Liquidación')
                ->schema([

                    Forms\Components\Placeholder::make('alerta')
                        ->label('')
                        ->content(function ($record) {

                            if (! $record->tieneAdjuntos()) {
                                return new \Illuminate\Support\HtmlString(
                                    "<div style='color:red;font-weight:bold'>⚠ SIN COMPROBANTES</div>"
                                );
                            }

                            if (! $record->evaluacion) {
                                return new \Illuminate\Support\HtmlString(
                                    "<div style='color:orange;font-weight:bold'>⏳ PENDIENTE DE EVALUACIÓN</div>"
                                );
                            }

                            if (! $record->evaluacion->coincide) {
                                return new \Illuminate\Support\HtmlString(
                                    "<div style='color:red;font-weight:bold'>❌ DISCREPANCIA</div>"
                                );
                            }

                            return new \Illuminate\Support\HtmlString(
                                "<div style='color:green;font-weight:bold'>✔ VALIDADO</div>"
                            );
                        }),

                ])
                ->visible(fn () => auth()->user()->hasRole('liquidador')),

            Forms\Components\Section::make('Comparación de Costos')
                ->schema([

                    Forms\Components\Placeholder::make('estimado')
                        ->label('Costo estimado')
                        ->content(fn ($record) => '$'.number_format($record->costo_estimado, 2)),

                    Forms\Components\Placeholder::make('real')
                        ->label('Costo real')
                        ->content(fn ($record) => '$'.number_format($record->costo_real, 2)),

                    Forms\Components\Placeholder::make('diferencia')
                        ->label('Diferencia')
                        ->content(function ($record) {
                            $diff = $record->costo_real - $record->costo_estimado;

                            $color = $diff > 0 ? 'red' : 'green';

                            return new \Illuminate\Support\HtmlString(
                                "<span style='color:{$color};font-weight:bold'>$".number_format($diff, 2).'</span>'
                            );
                        }),

                ])->columns(3),

            Forms\Components\Section::make('Comprobantes')
                ->schema([
                    Forms\Components\Placeholder::make('files')
                        ->label('')
                        ->content(function ($record) {

                            if (empty($record->adjuntos)) {
                                return 'Sin comprobantes.';
                            }

                            return new \Illuminate\Support\HtmlString(
                                collect($record->adjuntos)->map(function ($path) {

                                    $url = asset('storage/'.$path);
                                    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));

                                    if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
                                        return "<img src='{$url}' style='width:120px;height:120px;object-fit:cover;margin:5px;border-radius:8px;border:1px solid #ccc;'>";
                                    }

                                    return "<a href='{$url}' target='_blank' style='display:block;margin:5px;color:blue'>📄 Ver PDF</a>";
                                })->implode('')
                            );
                        }),
                ]),

            Forms\Components\Section::make('Evaluación del mantenimiento')
                ->schema([

                    Forms\Components\Placeholder::make('evaluacion_estado')
                        ->label('Resultado')
                        ->content(fn ($record) => match ($record->evaluacion_estado) {
                            'conforme' => '✔ Conforme',
                            'observaciones' => '⚠ Con observaciones',
                            'no_conforme' => '❌ No conforme',
                            default => 'Pendiente',
                        }),

                    Forms\Components\Placeholder::make('evaluacion_comentario')
                        ->label('Comentario')
                        ->content(fn ($record) => $record->evaluacion_comentario ?? '—')
                        ->columnSpanFull(),

                    Forms\Components\Placeholder::make('evaluador')
                        ->label('Evaluado por')
                        ->content(fn ($record) => $record->evaluador?->name ?? '—'),

                    Forms\Components\Placeholder::make('fecha_evaluacion')
                        ->label('Fecha')
                        ->content(fn ($record) => optional($record->fecha_evaluacion)?->format('d/m/Y H:i') ?? '—'
                        ),

                ])
                ->visible(fn ($record) => $record->estado === EstadoSolicitudEnum::COMPLETADA)
                ->columns(2)
                ->collapsible(),

            Forms\Components\Section::make('Finalización')
                ->schema([
                    Forms\Components\Placeholder::make('finalizado_por')
                        ->label('Finalizado por')
                        ->content(fn ($record) => $record->finalizador?->name ?? '-'),

                    Forms\Components\Placeholder::make('fecha_finalizacion')
                        ->label('Fecha de finalización')
                        ->content(fn ($record) => optional($record->fecha_finalizacion)?->format('d/m/Y H:i') ?? '-'
                        ),
                ])
                ->visible(fn ($record) => $record->estado === EstadoSolicitudEnum::COMPLETADA),

            Forms\Components\Section::make('Resultado de Evaluación')
                ->schema([

                    Forms\Components\Placeholder::make('resultado')
                        ->label('Resultado')
                        ->content(fn ($record) => $record->evaluacion
                                ? ($record->evaluacion->coincide ? '✔ Correcto' : '❌ Discrepancia')
                                : 'Pendiente'
                        ),

                    Forms\Components\Placeholder::make('evaluador')
                        ->label('Evaluado por')
                        ->content(fn ($record) => $record->evaluacion?->evaluador?->name ?? '-'),

                    Forms\Components\Placeholder::make('obs')
                        ->label('Observaciones')
                        ->content(fn ($record) => $record->evaluacion?->observaciones ?? '-'),

                ])
                ->visible(fn ($record) => $record->evaluacion),

            Forms\Components\Section::make('Decisión / Auditoría')
                ->schema([
                    Forms\Components\Placeholder::make('aprobador_ui')
                        ->label('Aprobado / Rechazado por')
                        ->content(fn (SolicitudMantenimiento $record) => $record->aprobador?->name ?? '-'),

                    Forms\Components\Placeholder::make('fecha_aprobacion_ui')
                        ->label('Fecha de Decisión')
                        ->content(fn (SolicitudMantenimiento $record) => optional($record->fecha_aprobacion)?->format('d/m/Y H:i') ?? '-'
                        ),

                    Forms\Components\Placeholder::make('motivo_rechazo_ui')
                        ->label('Motivo de Rechazo')
                        ->content(fn (SolicitudMantenimiento $record) => $record->motivo_rechazo ?? '-')
                        ->columnSpanFull(),

                    Forms\Components\Placeholder::make('observaciones_ui')
                        ->label('Observaciones')
                        ->content(fn (SolicitudMantenimiento $record) => $record->observaciones ?? '-')
                        ->columnSpanFull(),
                ])
                ->columns(['default' => 1, 'md' => 2])
                ->collapsible()
                ->collapsed()
                ->compact(),

            Forms\Components\Section::make('Historial de estados')
                ->schema([
                    Forms\Components\Placeholder::make('historial_visual')
                        ->label('Historial de estados')
                        ->content(function (SolicitudMantenimiento $record) {

                            $historial = \App\Models\HistorialEstado::query()
                                ->where('entidad_tipo', 'solicitud_mantenimiento')
                                ->where('entidad_id', $record->id)
                                ->orderBy('created_at')
                                ->get();

                            if ($historial->isEmpty()) {
                                return 'Sin cambios de estado.';
                            }

                            $html = '<div style="border-left: 3px solid #e5e7eb; padding-left: 15px;">';

                            foreach ($historial as $h) {
                                $fecha = optional($h->created_at)->format('d/m/Y H:i');
                                $de = strtoupper($h->estado_anterior ?: 'INICIO');
                                $a = strtoupper($h->estado_nuevo);

                                $color = match ($h->estado_nuevo) {
                                    'borrador' => '#6b7280',
                                    'pendiente' => '#f59e0b',
                                    'en_revision' => '#3b82f6',
                                    'pre_aprobada' => '#a855f7',
                                    'aprobada' => '#10b981',
                                    'rechazada' => '#ef4444',
                                    'en_ejecucion' => '#06b6d4',
                                    'completada' => '#059669',
                                    'cancelada' => '#6b7280',
                                    default => '#6b7280',
                                };

                                $comentario = $h->comentario
                                    ? "<div style='font-size: 12px; color: #6b7280;'>💬 {$h->comentario}</div>"
                                    : '';

                                $html .= "
            <div style='margin-bottom: 20px; position: relative;'>

                <div style='
                    position: absolute;
                    left: -22px;
                    top: 6px;
                    width: 10px;
                    height: 10px;
                    background: {$color};
                    border-radius: 50%;
                '></div>

                <div style='font-size: 12px; color: #6b7280;'>
                    {$fecha}
                </div>

                <div style='font-weight: bold; color: {$color};'>
                    {$de} → {$a}
                </div>

                {$comentario}

            </div>
        ";
                            }

                            $html .= '</div>';

                            return new \Illuminate\Support\HtmlString($html);
                        })
                        ->columnSpanFull(),
                ])
                ->collapsible()
                ->collapsed(false)
                ->compact(),
        ]);
    }

    // ── TABLE ───────────────────────────────────────────────

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->striped()
            ->recordUrl(fn (SolicitudMantenimiento $record) => static::getUrl('view', ['record' => $record]))
            ->columns([
                Tables\Columns\TextColumn::make('codigo')
                    ->label('Solicitud')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->fontFamily('mono')
                    ->color('primary')
                    ->copyable()
                    ->wrap()
                    ->description(function (SolicitudMantenimiento $record) {
                        $placa = $record->vehiculo?->placa ?? 'Sin vehículo';
                        $vehiculo = trim(($record->vehiculo?->vehMarca?->nombre ?? '').' '.($record->vehiculo?->vehModelo?->nombre ?? ''));
                        $tipo = $record->tipoMantenimiento?->nombre ?? 'Sin tipo';

                        return "Vehículo: {$placa}".
                            ($vehiculo ? " · {$vehiculo}" : '').
                            " · {$tipo}";
                    }),

                Tables\Columns\TextColumn::make('ticket')
                    ->label('Ticket')
                    ->sortable()
                    ->searchable()
                    ->weight('bold')
                    ->fontFamily('mono')
                    ->copyable(),

                Tables\Columns\TextColumn::make('estado')
                    ->label('Estado')
                    ->badge()
                    ->sortable()
                    ->formatStateUsing(fn (EstadoSolicitudEnum $state): string => match ($state) {
                        EstadoSolicitudEnum::BORRADOR => 'Borrador',
                        EstadoSolicitudEnum::PENDIENTE => 'Pendiente',
                        EstadoSolicitudEnum::EN_REVISION => 'En revisión',
                        EstadoSolicitudEnum::PRE_APROBADA => 'Pre-aprobada',
                        EstadoSolicitudEnum::APROBADA => 'Aprobada',
                        EstadoSolicitudEnum::RECHAZADA => 'Rechazada',
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
                        EstadoSolicitudEnum::EN_EJECUCION => 'primary',
                        EstadoSolicitudEnum::COMPLETADA => 'success',
                        EstadoSolicitudEnum::CANCELADA => 'gray',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('prioridad')
                    ->label('Prioridad')
                    ->badge()
                    ->sortable()
                    ->formatStateUsing(fn (PrioridadSolicitudEnum $state): string => match ($state) {
                        PrioridadSolicitudEnum::ALTA => 'Alta',
                        PrioridadSolicitudEnum::MEDIA => 'Media',
                        PrioridadSolicitudEnum::BAJA => 'Baja',
                    })
                    ->color(fn (PrioridadSolicitudEnum $state): string => match ($state) {
                        PrioridadSolicitudEnum::ALTA => 'danger',
                        PrioridadSolicitudEnum::MEDIA => 'warning',
                        PrioridadSolicitudEnum::BAJA => 'success',
                    }),

                Tables\Columns\TextColumn::make('fecha_sugerida')
                    ->label('Fecha sugerida')
                    ->date('d/m/Y')
                    ->sortable()
                    ->description(fn (SolicitudMantenimiento $record) => optional($record->created_at)?->diffForHumans()),

                Tables\Columns\TextColumn::make('tipoMantenimiento.nombre')
                    ->label('Tipo mantenimiento')
                    ->badge()
                    ->color('info')
                    ->visibleFrom('md'),

                Tables\Columns\TextColumn::make('tipo_solicitud')
                    ->label('Solicitud')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'taller' => 'warning',
                        'llantas' => 'info',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'taller' => 'Taller',
                        'llantas' => 'Llantas',
                        default => $state,
                    })
                    ->visibleFrom('md'),

                Tables\Columns\TextColumn::make('solicitante.name')
                    ->label('Solicitante')
                    ->searchable()
                    ->limit(28)
                    ->visibleFrom('lg'),

                Tables\Columns\TextColumn::make('costo_estimado')
                    ->label('Estimado')
                    ->money('USD')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->visibleFrom('lg'),

                Tables\Columns\TextColumn::make('costo_real')
                    ->label('Costo real')
                    ->money('USD')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->visibleFrom('xl'),

                Tables\Columns\TextColumn::make('comprobantes')
                    ->label('Adjuntos')
                    ->html() // Habilita el renderizado de HTML
                    ->getStateUsing(function ($record) {
                        if (empty($record->comprobantes)) {
                            return '<span class="text-gray-400 text-xs italic">Sin archivos</span>';
                        }

                        return collect($record->comprobantes)->take(3)->map(function ($path) {
                            $url = asset('storage/'.$path);
                            $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
                            $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

                            // Si es imagen, mostramos miniatura circular
                            if (in_array($extension, $imageExtensions)) {
                                return "<img src='{$url}' style='width: 32px; height: 32px; border-radius: 9999px; display: inline-block; border: 1px solid #d1d5db; object-fit: cover; margin-right: -8px;'>";
                            }

                            // Si es PDF u otro, un icono pequeño
                            $bgColor = ($extension === 'pdf') ? '#fee2e2' : '#f3f4f6';
                            $textColor = ($extension === 'pdf') ? '#ef4444' : '#6b7280';

                            return "<span style='width: 32px; height: 32px; border-radius: 9999px; display: inline-flex; align-items: center; justify-content: center; background: {$bgColor}; color: {$textColor}; font-size: 10px; font-weight: bold; border: 1px solid #d1d5db; margin-right: -8px;' title='Archivo {$extension}'>".strtoupper($extension).'</span>';
                        })->implode('');
                    })
                    ->description(fn ($record) => count($record->comprobantes ?? []) > 3 ? '+'.(count($record->comprobantes) - 3).' más' : '')
                    ->visibleFrom('md'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('estado')
                    ->multiple()
                    ->options([
                        EstadoSolicitudEnum::BORRADOR->value => 'Borrador',
                        EstadoSolicitudEnum::PENDIENTE->value => 'Pendiente',
                        EstadoSolicitudEnum::EN_REVISION->value => 'En revisión',
                        EstadoSolicitudEnum::PRE_APROBADA->value => 'Pre-aprobada',
                        EstadoSolicitudEnum::APROBADA->value => 'Aprobada',
                        EstadoSolicitudEnum::RECHAZADA->value => 'Rechazada',
                        EstadoSolicitudEnum::EN_EJECUCION->value => 'En ejecución',
                        EstadoSolicitudEnum::COMPLETADA->value => 'Completada',
                        EstadoSolicitudEnum::CANCELADA->value => 'Cancelada',
                    ]),

                Tables\Filters\SelectFilter::make('prioridad')
                    ->options([
                        PrioridadSolicitudEnum::BAJA->value => 'Baja',
                        PrioridadSolicitudEnum::MEDIA->value => 'Media',
                        PrioridadSolicitudEnum::ALTA->value => 'Alta',
                    ]),

                Tables\Filters\SelectFilter::make('tipo_solicitud')
                    ->label('Tipo')
                    ->options([
                        'taller' => 'Taller',
                        'llantas' => 'Llantas',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),

                Tables\Actions\ActionGroup::make([
                    Tables\Actions\Action::make('orden_trabajo')
                        ->label('Orden de trabajo')
                        ->icon('heroicon-o-document-text')
                        ->color('info')
                        ->url(fn (SolicitudMantenimiento $record) => route('reportes.orden-trabajo.pdf', ['solicitud' => $record->id]))
                        ->openUrlInNewTab()
                        ->visible(fn ($record) => auth()->check() && auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'operativo', 'super_admin']) &&
                            in_array($record->estado->value, [
                                EstadoSolicitudEnum::APROBADA->value,
                                EstadoSolicitudEnum::EN_EJECUCION->value,
                                EstadoSolicitudEnum::COMPLETADA->value,
                            ]) && ! empty($record->vehiculo_id)
                        ),

                    Tables\Actions\Action::make('enviar_liquidador')
                        ->label('Enviar a liquidador')
                        ->color('primary')
                        ->icon('heroicon-o-arrow-right')
                        ->requiresConfirmation()
                        ->modalHeading('Enviar a liquidador')
                        ->modalDescription('La solicitud será enviada para proceso de liquidación. Asegúrese de haber cargado los adjuntos.')
                        ->disabled(fn (SolicitudMantenimiento $record) => ! $record->tieneAdjuntos())
                        ->tooltip(fn (SolicitudMantenimiento $record) => ! $record->tieneAdjuntos()
                            ? 'Debe cargar adjuntos antes de enviar'
                            : 'Enviar a revisión'
                        )
                        ->action(function (SolicitudMantenimiento $record, \Filament\Tables\Actions\Action $action) {
                            try {
                                app(\App\Domain\Solicitudes\Services\SolicitudMantenimientoService::class)
                                    ->enviarALiquidador($record, auth()->id());

                                Notification::make()
                                    ->title('Enviada a liquidador')
                                    ->success()
                                    ->send();
                            } catch (\DomainException $e) {
                                Notification::make()
                                    ->title('Error al enviar')
                                    ->body($e->getMessage())
                                    ->danger()
                                    ->send();

                                $action->halt();
                            }
                        })
                        ->visible(fn ($record) => auth()->user()?->hasAnyRole(['jefe', 'admin', 'ti', 'super_admin']) &&
                            in_array($record->estado, [
                                EstadoSolicitudEnum::COMPLETADA,
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
        return parent::getEloquentQuery()
            ->with([
                'vehiculo.vehMarca',
                'vehiculo.vehModelo',
                'tipoMantenimiento',
                'solicitante',
                'aprobador',
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSolicitudMantenimientos::route('/'),
            //  'create' => Pages\CreateSolicitudMantenimiento::route('/create'),
            'view' => Pages\ViewSolicitudMantenimiento::route('/{record}'),
            'edit' => Pages\EditSolicitudMantenimiento::route('/{record}/edit'),
        ];
    }
}
