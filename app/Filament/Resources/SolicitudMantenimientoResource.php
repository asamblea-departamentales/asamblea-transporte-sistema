<?php

namespace App\Filament\Resources;

// Imports para emails
use App\Mail\NotificacionEventMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Domain\Solicitudes\Enums\PrioridadSolicitudEnum;
use App\Filament\Resources\SolicitudMantenimientoResource\Pages;
use App\Models\SolicitudMantenimiento;
use App\Models\Vehiculo;
use App\Models\HistorialEstado;
use App\Models\BitacoraEvento;
use App\Domain\Solicitudes\Enums\AccionBitacoraEnum;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class SolicitudMantenimientoResource extends Resource
{
    protected static ?string $model           = SolicitudMantenimiento::class;
    protected static ?string $navigationGroup = 'Asignaciones';
    protected static ?string $navigationLabel = 'Solicitudes de Mantenimiento';
    protected static ?string $navigationIcon  = 'heroicon-o-wrench-screwdriver';
    protected static ?string $modelLabel      = 'Solicitud de Mantenimiento';
    protected static ?string $pluralModelLabel = 'Solicitudes de Mantenimiento';
    protected static ?int    $navigationSort  = 2;

    public static function canViewAny(): bool
    {
        return auth()->user()->hasAnyRole(['jefe', 'admin', 'ti', 'solicitante', 'operativo', 'liquidador']);
    }

    public static function canCreate(): bool        { return false; }
    public static function canEdit($record): bool   { return false; }
    public static function canDelete($record): bool { return false; }

    // ── FORM ────────────────────────────────────────────────

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
                    ->content(fn (SolicitudMantenimiento $record) =>
                        $record->vehiculo
                            ? "{$record->vehiculo->placa} — {$record->vehiculo->marca?->nombre} {$record->vehiculo->modelo?->nombre}"
                            : '-'
                    ),

                Forms\Components\Placeholder::make('tipo_mantenimiento_ui')
                    ->label('Tipo de Mantenimiento')
                    ->content(fn (SolicitudMantenimiento $record) => $record->tipoMantenimiento?->nombre ?? '-'),

                Forms\Components\Placeholder::make('tipo_solicitud_ui')
                    ->label('Tipo de Solicitud')
                    ->content(fn (SolicitudMantenimiento $record) => match ($record->tipo_solicitud) {
                        'taller'  => 'Taller',
                        'llantas' => 'Llantas',
                        default   => '-',
                    }),

                Forms\Components\Placeholder::make('prioridad_ui')
                    ->label('Prioridad')
                    ->content(fn (SolicitudMantenimiento $record) =>
                        $record->prioridad?->value ? strtoupper($record->prioridad->value) : '-'
                    ),

                Forms\Components\Placeholder::make('fecha_sugerida_ui')
                    ->label('Fecha Sugerida')
                    ->content(fn (SolicitudMantenimiento $record) =>
                        optional($record->fecha_sugerida)?->format('d/m/Y') ?? '-'
                    ),

                Forms\Components\Placeholder::make('estado_ui')
                    ->label('Estado')
                    ->content(fn (SolicitudMantenimiento $record) =>
                        $record->estado?->value ? strtoupper($record->estado->value) : '-'
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
                    ->content(fn (SolicitudMantenimiento $record) =>
                        $record->costo_estimado ? '$' . number_format($record->costo_estimado, 2) : '-'
                    ),

                Forms\Components\Placeholder::make('costo_real_ui')
                    ->label('Costo Real')
                    ->content(fn (SolicitudMantenimiento $record) =>
                        $record->costo_real ? '$' . number_format($record->costo_real, 2) : 'Pendiente'
                    ),

                Forms\Components\Placeholder::make('fecha_realizada_ui')
                    ->label('Fecha Realizada')
                    ->content(fn (SolicitudMantenimiento $record) =>
                        optional($record->fecha_realizada)?->format('d/m/Y') ?? 'Pendiente'
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
                    ->content(fn (SolicitudMantenimiento $record) => $record->aprobador?->name ?? '-'),

                Forms\Components\Placeholder::make('fecha_aprobacion_ui')
                    ->label('Fecha de Decisión')
                    ->content(fn (SolicitudMantenimiento $record) =>
                        optional($record->fecha_aprobacion)?->format('d/m/Y H:i') ?? '-'
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
                Forms\Components\Repeater::make('historial_ui')
                    ->label('')
                    ->disabled()
                    ->dehydrated(false)
                    ->default(function (SolicitudMantenimiento $record) {
                        return HistorialEstado::query()
                            ->where('entidad_tipo', 'solicitud_mantenimiento')
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
                    $vehiculo = trim(($record->vehiculo?->marca?->nombre ?? '') . ' ' . ($record->vehiculo?->modelo?->nombre ?? ''));
                    $tipo = $record->tipoMantenimiento?->nombre ?? 'Sin tipo';

                    return "Vehículo: {$placa}" .
                        ($vehiculo ? " · {$vehiculo}" : '') .
                        " · {$tipo}";
                }),

            Tables\Columns\TextColumn::make('estado')
                ->label('Estado')
                ->badge()
                ->sortable()
                ->formatStateUsing(fn (EstadoSolicitudEnum $state): string => match ($state) {
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
                }),

            Tables\Columns\TextColumn::make('prioridad')
                ->label('Prioridad')
                ->badge()
                ->sortable()
                ->formatStateUsing(fn (PrioridadSolicitudEnum $state): string => match ($state) {
                    PrioridadSolicitudEnum::ALTA  => 'Alta',
                    PrioridadSolicitudEnum::MEDIA => 'Media',
                    PrioridadSolicitudEnum::BAJA  => 'Baja',
                })
                ->color(fn (PrioridadSolicitudEnum $state): string => match ($state) {
                    PrioridadSolicitudEnum::ALTA  => 'danger',
                    PrioridadSolicitudEnum::MEDIA => 'warning',
                    PrioridadSolicitudEnum::BAJA  => 'success',
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
                    'taller'  => 'warning',
                    'llantas' => 'info',
                    default   => 'gray',
                })
                ->formatStateUsing(fn (string $state): string => match ($state) {
                    'taller'  => 'Taller',
                    'llantas' => 'Llantas',
                    default   => $state,
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
            $url = asset('storage/' . $path);
            $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
            $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

            // Si es imagen, mostramos miniatura circular
            if (in_array($extension, $imageExtensions)) {
                return "<img src='{$url}' style='width: 32px; height: 32px; border-radius: 9999px; display: inline-block; border: 1px solid #d1d5db; object-fit: cover; margin-right: -8px;'>";
            }

            // Si es PDF u otro, un icono pequeño
            $bgColor = ($extension === 'pdf') ? '#fee2e2' : '#f3f4f6';
            $textColor = ($extension === 'pdf') ? '#ef4444' : '#6b7280';
            return "<span style='width: 32px; height: 32px; border-radius: 9999px; display: inline-flex; align-items: center; justify-content: center; background: {$bgColor}; color: {$textColor}; font-size: 10px; font-weight: bold; border: 1px solid #d1d5db; margin-right: -8px;' title='Archivo {$extension}'>".strtoupper($extension)."</span>";
        })->implode('');
    })
    ->description(fn ($record) => count($record->comprobantes ?? []) > 3 ? '+' . (count($record->comprobantes) - 3) . ' más' : '')
    ->visibleFrom('md'),
        ])
        ->filters([
            Tables\Filters\SelectFilter::make('estado')
                ->multiple()
                ->options([
                    EstadoSolicitudEnum::BORRADOR->value     => 'Borrador',
                    EstadoSolicitudEnum::PENDIENTE->value    => 'Pendiente',
                    EstadoSolicitudEnum::EN_REVISION->value  => 'En revisión',
                    EstadoSolicitudEnum::PRE_APROBADA->value => 'Pre-aprobada',
                    EstadoSolicitudEnum::APROBADA->value     => 'Aprobada',
                    EstadoSolicitudEnum::RECHAZADA->value    => 'Rechazada',
                    EstadoSolicitudEnum::EN_EJECUCION->value => 'En ejecución',
                    EstadoSolicitudEnum::COMPLETADA->value   => 'Completada',
                    EstadoSolicitudEnum::CANCELADA->value    => 'Cancelada',
                ]),

            Tables\Filters\SelectFilter::make('prioridad')
                ->options([
                    PrioridadSolicitudEnum::BAJA->value  => 'Baja',
                    PrioridadSolicitudEnum::MEDIA->value => 'Media',
                    PrioridadSolicitudEnum::ALTA->value  => 'Alta',
                ]),

            Tables\Filters\SelectFilter::make('tipo_solicitud')
                ->label('Tipo')
                ->options([
                    'taller'  => 'Taller',
                    'llantas' => 'Llantas',
                ]),
        ])
        ->actions([
            Tables\Actions\ViewAction::make(),

            Tables\Actions\ActionGroup::make([
                // aquí dejas tus acciones tal como las tenés
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
                'vehiculo.marca',
                'vehiculo.modelo',
                'tipoMantenimiento',
                'solicitante',
                'aprobador',
            ]);

           $user = auth()->user();

        //TI y super_admin ven todo
        if ($user->hasAnyRole(['super_admin', 'ti'])){
            return $query;
        }

        //operativo revisa solicitudes
        if ($user->hasAnyRole('operativo')){
            $query->whereIn('estado', [
                EstadoSolicitudEnum::PENDIENTE,
                EstadoSolicitudEnum::EN_REVISION,
            ]);
        }

        //Jefe aprueba y asigna
        if ($user->hasRole('jefe')) {
        $query->whereIn('estado', [
            EstadoSolicitudEnum::PRE_APROBADA,
            EstadoSolicitudEnum::APROBADA,
        ]);
    }

    // Liquidador solo ve finalizadas o asignadas
    if ($user->hasRole('liquidador')) {
        $query->whereIn('estado', [
            EstadoSolicitudEnum::ASIGNADA,
            EstadoSolicitudEnum::COMPLETADA,
        ]);
    }
    }     

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListSolicitudMantenimientos::route('/'),
          //  'create' => Pages\CreateSolicitudMantenimiento::route('/create'),
            'view'   => Pages\ViewSolicitudMantenimiento::route('/{record}'),
        ];
    }
}