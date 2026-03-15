<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PlanificacionFlotaResource\Pages;
use App\Models\Vehiculo;
use App\Models\SolicitudTransporte;
use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class PlanificacionFlotaResource extends Resource
{
    protected static ?string $model = Vehiculo::class;

    protected static ?string $navigationIcon  = 'heroicon-o-truck';
    protected static ?string $navigationLabel = 'Planificación de Flota';
    protected static ?string $navigationGroup = 'Gestión Operativa';
    protected static ?int    $navigationSort  = 2;

    public static function table(Table $table): Table
    {
        return $table
            ->contentGrid([
                'md' => 2,
                'xl' => 3,
            ])
            ->columns([

                // Columna única que renderiza la card completa
                Tables\Columns\TextColumn::make('placa')
                    ->label('')
                    ->html()
                    ->formatStateUsing(function (string $state, Vehiculo $record): string {

                        // ── Estado operativo ──────────────────────────────
                        $solicitudActiva = SolicitudTransporte::where('vehiculo_id', $record->id)
                            ->whereIn('estado', [
                                EstadoSolicitudEnum::EN_EJECUCION,
                                EstadoSolicitudEnum::PROGRAMADA,
                                EstadoSolicitudEnum::APROBADA,
                            ])
                            ->orderBy('fecha_salida')
                            ->first();

                        $estadoOperativo = 'disponible';
                        if ($solicitudActiva) {
                            $estadoOperativo = $solicitudActiva->estado === EstadoSolicitudEnum::EN_EJECUCION
                                ? 'en_ejecucion'
                                : 'programado';
                        }

                        // ── Próximo viaje ─────────────────────────────────
                        $proximoViaje = SolicitudTransporte::where('vehiculo_id', $record->id)
                            ->whereIn('estado', [
                                EstadoSolicitudEnum::PROGRAMADA,
                                EstadoSolicitudEnum::APROBADA,
                            ])
                            ->orderBy('fecha_salida')
                            ->first();

                        // ── Colores por estado ────────────────────────────
                        [$barColor, $badgeBg, $badgeColor, $badgeText, $badgeIcon] = match ($estadoOperativo) {
                            'en_ejecucion' => ['#ef4444', '#fee2e2', '#991b1b', 'En ejecución', '🚗'],
                            'programado'   => ['#f59e0b', '#fef3c7', '#92400e', 'Programado',   '📅'],
                            default        => ['#22c55e', '#dcfce7', '#166534', 'Disponible',   '✅'],
                        };

                        // ── Motorista ─────────────────────────────────────
                        $motorista = $record->asignacionVigenteMotorista?->motorista;
                        $motoristaNombre = $motorista?->nombre ?? null;

                        $motoristaSección = $motoristaNombre
                            ? "<div style='display:flex;align-items:center;gap:6px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:6px 10px;margin-bottom:10px;font-size:12px;font-weight:600;color:#0369a1;'>
                                <svg xmlns=\"http://www.w3.org/2000/svg\" style=\"width:13px;height:13px;flex-shrink:0;\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z\"/></svg>
                                {$motoristaNombre}
                               </div>"
                            : "<div style='display:flex;align-items:center;gap:6px;background:#f9fafb;border:1px dashed #e5e7eb;border-radius:8px;padding:6px 10px;margin-bottom:10px;font-size:12px;color:#9ca3af;'>
                                <svg xmlns=\"http://www.w3.org/2000/svg\" style=\"width:13px;height:13px;flex-shrink:0;\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z\"/></svg>
                                Sin motorista asignado
                               </div>";

                        // ── Solicitud / próximo viaje ─────────────────────
                        $solicitudSección = '';
                        if ($solicitudActiva) {
                            $origen  = e($solicitudActiva->origen ?? '');
                            $destino = e($solicitudActiva->destino ?? '');
                            $fecha   = $solicitudActiva->fecha_salida?->format('d/m/Y H:i') ?? '—';
                            $codigo  = e($solicitudActiva->codigo ?? '');
                            [$boxBg, $boxBorder, $boxLabelColor, $boxLabel] = $estadoOperativo === 'en_ejecucion'
                                ? ['#fee2e2', '#fca5a5', '#991b1b', '🔴 En viaje ahora']
                                : ['#fef3c7', '#fcd34d', '#92400e', '📋 Viaje asignado'];

                            $solicitudSección = "
                                <div style='background:{$boxBg};border:1px solid {$boxBorder};border-radius:10px;padding:8px 10px;margin-bottom:8px;font-size:11px;'>
                                    <div style='font-size:9px;text-transform:uppercase;letter-spacing:.07em;font-weight:700;color:{$boxLabelColor};margin-bottom:3px;'>{$boxLabel}</div>
                                    <div style='font-family:monospace;font-size:10px;color:#374151;'>{$codigo}</div>
                                    <div style='font-weight:600;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'>{$origen} → {$destino}</div>
                                    <div style='color:#6b7280;margin-top:2px;'>🕐 {$fecha}</div>
                                </div>";
                        } elseif ($proximoViaje) {
                            $destino = e($proximoViaje->destino ?? '');
                            $fecha   = $proximoViaje->fecha_salida?->format('d/m/Y H:i') ?? '—';
                            $codigo  = e($proximoViaje->codigo ?? '');
                            $solicitudSección = "
                                <div style='background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:8px 10px;margin-bottom:8px;font-size:11px;'>
                                    <div style='font-size:9px;text-transform:uppercase;letter-spacing:.07em;font-weight:700;color:#64748b;margin-bottom:3px;'>🗓 Próximo viaje</div>
                                    <div style='font-family:monospace;font-size:10px;color:#374151;'>{$codigo}</div>
                                    <div style='font-weight:600;color:#111827;'>→ {$destino}</div>
                                    <div style='color:#6b7280;margin-top:2px;'>📅 {$fecha}</div>
                                </div>";
                        }

                        // ── Marca / Modelo / Capacidad ────────────────────
                        $marca     = e($record->marca?->nombre ?? ($record->marca ?? ''));
                        $modeloNom = e($record->modelo?->nombre ?? ($record->modelo ?? ''));
                        $tipo      = e($record->tipo?->nombre ?? '—');
                        $capacidad = $record->capacidad_personas ?? '—';
                        $foto      = $record->fotografia_url;

                        $fotoHtml = $foto
                            ? "<img src='{$foto}' style='width:48px;height:48px;border-radius:10px;object-fit:cover;border:1.5px solid #e5e7eb;flex-shrink:0;' alt='Foto'>"
                            : "<div style='width:48px;height:48px;border-radius:10px;background:#f3f4f6;border:1.5px solid #e5e7eb;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;'>🚗</div>";

                        // ── HTML final de la card ─────────────────────────
                        return "
                        <div style='font-family:\"DM Sans\",system-ui,sans-serif;'>

                            {{-- Barra de color superior --}}
                            <div style='height:4px;background:linear-gradient(90deg,{$barColor},{$barColor}99);border-radius:4px 4px 0 0;margin:-12px -12px 12px;'></div>

                            {{-- Header: placa + foto + badge estado --}}
                            <div style='display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;'>
                                <div>
                                    <div style='font-family:monospace;font-size:17px;font-weight:700;color:#111827;letter-spacing:.04em;'>{$state}</div>
                                    <div style='font-size:11px;color:#6b7280;margin-top:2px;'>{$tipo}</div>
                                </div>
                                <div style='display:flex;flex-direction:column;align-items:flex-end;gap:6px;'>
                                    {$fotoHtml}
                                    <span style='font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;background:{$badgeBg};color:{$badgeColor};white-space:nowrap;'>{$badgeIcon} {$badgeText}</span>
                                </div>
                            </div>

                            {{-- Meta: marca/modelo y capacidad --}}
                            <div style='display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;'>
                                <div>
                                    <div style='font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af;font-weight:600;margin-bottom:2px;'>Marca / Modelo</div>
                                    <div style='font-size:12px;font-weight:600;color:#374151;'>{$marca} {$modeloNom}</div>
                                </div>
                                <div>
                                    <div style='font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af;font-weight:600;margin-bottom:2px;'>Capacidad</div>
                                    <div style='font-size:12px;font-weight:600;color:#374151;'>👥 {$capacidad} personas</div>
                                </div>
                            </div>

                            {{-- Motorista --}}
                            {$motoristaSección}

                            {{-- Solicitud activa / próximo viaje --}}
                            {$solicitudSección}

                        </div>";
                    })
                    ->searchable(),

            ])
            ->filters([
                Tables\Filters\SelectFilter::make('estado_operativo')
                    ->label('Estado')
                    ->options([
                        'disponible'   => '✅ Disponible',
                        'programado'   => '📅 Programado',
                        'en_ejecucion' => '🚗 En ejecución',
                    ])
                    ->query(function (Builder $query, array $data) {
                        if (blank($data['value'])) return;

                        $estadosActivos = [
                            EstadoSolicitudEnum::EN_EJECUCION->value,
                            EstadoSolicitudEnum::PROGRAMADA->value,
                            EstadoSolicitudEnum::APROBADA->value,
                        ];

                        $idsConSolicitud = SolicitudTransporte::whereIn('estado', $estadosActivos)
                            ->whereNotNull('vehiculo_id')
                            ->pluck('vehiculo_id')
                            ->unique();

                        $idsEnEjecucion = SolicitudTransporte::where('estado', EstadoSolicitudEnum::EN_EJECUCION->value)
                            ->whereNotNull('vehiculo_id')
                            ->pluck('vehiculo_id')
                            ->unique();

                        match ($data['value']) {
                            'disponible'   => $query->whereNotIn('id', $idsConSolicitud),
                            'programado'   => $query->whereIn('id', $idsConSolicitud)->whereNotIn('id', $idsEnEjecucion),
                            'en_ejecucion' => $query->whereIn('id', $idsEnEjecucion),
                            default        => null,
                        };
                    }),
            ])
            ->actions([
                Tables\Actions\Action::make('ver_solicitudes')
                    ->label('Ver solicitudes')
                    ->icon('heroicon-o-clipboard-document-list')
                    ->color('gray')
                    ->url(fn (Vehiculo $record) =>
                        \App\Filament\Resources\SolicitudTransporteResource::getUrl('index', [
                            'tableFilters[vehiculo_id][value]' => $record->id,
                        ])
                    ),
            ])
            ->defaultSort('placa')
            ->striped(false);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->where('activo', true)
            ->with([
                'tipo',
                'marca',
                'modelo',
                'asignacionVigenteMotorista.motorista',
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPlanificacionFlotas::route('/'),
        ];
    }
}