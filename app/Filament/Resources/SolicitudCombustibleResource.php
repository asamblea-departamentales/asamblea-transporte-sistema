<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA SOLICITUDES DE COMBUSTIBLE
// -----------------------------------------------------------------------------
// Este archivo define la lógica para gestionar las solicitudes de combustible
// dentro del sistema. Aquí se configuran los formularios, las tablas y las acciones
// que los usuarios pueden realizar sobre las solicitudes de combustible.
// Los comentarios están pensados para que cualquier ingeniero, incluso sin
// experiencia en Laravel o Filament, pueda entender cómo se administra este proceso.


namespace App\Filament\Resources;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Services\SolicitudCombustibleService;
use App\Filament\Resources\SolicitudCombustibleResource\Pages;
use App\Models\ContratoCombustible;
use App\Models\SolicitudCombustible;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

// Esta clase representa el "recurso" de Solicitudes de Combustible.
// Un recurso es una pantalla o módulo donde se pueden ver y gestionar solicitudes de combustible.
class SolicitudCombustibleResource extends Resource
{

    // Indica el modelo principal que representa una solicitud de combustible en la base de datos.
    protected static ?string $model = SolicitudCombustible::class;
    // Agrupa este recurso en el menú bajo "Asignaciones".
    protected static ?string $navigationGroup = 'Asignaciones';
    // Nombre que aparece en el menú de navegación.
    protected static ?string $navigationLabel = 'Solicitudes de Combustible';
    // Icono visual para identificar este recurso en el menú.
    protected static ?string $navigationIcon = 'heroicon-o-banknotes';
    // Orden en el que aparece en el menú.
    protected static ?int $navigationSort = 3;


