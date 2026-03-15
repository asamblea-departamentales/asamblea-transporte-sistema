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
            ->contentGrid(['md' => 2, 'xl' => 3])
            ->columns([
                Tables\Columns\TextColumn::make('placa')
                    ->label('')
                    ->html()
                    ->formatStateUsing(function (string $state, Vehiculo $record): string {
                        
                        // 1. Lógica de Solicitudes (Optimización: Podrías usar relaciones en el modelo para mejorar rendimiento)
                        $solicitudesBase = SolicitudTransporte::where('vehiculo_id', $record->id)
                            ->whereIn('estado', [
                                EstadoSolicitudEnum::EN_EJECUCION,
                                EstadoSolicitudEnum::PROGRAMADA,
                                EstadoSolicitudEnum::APROBADA,
                            ])
                            ->orderBy('fecha_salida');

                        $solicitudActiva = (clone $solicitudesBase)->first();
                        
                        // Determinar estado operativo para el estilo
                        $estadoOperativo = 'disponible';
                        if ($solicitudActiva) {
                            $estadoOperativo = $solicitudActiva->estado === EstadoSolicitudEnum::EN_EJECUCION ? 'en_ejecucion' : 'programado';
                        }

                        // 2. Configuración Visual por Estado
                        [$barColor, $badgeBg, $badgeColor, $badgeText, $icon] = match ($estadoOperativo) {
                            'en_ejecucion' => ['#ef4444', '#fee2e2', '#991b1b', 'EN RUTA', 'heroicon-m-play'],
                            'programado'   => ['#f59e0b', '#fef3c7', '#92400e', 'RESERVADO', 'heroicon-m-calendar'],
                            default        => ['#22c55e', '#dcfce7', '#166534', 'DISPONIBLE', 'heroicon-m-check-circle'],
                        };

                        // 3. Preparación de Datos
                        $motoristaNom = e($record->asignacionVigenteMotorista?->motorista?->nombre ?? 'Sin motorista fijo');
                        $marcaModelo  = e(($record->marca?->nombre ?? $record->marca) . ' ' . ($record->modelo?->nombre ?? $record->modelo));
                        $tipoVehiculo = e($record->tipo?->nombre ?? 'Sin tipo');
                        $fotoUrl      = $record->fotografia_url;

                        // 4. Construcción de Secciones
                        $seccionViaje = "";
                        if ($solicitudActiva) {
                            $dest = e($solicitudActiva->destino);
                            $fecha = $solicitudActiva->fecha_salida?->format('d M, H:i') ?? '—';
                            $labelViaje = $estadoOperativo === 'en_ejecucion' ? 'Viaje Actual' : 'Próximo Viaje';
                            $colorText = $estadoOperativo === 'en_ejecucion' ? '#b91c1c' : '#b45309';
                            
                            $seccionViaje = "
                                <div style='margin-top:12px; padding:10px; border-radius:10px; background:rgba(0,0,0,0.03); border:1px solid rgba(0,0,0,0.05);'>
                                    <div style='font-size:9px; font-weight:800; color:{$colorText}; text-transform:uppercase; margin-bottom:4px;'>● {$labelViaje}</div>
                                    <div style='font-size:12px; font-weight:700; color:#1f2937; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;'>{$dest}</div>
                                    <div style='font-size:11px; color:#6b7280; margin-top:2px;'>📅 {$fecha}</div>
                                </div>";
                        }

                        $htmlFoto = $fotoUrl 
                            ? "<img src='{$fotoUrl}' style='width:52px; height:52px; border-radius:12px; object-fit:cover; box-shadow:0 2px 4px rgba(0,0,0,0.1); border:2px solid white;'>"
                            : "<div style='width:52px; height:52px; border-radius:12px; background:#f3f4f6; display:flex; align-items:center; justify-content:center; font-size:24px; border:2px solid white;'>🚛</div>";

                        // 5. Renderizado Final
                        return "
                        <div style='padding:4px; font-family:sans-serif;'>
                            <div style='height:5px; background:{$barColor}; border-radius:10px; margin-bottom:12px;'></div>
                            
                            <div style='display:flex; justify-content:space-between; align-items:flex-start;'>
                                <div>
                                    <div style='font-size:18px; font-weight:850; color:#111827; letter-spacing:-0.02em;'>{$state}</div>
                                    <div style='font-size:12px; font-weight:500; color:#6b7280;'>{$tipoVehiculo}</div>
                                </div>
                                {$htmlFoto}
                            </div>

                            <div style='margin-top:14px; display:flex; flex-wrap:wrap; gap:6px;'>
                                <span style='background:{$badgeBg}; color:{$badgeColor}; font-size:10px; font-weight:700; padding:3px 10px; border-radius:20px; text-transform:uppercase; letter-spacing:0.03em;'>
                                    {$badgeText}
                                </span>
                                <span style='background:#f3f4f6; color:#4b5563; font-size:10px; font-weight:700; padding:3px 10px; border-radius:20px;'>
                                    👥 {$record->capacidad_personas}
                                </span>
                            </div>

                            <div style='margin-top:14px; border-top:1px solid #f1f5f9; pt-12px'>
                                <div style='margin-top:10px;'>
                                    <p style='font-size:10px; color:#9ca3af; font-weight:600; text-transform:uppercase; margin:0;'>Marca y Modelo</p>
                                    <p style='font-size:13px; color:#374151; font-weight:600; margin:2px 0 0 0;'>{$marcaModelo}</p>
                                </div>

                                <div style='margin-top:10px; display:flex; align-items:center; gap:8px;'>
                                    <div style='width:24px; height:24px; border-radius:50%; background:#e0f2fe; display:flex; align-items:center; justify-content:center; color:#0369a1;'>
                                        <svg style='width:14px; height:14px;' fill='currentColor' viewBox='0 0 20 20'><path d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z'></path></svg>
                                    </div>
                                    <div style='font-size:12px; font-weight:600; color:#4b5563;'>{$motoristaNom}</div>
                                </div>
                            </div>

                            {$seccionViaje}
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

                        $idsActivos = SolicitudTransporte::whereIn('estado', [
                            EstadoSolicitudEnum::EN_EJECUCION->value,
                            EstadoSolicitudEnum::PROGRAMADA->value,
                            EstadoSolicitudEnum::APROBADA->value,
                        ])->whereNotNull('vehiculo_id')->pluck('vehiculo_id')->unique();

                        $idsEjecucion = SolicitudTransporte::where('estado', EstadoSolicitudEnum::EN_EJECUCION->value)
                            ->whereNotNull('vehiculo_id')->pluck('vehiculo_id')->unique();

                        match ($data['value']) {
                            'disponible'   => $query->whereNotIn('id', $idsActivos),
                            'programado'   => $query->whereIn('id', $idsActivos)->whereNotIn('id', $idsEjecucion),
                            'en_ejecucion' => $query->whereIn('id', $idsEjecucion),
                            default        => null,
                        };
                    }),
            ])
            ->actions([
                Tables\Actions\Action::make('ver_solicitudes')
                    ->label('Solicitudes')
                    ->icon('heroicon-m-list-bullet')
                    ->color('gray')
                    ->size('sm')
                    ->url(fn (Vehiculo $record) => 
                        SolicitudTransporteResource::getUrl('index', [
                            'tableFilters[vehiculo_id][value]' => $record->id,
                        ])
                    ),
            ])
            ->defaultSort('placa');
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->where('activo', true)
            ->with(['tipo', 'marca', 'modelo', 'asignacionVigenteMotorista.motorista']);
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListPlanificacionFlotas::route('/')];
    }
}