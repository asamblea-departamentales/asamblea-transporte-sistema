<?php
// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA PLANIFICACIÓN DE FLOTA
// -----------------------------------------------------------------------------
// Muestra todos los vehículos activos en tarjetas visuales (como fichas)
// para que el encargado pueda ver rápidamente qué vehículos están
// disponibles, cuáles están en ruta y cuáles tienen viajes asignados.
// También indica el motorista asignado a cada vehículo. Es una
// herramienta de consulta visual para la gestión operativa diaria.

namespace App\Filament\Resources;

use App\Domain\Solicitudes\Enums\EstadoSolicitudEnum;
use App\Filament\Resources\PlanificacionFlotaResource\Pages;
use App\Models\SolicitudTransporte;
use App\Models\Vehiculo;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Override;

class PlanificacionFlotaResource extends Resource
{
    protected static ?string $model = Vehiculo::class;

    protected static ?string $navigationIcon = 'heroicon-o-truck';

    protected static ?string $navigationLabel = 'Planificación de Flota';

    protected static ?string $navigationGroup = 'Gestión Operativa';

    protected static ?int $navigationSort = 2;


    #[Override]
    public static function canViewAny(): bool
    {
        return auth()->hasAnyRole([
            'operativo', 'jefe', 'super_admin', 'admin', 'ti'
        ]);
    }
    