    // Controla quién puede ver la lista de solicitudes de combustible.
    public static function canViewAny(): bool
    {
        return auth()->check() && auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'operativo', 'liquidador', 'super_admin']);
    }


    // En este recurso, no se permite crear solicitudes desde la interfaz.
    public static function canCreate(): bool
    {
        return false;
    }


    // No se permite eliminar solicitudes desde la interfaz.
    public static function canDelete($record): bool
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


    // ------------------------------------------------------------------------- 
    // FORMULARIO PRINCIPAL
    // ------------------------------------------------------------------------- 
    // Aquí se define cómo se ve y se comporta el formulario para ver una solicitud
    // de combustible. Cada campo tiene validaciones y explicaciones.
    public static function form(Form $form): Form
    {
        return $form->schema([
            // Sección de resumen general de la solicitud
            Forms\Components\Section::make('Resumen')
                ->schema([
                    Forms\Components\Placeholder::make('codigo_ui')
                        ->label('Código')
                        ->content(fn (SolicitudCombustible $record) => $record->codigo ?? '-'),

                    Forms\Components\Placeholder::make('fecha_solicitud_ui')
                        ->label('Fecha de solicitud')
                        ->content(fn (SolicitudCombustible $record) => optional($record->fecha_solicitud)?->format('d/m/Y') ?? '-'
                        ),

                    Forms\Components\Placeholder::make('periodo_ui')
                        ->label('Periodo')
                        ->content(fn (SolicitudCombustible $record) => $record->periodo ?? '-'),

                    Forms\Components\Placeholder::make('solicitante_ui')
                        ->label('Responsable / Solicitante')
                        ->content(fn (SolicitudCombustible $record) => $record->solicitante?->name ?? '-'),

                    Forms\Components\Placeholder::make('vehiculo_ui')
                        ->label('Vehículo')
                        ->content(fn (SolicitudCombustible $record) => $record->vehiculo
                                ? "{$record->vehiculo->placa} — {$record->vehMarca?->nombre} {$record->vehiculo->vehModelo?->nombre}"
                                : '-'
                        ),

                    Forms\Components\Placeholder::make('transporte_ui')
                        ->label('Asociado a solicitud de transporte')
                        ->content(function (SolicitudCombustible $record) {
                            $transporte = $record->solicitudTransporte;

                            if (! $transporte) {
                                return 'No';
                            }

                            // FIX #8: Escapar correctamente el contenido del tooltip
                            $info = "📍 Origen: {$transporte->origen} | 🏁 Destino: {$transporte->destino} | 📝 Motivo: {$transporte->motivo_actividad}";
                            $infoEscaped = htmlspecialchars($info, ENT_QUOTES, 'UTF-8');

                            return new \Illuminate\Support\HtmlString("
                                <span
                                    class='cursor-help border-b border-dotted border-primary-500 text-primary-600 font-bold'
                                    x-tooltip.raw=\"{$infoEscaped}\"
                                >
                                    Sí: {$transporte->codigo}
                                </span>
                            ");
                        }),

                    Forms\Components\Placeholder::make('estado_ui')
                        ->label('Estado')
                        ->content(fn (SolicitudCombustible $record) => $record->estado?->value ? strtoupper($record->estado->value) : (string) ($record->estado ?? '-')
                        ),
                ])
                ->columns(['default' => 1, 'sm' => 2, 'xl' => 4])
                ->compact(),

            Forms\Components\Section::make('Detalle de combustible')
                ->schema([
                    Forms\Components\Placeholder::make('cantidad_ui')
                        ->label('Cantidad de combustible')
                        ->content(fn (SolicitudCombustible $record) => $record->cantidad_combustible !== null
                                ? '$'.number_format((float) $record->cantidad_combustible, 2)
                                : '-'
                        ),

                    Forms\Components\Placeholder::make('valor_unitario_ui')
                        ->label('Valor unitario')
                        ->content(fn (SolicitudCombustible $record) => $record->valor_unitario !== null ? '$'.number_format($record->valor_unitario, 2) : '-'
                        ),

                    Forms\Components\Placeholder::make('valor_total_ui')
                        ->label('Valor total')
                        ->content(fn (SolicitudCombustible $record) => $record->valor_total !== null ? '$'.number_format($record->valor_total, 2) : '-'
                        ),

                    Forms\Components\Placeholder::make('numero_vale_ui')
                        ->label('Vale gasolinera')
                        ->content(fn (SolicitudCombustible $record) => $record->numero_vale_ticket ?? '—'),

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
                                $url = asset('storage/'.$path);
                                $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
                                $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

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

            Forms\Components\Section::make('Bitácora / Auditoría completa')
                ->schema([
                    Forms\Components\Placeholder::make('timeline_visual')
                        ->label('Auditoría del proceso')
                        ->content(function (SolicitudCombustible $record) {

                            $items = \App\Helpers\AuditoriaHelper::timeline(
                                'solicitud_combustible',
                                $record->id
                            );

                            if ($items->isEmpty()) {
                                return 'Sin actividad registrada.';
                            }

                            $html = '<div style="border-left: 3px solid #e5e7eb; padding-left: 15px;">';

                            foreach ($items as $item) {

                                $fecha = optional($item['fecha'])->format('d/m/Y H:i');
                                $usuario = $item['usuario'] ?? 'Sistema';
                                $accion = strtoupper($item['accion']);
                                $detalle = is_array($item['detalle'])
                                    ? json_encode($item['detalle'])
                                    : $item['detalle'];

                                // 🎨 Colores por tipo de acción
                                $color = match ($item['accion']) {
                                    'crear' => '#6b7280',
                                    'enviar' => '#3b82f6',
                                    'aprobar' => '#10b981',
                                    'rechazar' => '#ef4444',
                                    'asignar' => '#8b5cf6',
                                    default => '#6b7280',
                                };

                                $html .= "
                <div style='margin-bottom: 20px; position: relative;'>
                    
                    <div style='
                        position: absolute;
                        left: -22px;
                        top: 5px;
                        width: 10px;
                        height: 10px;
                        background: {$color};
                        border-radius: 50%;
                    '></div>

                    <div style='font-size: 12px; color: #6b7280;'>
                        {$fecha} • {$usuario}
                    </div>

                    <div style='font-weight: bold; color: {$color};'>
                        {$accion}
                    </div>

                    <div style='font-size: 13px; margin-top: 3px;'>
                        {$detalle}
                    </div>

                </div>
            ";
                            }

                            $html .= '</div>';

                            return new \Illuminate\Support\HtmlString($html);
                        })
                        ->columnSpanFull(),
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
                        ->content(fn (SolicitudCombustible $record) => optional($record->fecha_aprobacion)?->format('d/m/Y H:i') ?? '-'
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
                    Forms\Components\Placeholder::make('historial_visual')
                        ->label('Historial de estados')
                        ->content(function (SolicitudCombustible $record) {

                            $historial = \App\Models\HistorialEstado::query()
                                ->where('entidad_tipo', 'solicitud_combustible')
                                ->where('entidad_id', $record->id)
                                ->orderBy('created_at') // importante: ascendente para flujo
                                ->get();

                            if ($historial->isEmpty()) {
                                return 'Sin cambios de estado.';
                            }

                            $html = '<div style="border-left: 3px solid #e5e7eb; padding-left: 15px;">';

                            foreach ($historial as $h) {

                                $fecha = optional($h->created_at)->format('d/m/Y H:i');
                                $de = strtoupper($h->estado_anterior ?: 'INICIO');
                                $a = strtoupper($h->estado_nuevo);

                                // 🎨 Colores por estado destino
                                $color = match ($h->estado_nuevo) {
                                    'borrador' => '#6b7280',
                                    'pendiente' => '#f59e0b',
                                    'en_revision' => '#3b82f6',
                                    'pre_aprobada' => '#a855f7',
                                    'aprobada' => '#10b981',
                                    'rechazada' => '#ef4444',
                                    'asignada' => '#6366f1',
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

    public static function table(Table $table): Table
    {
        {
        return $table
            ->defaultSort('prioridad_orden', 'asc')
            ->striped()
            ->recordUrl(fn (SolicitudCombustible $record) => static::getUrl('view', ['record' => $record]))
            ->columns([

                Tables\Columns\TextColumn::make('prioridad_grupo')
                    ->label('Prioridad')
                    ->badge()
                    ->color(fn ($state) => $state?->color() ?? 'gray')
                    ->formatStateUsing(fn ($state) => $state?->label() ?? 'Baja')
                    ->sortable(),
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

                Tables\Columns\TextColumn::make('ticket')
                    ->label('Ticket')
                    ->sortable()
                    ->searchable()
                    ->weight('bold')
                    ->fontFamily('mono')
                    ->copyable(),

                Tables\Columns\TextColumn::make('numero_vale_ticket')
                    ->label('Vale gasolinera')
                    ->sortable()
                    ->searchable()
                    ->fontFamily('mono')
                    ->placeholder('—')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('vehiculo')
                    ->label('Vehículo')
                    ->formatStateUsing(function ($state, $record) {
                        return trim(
                            ($record->vehiculo?->vehMarca?->nombre ?? '').' '.
                            ($record->vehiculo?->vehModelo?->nombre ?? '')
                        ) ?: 'Sin información';
                    })
                    ->description(fn ($record) => 'Placa: '.($record->vehiculo?->placa ?? 'N/A'))
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
                    ->formatStateUsing(fn ($state) => '$'.number_format((float) $state, 2))
                    ->badge()
                    ->color('success')
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
                        EstadoSolicitudEnum::APROBADA => 'success',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('estado')
                    ->badge()
                    ->sortable()
                    ->formatStateUsing(fn (EstadoSolicitudEnum $state) => match ($state) {
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
                    ->color(fn (EstadoSolicitudEnum $state) => match ($state) {
                        EstadoSolicitudEnum::PENDIENTE => 'warning',
                        EstadoSolicitudEnum::EN_REVISION => 'info',
                        EstadoSolicitudEnum::PRE_APROBADA => 'warning',
                        EstadoSolicitudEnum::APROBADA => 'success',
                        EstadoSolicitudEnum::RECHAZADA => 'danger',
                        EstadoSolicitudEnum::EN_EJECUCION => 'primary',
                        EstadoSolicitudEnum::COMPLETADA => 'success',
                        default => 'gray',
                    }),

                Tables\Columns\IconColumn::make('tiene_adjuntos')
                    ->label('Adj.')
                    ->getStateUsing(fn ($record) => ! empty($record->comprobantes))
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

                Tables\Filters\SelectFilter::make('prioridad_grupo')
                    ->label('Nivel de prioridad')
                    ->options([
                        'critica' => 'Crítica',
                        'alta'    => 'Alta',
                        'media'   => 'Media',
                        'baja'    => 'Baja',
                    ]), 

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
                Tables\Actions\ViewAction::make(),

                Tables\Actions\ActionGroup::make([

                    // FIX #7: canEdit() fue eliminado, el ->visible() aquí controla la visibilidad
                    Tables\Actions\EditAction::make()
                        ->visible(fn ($record) => $record->estado === EstadoSolicitudEnum::PENDIENTE
                        ),

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
                            // LLAMADA LIMPIA AL SERVICE
                            app(\App\Domain\Solicitudes\Services\SolicitudCombustibleService::class)
                                ->observar($record, auth()->id(), $data['observaciones']);

                            Notification::make()
                                ->title('Solicitud observada exitosamente')
                                ->success()
                                ->send();
                        })
                        ->visible(fn ($record) => auth()->user()?->hasAnyRole(['jefe', 'admin', 'ti', 'super_admin']) &&
                            in_array($record->estado, [
                                EstadoSolicitudEnum::PENDIENTE,
                                EstadoSolicitudEnum::EN_REVISION,
                            ])
                        ),
                    Tables\Actions\Action::make('pre_aprobar')
                        ->label('Pre-aprobar')
                        ->color('warning')
                        ->icon('heroicon-o-clock')
                        ->requiresConfirmation()
                        ->modalHeading('¿Pre-aprobar solicitud?')
                        ->modalDescription('La solicitud pasará al estado Pre-aprobada para su revisión final.')
                        ->action(function (SolicitudCombustible $record) {
                            // LLAMADA AL SERVICE (Centraliza estado, historial y bitácora)
                            app(\App\Domain\Solicitudes\Services\SolicitudCombustibleService::class)
                                ->preAprobar($record, auth()->id());

                            \Filament\Notifications\Notification::make()
                                ->title('Solicitud pre-aprobada')
                                ->success()
                                ->send();
                        })
                        ->visible(fn ($record) => auth()->user()?->hasAnyRole(['jefe', 'admin', 'ti', 'super_admin']) &&
                            in_array($record->estado, [
                                EstadoSolicitudEnum::PENDIENTE,
                                EstadoSolicitudEnum::EN_REVISION,
                            ])
                        ),
                    Tables\Actions\Action::make('aprobar')
                        ->label('Aprobar final')
                        ->color('success')
                        ->icon('heroicon-o-check-circle')
                        ->modalHeading('Confirmar Aprobación Final')
                        ->modalDescription('Al aprobar, la solicitud quedará lista para la asignación de vales.')
                        ->form([
                            Forms\Components\Textarea::make('observaciones')
                                ->label('Notas de aprobación')
                                ->placeholder('Escriba aquí cualquier nota técnica final...')
                                ->required(),
                        ])
                        ->action(function (SolicitudCombustible $record, array $data) {
                            // Ejecutamos la lógica centralizada del Service
                            app(\App\Domain\Solicitudes\Services\SolicitudCombustibleService::class)
                                ->aprobar($record, auth()->id(), $data['observaciones']);

                            \Filament\Notifications\Notification::make()
                                ->title('Solicitud aprobada con éxito')
                                ->success()
                                ->send();
                        })
                        ->visible(fn ($record) => auth()->user()?->hasAnyRole(['jefe', 'admin', 'ti', 'super_admin']) &&
                            $record->estado === EstadoSolicitudEnum::PRE_APROBADA
                        ),

                    // Action agregada para liquidador
                    Tables\Actions\Action::make('enviar_liquidador')
                        ->label('Enviar a liquidador')
                        ->color('primary')
                        ->icon('heroicon-o-arrow-right')
                        ->requiresConfirmation()
                        ->modalHeading('Enviar a liquidador')
                        ->modalDescription('La solicitud será enviada para proceso de liquidación. Asegúrese de haber cargado los comprobantes.')

                    // 1. VALIDACIÓN PREVIA (UX): Deshabilitar o mostrar tooltip si no hay comprobantes
                        ->disabled(fn (SolicitudCombustible $record) => ! $record->tieneComprobantes())
                        ->tooltip(fn (SolicitudCombustible $record) => ! $record->tieneComprobantes() ? 'Debe cargar comprobantes antes de enviar' : 'Enviar a revisión'
                        )
                        ->action(function (SolicitudCombustible $record, \Filament\Actions\StaticAction $action) {
                            try {
                                app(\App\Domain\Solicitudes\Services\SolicitudCombustibleService::class)
                                    ->enviarALiquidador($record, auth()->id());

                                Notification::make()
                                    ->title('Enviada a liquidador')
                                    ->success()
                                    ->send();

                            } catch (\DomainException $e) {
                                // Captura el error del Service si faltan los comprobantes o el estado es inválido
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
                                EstadoSolicitudEnum::APROBADA,
                                EstadoSolicitudEnum::ASIGNADA,
                                EstadoSolicitudEnum::COMPLETADA,
                            ], true)
                        ),

                    // FIX #2 y #3: ->action() y ->visible() ahora están dentro del Action, antes del cierre del ActionGroup
                    Tables\Actions\Action::make('asignar_cargas')
                        ->label('Asignar Cargas')
                        ->color('primary')
                        ->icon('heroicon-o-ticket')
                        ->modalHeading('Asignar Cargas de Combustible')
                        ->modalWidth('xl')
                        ->form([
                            Forms\Components\Select::make('contrato_id')
                                ->label('Contrato')
                                ->options(
                                    ContratoCombustible::where('activo', true)
                                        ->get()
                                        ->mapWithKeys(fn ($c) => [
                                            $c->id => "{$c->numero_contrato} — {$c->nombre} (Disponible: $".number_format($c->monto_disponible, 2).')',
                                        ])
                                )
                                ->required()
                                ->searchable()
                                ->live()
                                ->afterStateUpdated(fn ($set) => $set('serie_vale_id', null)),

                            Forms\Components\Select::make('serie_vale_id')
                                ->label('Serie de Cargas')
                                ->options(fn ($get) => SerieCarga::where('contrato_id', $get('contrato_id'))
                                    ->where('activo', true)
                                    ->get()
                                    ->mapWithKeys(fn ($s) => [
                                        $s->id => "{$s->nombre} — Val: $".number_format($s->valor, 2).
                                                  " | Correlativo: {$s->correlativo_inicio}-{$s->correlativo_fin}".
                                                  ' | Siguiente: '.($s->correlativo_actual ?: $s->correlativo_inicio),
                                    ])
                                )
                                ->required()
                                ->searchable()
                                ->live()
                                // FIX #5: dehydrated(true) para que el valor se envíe aunque el campo esté disabled
                                ->dehydrated(true)
                                ->disabled(fn ($get) => ! $get('contrato_id'))
                                ->helperText('Primero selecciona un contrato.'),

                            Forms\Components\TextInput::make('cantidad_vales')
                                ->label('Cantidad de Cargas')
                                ->numeric()
                                ->required()
                                ->minValue(1)
                                ->live(debounce: 500)
                                ->helperText(function ($get) {
                                    $serieId = $get('serie_vale_id');
                                    $cantidad = (int) ($get('cantidad_vales') ?? 0);

                                    if (! $serieId || $cantidad <= 0) {
                                        return null;
                                    }

                                    $serie = SerieCarga::find($serieId);
                                    if (! $serie) {
                                        return null;
                                    }

                                    $inicio = $serie->correlativo_actual ?: $serie->correlativo_inicio;
                                    $fin = $inicio + $cantidad - 1;
                                    $monto = $cantidad * (float) $serie->valor;

                                    return "Rango: {$inicio} – {$fin} | Monto total: $".number_format($monto, 2);
                                }),

                            Forms\Components\Placeholder::make('resumen_asignacion')
                                ->label('Resumen')
                                ->content(function ($get) {
                                    $serieId = $get('serie_vale_id');
                                    $cantidad = (int) ($get('cantidad_vales') ?? 0);

                                    if (! $serieId || $cantidad <= 0) {
                                        return new \Illuminate\Support\HtmlString('<span class="text-gray-400 text-sm">Selecciona una serie y cantidad para ver el resumen.</span>');
                                    }

                                    $serie = SerieCarga::find($serieId);
                                    if (! $serie) {
                                        return '-';
                                    }

                                    $inicio = $serie->correlativo_actual ?: $serie->correlativo_inicio;
                                    $fin = $inicio + $cantidad - 1;
                                    $monto = $cantidad * (float) $serie->valor;

                                    $disponibles = $serie->correlativo_fin - $inicio + 1;
                                    $alerta = $fin > $serie->correlativo_fin
                                        ? '<span class="text-red-600 font-bold">⚠ Sin suficientes cargas en esta serie.</span>'
                                        : '<span class="text-green-600">✓ Cargas disponibles suficientes.</span>';

                                    return new \Illuminate\Support\HtmlString("
                                        <div class='text-sm space-y-1'>
                                            <div><span class='font-medium'>Serie:</span> {$serie->nombre}</div>
                                            <div><span class='font-medium'>Valor por carga:</span> \$".number_format($serie->valor, 2)."</div>
                                            <div><span class='font-medium'>Correlativo:</span> {$inicio} → {$fin}</div>
                                            <div><span class='font-medium'>Monto total:</span> <strong>\$".number_format($monto, 2)."</strong></div>
                                            <div><span class='font-medium'>Cargas disponibles en serie:</span> {$disponibles}</div>
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
                                        'contrato_id' => $data['contrato_id'],
                                        'serie_vale_id' => $data['serie_vale_id'],
                                        'cantidad_vales' => $data['cantidad_vales'],
                                    ]
                                );

                                Notification::make()
                                    ->title('Cargas asignadas correctamente')
                                    ->body("Se asignaron {$data['cantidad_vales']} cargas a la solicitud {$record->codigo}.")
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
                        ->visible(fn ($record) => auth()->check() &&
                            auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'super_admin']) &&
                            $record->estado === EstadoSolicitudEnum::APROBADA
                        ),

                    Tables\Actions\DeleteAction::make()
                        ->visible(fn ($record) => $record->estado === EstadoSolicitudEnum::PENDIENTE
                        ),

                ])
                    ->label('Gestionar')
                    ->icon('heroicon-m-cog-6-tooth'),
            ])

            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    // FIX #1: Corregido getEloquentQuery — el return prematuro dejaba todo el filtrado por rol sin ejecutar.
    // Se extrae el query base a una variable, se aplican los filtros y se retorna al final.
    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery()->with([
            'vehiculo.vehMarca',
            'vehiculo.vehModelo',
            'solicitante',
            'aprobador',
            'solicitudTransporte',
        ]);

        $user = auth()->user();

        // 1. Super admin, TI y Admin: Ven TODO.
        if ($user->hasAnyRole(['super_admin', 'ti', 'admin'])) {
            return $query;
        }

        // 2. SOLICITANTE (Tu colega del Frontend)
        // Eliminamos cualquier restricción de estado.
        // Si solo ve "unas cuantas", verifica que el campo 'solicitante_id' en la DB
        // coincida con su ID de usuario actual.
        if ($user->hasRole('solicitante')) {
            return $query->where('solicitante_id', $user->id);
        }

        // 3. OPERATIVO
        if ($user->hasRole('operativo')) {
            return $query->whereIn('estado', [
                EstadoSolicitudEnum::PENDIENTE->value,
                EstadoSolicitudEnum::EN_REVISION->value,
                EstadoSolicitudEnum::PRE_APROBADA->value,
            ]);
        }

        // 4. JEFE
        if ($user->hasRole('jefe')) {
            return $query->whereIn('estado', [
                EstadoSolicitudEnum::PRE_APROBADA->value,
                EstadoSolicitudEnum::APROBADA->value,
                EstadoSolicitudEnum::ASIGNADA->value,
                EstadoSolicitudEnum::COMPLETADA->value,
                EstadoSolicitudEnum::RECHAZADA->value,
            ]);
        }

        // 5. LIQUIDADOR
        if ($user->hasRole('liquidador')) {
            return $query->whereIn('estado', [
                EstadoSolicitudEnum::ASIGNADA->value,
                EstadoSolicitudEnum::COMPLETADA->value,
            ]);
        }

        return $query;
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSolicitudCombustibles::route('/'),
            'view' => Pages\ViewSolicitudCombustible::route('/{record}'),
            'edit' => Pages\EditSolicitudCombustible::route('/{record}/edit'),
        ];
    }
}
