<?php

namespace App\Filament\Resources\MotoristaResource\Pages;

use App\Filament\Resources\MotoristaResource;
use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;
use Filament\Resources\Pages\ViewRecord;

class ViewMotorista extends ViewRecord
{
    protected static string $resource = MotoristaResource::class;

    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([

            Section::make('Información Personal')
                ->icon('heroicon-o-user-circle')
                ->schema([
                    TextEntry::make('nombre')
                        ->label('Nombre Completo')
                        ->weight('bold')
                        ->size(TextEntry\TextEntrySize::Large)
                        ->icon('heroicon-o-user')
                        ->columnSpanFull(),

                    TextEntry::make('numero_empleado')
                        ->label('N° Empleado')
                        ->icon('heroicon-o-hashtag')
                        ->placeholder('—'),

                    TextEntry::make('dui')
                        ->label('DUI')
                        ->icon('heroicon-o-identification')
                        ->copyable()
                        ->copyMessage('DUI copiado')
                        ->fontFamily('mono'),

                    TextEntry::make('telefono')
                        ->label('Teléfono')
                        ->icon('heroicon-o-phone')
                        ->placeholder('Sin teléfono registrado'),

                    TextEntry::make('correo')
                        ->label('Correo')
                        ->icon('heroicon-o-envelope')
                        ->placeholder('Sin correo registrado'),

                    TextEntry::make('radio')
                        ->label('Radio / Nextel')
                        ->icon('heroicon-o-signal')
                        ->placeholder('—'),

                    IconEntry::make('activo')
                        ->label('Estado')
                        ->boolean()
                        ->trueIcon('heroicon-o-check-circle')
                        ->falseIcon('heroicon-o-x-circle')
                        ->trueColor('success')
                        ->falseColor('danger'),
                ])
                ->columns(3)
                ->compact(),

            Section::make('Licencia de Conducir')
                ->icon('heroicon-o-identification')
                ->schema([
                    TextEntry::make('tipoLicencia.nombre')
                        ->label('Tipo de Licencia')
                        ->badge()
                        ->color('warning'),

                    TextEntry::make('numero_licencia')
                        ->label('Número de Licencia')
                        ->icon('heroicon-o-document-text')
                        ->fontFamily('mono')
                        ->placeholder('—'),

                    TextEntry::make('fecha_vencimiento_licencia')
                        ->label('Vence')
                        ->date('d/m/Y')
                        ->icon('heroicon-o-calendar')
                        ->placeholder('—'),
                ])
                ->columns(3)
                ->compact()
                ->collapsible(),

            Section::make('Vehículo Asignado')
                ->icon('heroicon-o-truck')
                ->schema([
                    TextEntry::make('asignacionVigenteVehiculo.vehiculo.placa')
                        ->label('Placa')
                        ->placeholder('Sin vehículo asignado')
                        ->badge()
                        ->color('info'),

                    TextEntry::make('asignacionVigenteVehiculo.vehiculo.tipo.nombre')
                        ->label('Tipo')
                        ->placeholder('—'),

                    TextEntry::make('asignacionVigenteVehiculo.vehiculo.marca.nombre')
                        ->label('Marca')
                        ->placeholder('—'),

                    TextEntry::make('asignacionVigenteVehiculo.vehiculo.modelo.nombre')
                        ->label('Modelo')
                        ->placeholder('—'),

                    TextEntry::make('asignacionVigenteVehiculo.desde')
                        ->label('Asignado desde')
                        ->dateTime('d/m/Y H:i')
                        ->icon('heroicon-o-calendar')
                        ->placeholder('—'),
                ])
                ->columns(3)
                ->collapsible()
                ->compact(),

            Section::make('Estado Actual')
                ->icon('heroicon-o-signal')
                ->schema([
                    TextEntry::make('estadoActual.activo')
                        ->label('Disponibilidad')
                        ->badge()
                        ->formatStateUsing(fn ($state) => $state ? 'Disponible' : 'No disponible')
                        ->color(fn ($state) => $state ? 'success' : 'danger'),

                    TextEntry::make('estadoActual.motivo')
                        ->label('Motivo')
                        ->placeholder('Sin motivo'),

                    TextEntry::make('estadoActual.fecha_inicio')
                        ->label('Desde')
                        ->dateTime('d/m/Y H:i')
                        ->icon('heroicon-o-clock'),

                    TextEntry::make('estadoActual.archivo')
                        ->label('Evidencia')
                        ->formatStateUsing(function ($state) {
                            if (empty($state)) {
                                return '<span style="color:#9ca3af;font-style:italic;">Sin evidencia adjunta</span>';
                            }

                            $url = asset('storage/' . $state);
                            $ext = strtolower(pathinfo($state, PATHINFO_EXTENSION));

                            if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                                return "<a href='{$url}' target='_blank'>
                                    <img src='{$url}' style='max-width:220px;max-height:160px;border-radius:10px;border:2px solid #e5e7eb;box-shadow:0 2px 8px rgba(0,0,0,.08);transition:transform .2s;' 
                                         onmouseover=\"this.style.transform='scale(1.03)'\" onmouseout=\"this.style.transform='scale(1)'\">
                                </a>";
                            }

                            return "<a href='{$url}' target='_blank' 
                                style='display:inline-flex;align-items:center;gap:6px;padding:8px 16px;
                                       background:#fef2f2;color:#dc2626;border:1px solid #fecaca;
                                       border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;'>
                                🗂️ Ver documento PDF
                            </a>";
                        })
                        ->html(),
                ])
                ->columns(2)
                ->compact(),

            Section::make('Historial de Estados')
                ->icon('heroicon-o-clock')
                ->schema([
                    TextEntry::make('estados')
                        ->label('')
                        ->formatStateUsing(function ($state, $record) {
                            if (!$record->estados || $record->estados->isEmpty()) {
                                return '<span style="color:#9ca3af;font-style:italic;">Sin historial de estados registrado.</span>';
                            }

                            return $record->estados->sortByDesc('fecha_inicio')
                                ->map(function ($estado) {
                                    $isActivo   = $estado->activo;
                                    $label      = $isActivo ? '🟢 Disponible' : '🔴 No disponible';
                                    $fecha      = optional($estado->fecha_inicio)?->format('d/m/Y H:i') ?? '—';
                                    $motivo     = e($estado->motivo ?? 'Sin motivo');
                                    $badgeBg    = $isActivo ? '#dcfce7' : '#fee2e2';
                                    $badgeColor = $isActivo ? '#16a34a' : '#dc2626';
                                    $borderColor = $isActivo ? '#bbf7d0' : '#fecaca';

                                    $archivoHtml = '';
                                    if ($estado->archivo) {
                                        $url = asset('storage/' . $estado->archivo);
                                        $archivoHtml = "
                                            <a href='{$url}' target='_blank' 
                                               style='display:inline-flex;align-items:center;gap:5px;margin-top:6px;
                                                      padding:4px 10px;background:#eff6ff;color:#2563eb;
                                                      border:1px solid #bfdbfe;border-radius:6px;
                                                      font-size:12px;font-weight:600;text-decoration:none;'>
                                                📎 Ver evidencia
                                            </a>";
                                    }

                                    return "
                                        <div style='margin-bottom:10px;padding:12px 14px;
                                                    border:1px solid {$borderColor};border-radius:10px;
                                                    background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.06);'>
                                            <div style='display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;'>
                                                <span style='font-size:13px;font-weight:700;
                                                             background:{$badgeBg};color:{$badgeColor};
                                                             padding:2px 10px;border-radius:999px;'>
                                                    {$label}
                                                </span>
                                                <span style='font-size:11px;color:#6b7280;'>🕐 {$fecha}</span>
                                            </div>
                                            <p style='margin:4px 0 0;font-size:13px;color:#374151;'>{$motivo}</p>
                                            {$archivoHtml}
                                        </div>";
                                })
                                ->implode('');
                        })
                        ->html()
                        ->columnSpanFull(),
                ])
                ->collapsible()
                ->collapsed(false),

            Section::make('Historial de Vehículos')
                ->icon('heroicon-o-queue-list')
                ->schema([
                    TextEntry::make('asignacionesVehiculo.vehiculo.placa')
                        ->label('Vehículos anteriores')
                        ->placeholder('Sin historial')
                        ->badge()
                        ->color('gray')
                        ->separator(','),
                ])
                ->collapsible()
                ->collapsed()
                ->compact(),
        ]);
    }

    protected function canCreate(): bool
    {
        return false;
    }
}