    public static function table(Table $table): Table
    {
        return $table
            ->contentGrid(['md' => 2, 'xl' => 3])
            ->columns([
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

                        // ── Paleta por estado usando ramps del design system ──
                        // green ramp / amber ramp / coral ramp
                        [$accentColor, $badgeBg, $badgeText, $badgeLabel, $borderColor, $dotColor] = match ($estadoOperativo) {
                            'en_ejecucion' => ['#D85A30', '#FAECE7', '#711B0C', 'En ruta',    '#F0997B', '#D85A30'],
                            'programado' => ['#BA7517', '#FAEEDA', '#412402', 'Reservado',  '#FAC775', '#BA7517'],
                            default => ['#3B6D11', '#EAF3DE', '#173404', 'Disponible', '#C0DD97', '#3B6D11'],
                        };

                        // ── Datos ─────────────────────────────────────────
                        $tipo = e($record->tipo?->nombre ?? '—');
                        $marca = e($record->vehMarca?->nombre ?? ($record->marca ?? ''));
                        $modeloNom = e($record->vehModelo?->nombre ?? ($record->modelo ?? ''));
                        $capacidad = $record->capacidad_personas ?? '—';
                        $fotoUrl = $record->fotografia_url;

                        $motorista = $record->asignacionVigenteMotorista?->motorista;
                        $motoristaNom = $motorista ? e($motorista->nombre) : null;
                        $motoristaDui = $motorista ? e($motorista->dui) : null;

                        // ── Foto ──────────────────────────────────────────
                        $fotoHtml = $fotoUrl
                            ? "<img src='{$fotoUrl}' style='width:52px;height:52px;border-radius:10px;object-fit:cover;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.12);flex-shrink:0;'>"
                            : "<div style='width:52px;height:52px;border-radius:10px;background:#f3f4f6;border:1.5px solid #e5e7eb;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;'>🚛</div>";

                        // ── Motorista ─────────────────────────────────────
                        if ($motoristaNom) {
                            $motoristaHtml = "
                                <div style='display:flex;align-items:center;gap:8px;padding:8px 10px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;'>
                                    <div style='width:28px;height:28px;border-radius:50%;background:#0ea5e9;display:flex;align-items:center;justify-content:center;flex-shrink:0;'>
                                        <svg style='width:14px;height:14px;' fill='white' viewBox='0 0 20 20'><path d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'/></svg>
                                    </div>
                                    <div>
                                        <div style='font-size:12px;font-weight:700;color:#0c4a6e;line-height:1.2;'>{$motoristaNom}</div>
                                        ".($motoristaDui ? "<div style='font-size:10px;color:#0369a1;font-family:monospace;'>DUI: {$motoristaDui}</div>" : '').'
                                    </div>
                                </div>';
                        } else {
                            $motoristaHtml = "
                                <div style='display:flex;align-items:center;gap:8px;padding:8px 10px;background:#fafafa;border:1px dashed #d1d5db;border-radius:10px;'>
                                    <div style='width:28px;height:28px;border-radius:50%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;flex-shrink:0;'>
                                        <svg style='width:14px;height:14px;' fill='#9ca3af' viewBox='0 0 20 20'><path d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'/></svg>
                                    </div>
                                    <div style='font-size:12px;color:#9ca3af;'>Sin motorista asignado</div>
                                </div>";
                        }

                        // ── Solicitud activa ──────────────────────────────
                        $solicitudHtml = '';
                        if ($solicitudActiva) {
                            $dest = e($solicitudActiva->destino ?? '—');
                            $orig = e($solicitudActiva->origen ?? '—');
                            $fecha = $solicitudActiva->fecha_salida?->format('d M, H:i') ?? '—';
                            $codigo = e($solicitudActiva->codigo ?? '');

                            [$boxBg, $boxBorder, $labelColor, $boxLabel] = $estadoOperativo === 'en_ejecucion'
                                ? ['#FAECE7', '#F0997B', '#711B0C', 'En viaje ahora']
                                : ['#FAEEDA', '#FAC775', '#412402', 'Viaje asignado'];

                            $solicitudHtml = "
                                <div style='background:{$boxBg};border:1px solid {$boxBorder};border-radius:10px;padding:10px 12px;margin-top:10px;'>
                                    <div style='font-size:9px;text-transform:uppercase;letter-spacing:.08em;font-weight:800;color:{$labelColor};margin-bottom:5px;display:flex;align-items:center;gap:5px;'>
                                        <span style='width:6px;height:6px;border-radius:50%;background:{$labelColor};display:inline-block;'></span>
                                        {$boxLabel}
                                    </div>
                                    <div style='font-family:monospace;font-size:10px;color:#6b7280;margin-bottom:2px;'>{$codigo}</div>
                                    <div style='font-size:12px;font-weight:700;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'>{$orig}</div>
                                    <div style='font-size:11px;color:#6b7280;display:flex;align-items:center;gap:4px;margin-top:2px;'>
                                        <svg style='width:11px;height:11px;flex-shrink:0;' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17 8l4 4m0 0l-4 4m4-4H3'/></svg>
                                        {$dest}
                                    </div>
                                    <div style='font-size:11px;color:#9ca3af;margin-top:3px;'>📅 {$fecha}</div>
                                </div>";
                        }

                        // ── HTML de la card ───────────────────────────────
                        return "
                        <div style='font-family:system-ui,sans-serif;padding:2px;'>

                            <div style='height:3px;background:{$accentColor};border-radius:3px;margin:-12px -12px 14px;opacity:.9;'></div>

                            <div style='display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;'>
                                <div style='flex:1;min-width:0;'>
                                    <div style='display:flex;align-items:center;gap:7px;flex-wrap:wrap;'>
                                        <span style='font-family:monospace;font-size:18px;font-weight:700;color:#111827;letter-spacing:.03em;'>{$state}</span>
                                        <span style='font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;background:{$badgeBg};color:{$badgeText};white-space:nowrap;border:1px solid {$borderColor};display:inline-flex;align-items:center;gap:4px;'>
                                            <span style='width:5px;height:5px;border-radius:50%;background:{$dotColor};'></span>
                                            {$badgeLabel}
                                        </span>
                                    </div>
                                    <div style='font-size:12px;color:#6b7280;margin-top:3px;font-weight:500;'>{$tipo}</div>
                                </div>
                                {$fotoHtml}
                            </div>

                            <div style='display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;padding:10px;background:#f9fafb;border-radius:10px;border:1px solid #f3f4f6;'>
                                <div>
                                    <div style='font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af;font-weight:700;margin-bottom:3px;'>Vehículo</div>
                                    <div style='font-size:12px;font-weight:600;color:#374151;'>{$marca} {$modeloNom}</div>
                                </div>
                                <div>
                                    <div style='font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af;font-weight:700;margin-bottom:3px;'>Capacidad</div>
                                    <div style='font-size:12px;font-weight:600;color:#374151;'>
                                        <svg style='width:12px;height:12px;display:inline;margin-right:3px;vertical-align:middle;' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0'/></svg>
                                        {$capacidad} pers.
                                    </div>
                                </div>
                            </div>

                            {$motoristaHtml}

                            {$solicitudHtml}

                        </div>";
                    })
                    ->searchable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('estado_operativo')
                    ->label('Estado')
                    ->options([
                        'disponible' => 'Disponible',
                        'programado' => 'Reservado',
                        'en_ejecucion' => 'En ruta',
                    ])
                    ->query(function (Builder $query, array $data) {
                        if (blank($data['value'])) {
                            return;
                        }

                        $idsActivos = SolicitudTransporte::whereIn('estado', [
                            EstadoSolicitudEnum::EN_EJECUCION->value,
                            EstadoSolicitudEnum::PROGRAMADA->value,
                            EstadoSolicitudEnum::APROBADA->value,
                        ])->whereNotNull('vehiculo_id')->pluck('vehiculo_id')->unique();

                        $idsEjecucion = SolicitudTransporte::where('estado', EstadoSolicitudEnum::EN_EJECUCION->value)
                            ->whereNotNull('vehiculo_id')->pluck('vehiculo_id')->unique();

                        match ($data['value']) {
                            'disponible' => $query->whereNotIn('id', $idsActivos),
                            'programado' => $query->whereIn('id', $idsActivos)->whereNotIn('id', $idsEjecucion),
                            'en_ejecucion' => $query->whereIn('id', $idsEjecucion),
                            default => null,
                        };
                    }),
            ])
            ->actions([
                Tables\Actions\Action::make('ver_solicitudes')
                    ->label('Solicitudes')
                    ->icon('heroicon-m-list-bullet')
                    ->color('gray')
                    ->size('sm')
                    ->url(fn (Vehiculo $record) => \App\Filament\Resources\SolicitudTransporteResource::getUrl('index', [
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
                'vehMarca',
                'vehModelo',
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
