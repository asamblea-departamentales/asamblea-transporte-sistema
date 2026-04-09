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
                ->schema([
                    TextEntry::make('nombre')
                        ->label('Nombre Completo')
                        ->weight('bold'),

                    TextEntry::make('dui')
                        ->label('DUI')
                        ->copyable(),

                    TextEntry::make('telefono')
                        ->label('Teléfono')
                        ->placeholder('Sin teléfono registrado'),

                    IconEntry::make('activo')
                        ->label('Estado')
                        ->boolean(),
                ])
                ->columns([
                    'default' => 1,
                    'sm' => 2,
                ])
                ->compact(),

            Section::make('Vehículo Asignado')
                ->schema([
                    TextEntry::make('asignacionVigenteVehiculo.vehiculo.placa')
                        ->label('Placa')
                        ->placeholder('Sin vehículo asignado')
                        ->badge()
                        ->color('info'),

                    TextEntry::make('asignacionVigenteVehiculo.vehiculo.tipo.nombre')
                        ->label('Tipo de Vehículo')
                        ->placeholder('-'),

                    TextEntry::make('asignacionVigenteVehiculo.vehiculo.marca.nombre')
                        ->label('Marca')
                        ->placeholder('-'),

                    TextEntry::make('asignacionVigenteVehiculo.vehiculo.modelo.nombre')
                        ->label('Modelo')
                        ->placeholder('-'),

                    TextEntry::make('asignacionVigenteVehiculo.desde')
                        ->label('Asignado desde')
                        ->dateTime('d/m/Y H:i')
                        ->placeholder('-'),
                ])
                ->columns([
                    'default' => 1,
                    'sm' => 2,
                ])
                ->collapsible()
                ->compact(),

            Section::make('Estado Actual')
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
                        ->dateTime('d/m/Y H:i'),

                    TextEntry::make('estadoActual.archivo')
                        ->label('Evidencia')
                        ->formatStateUsing(function ($state) {
                            if (empty($state)) {
                                return 'Sin evidencia';
                            }
                            $url = asset('storage/'.$state);
                            $ext = strtolower(pathinfo($state, PATHINFO_EXTENSION));
                            $imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

                            if (in_array($ext, $imageExts)) {
                                return "<a href='{$url}' target='_blank'><img src='{$url}' style='max-width:200px;max-height:150px;border-radius:8px;border:1px solid #e5e7eb;'></a>";
                            }

                            return "<a href='{$url}' target='_blank' style='display:inline-flex;align-items:center;gap:4px;padding:6px 12px;background:#fee2e2;color:#dc2626;border-radius:6px;font-weight:600;text-decoration:none;'>📄 Ver archivo PDF</a>";
                        })
                        ->html(),
                ])
                ->columns(2)
                ->compact(),

            Section::make('Historial de Estados')
                ->schema([
                    TextEntry::make('estados')
                        ->label('')
                        ->formatStateUsing(function ($state, $record) {
    if (!$record->estados || $record->estados->isEmpty()) {
        return 'Sin historial de estados';
    }

    return $record->estados->sortByDesc('fecha_inicio')
        ->map(function ($estado) {
            $label   = $estado->activo ? '🟢 Disponible' : '🔴 No disponible';
            $fecha   = optional($estado->fecha_inicio)?->format('d/m/Y H:i') ?? '-';
            $motivo  = $estado->motivo ?? 'Sin motivo';

            $archivoHtml = '';
            if ($estado->archivo) {
                $url = asset('storage/' . $estado->archivo);
                $archivoHtml = "<a href='{$url}' target='_blank' style='color:#2563eb;font-weight:600;'>📎 Ver Archivo</a>";
            }

            return "<div style='margin-bottom:12px;padding:10px;border:1px solid #e5e7eb;border-radius:8px'>
                        <strong>{$label}</strong><br>
                        <small>{$fecha}</small><br>
                        <span>{$motivo}</span><br>
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
                ->schema([
                    TextEntry::make('asignacionesVehiculo.vehiculo.placa')
                        ->label('Vehículos anteriores')
                        ->placeholder('Sin historial')
                        ->listWithLineBreaks()
                        ->limitList(5),
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
