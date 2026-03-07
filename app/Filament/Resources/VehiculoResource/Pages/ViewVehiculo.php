<?php

namespace App\Filament\Resources\VehiculoResource\Pages;

use App\Filament\Resources\VehiculoResource;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\ImageEntry;
use Filament\Infolists\Infolist;
use Filament\Resources\Pages\ViewRecord;

class ViewVehiculo extends ViewRecord
{
    protected static string $resource = VehiculoResource::class;

    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([

            Section::make('Fotografía')
                ->schema([
                    ImageEntry::make('fotografia')
                        ->label('')
                        ->disk('public')
                        ->height(250)
                        ->columnSpanFull()
                        ->placeholder('Sin fotografía registrada'),
                ])
                ->collapsible()
                ->collapsed(false)
                ->compact(),

            Section::make('Información General')
                ->schema([
                    TextEntry::make('placa')
                        ->label('Placa')
                        ->weight('bold')
                        ->copyable(),

                    TextEntry::make('tipo.nombre')
                        ->label('Tipo de Vehículo')
                        ->badge()
                        ->color('info'),

                    TextEntry::make('marca.nombre')
                        ->label('Marca'),

                    TextEntry::make('modelo.nombre')
                        ->label('Modelo'),

                    TextEntry::make('anio')
                        ->label('Año'),

                    TextEntry::make('color.nombre')
                        ->label('Color'),

                    TextEntry::make('capacidad_personas')
                        ->label('Capacidad')
                        ->suffix(' personas'),

                    TextEntry::make('clasificacion.nombre')
                        ->label('Clasificación')
                        ->badge()
                        ->color('gray'),

                    TextEntry::make('estadoCatalogo.nombre')
                        ->label('Estado')
                        ->badge()
                        ->color(fn (?string $state): string => match ($state) {
                            'Disponible' => 'success',
                            'Ocupado'    => 'warning',
                            'En Taller'  => 'danger',
                            'Baja'       => 'gray',
                            default      => 'gray',
                        }),

                    IconEntry::make('activo')
                        ->label('Activo')
                        ->boolean(),
                ])
                ->columns([
                    'default' => 1,
                    'sm'      => 2,
                    'xl'      => 3,
                ])
                ->compact(),

            Section::make('Motor y Mecánica')
                ->schema([
                    TextEntry::make('tipoMotor.nombre')
                        ->label('Tipo de Motor'),

                    TextEntry::make('tipoCombustible.nombre')
                        ->label('Combustible')
                        ->badge()
                        ->color('warning'),

                    TextEntry::make('transmision.nombre')
                        ->label('Transmisión'),

                    TextEntry::make('traccion.nombre')
                        ->label('Tracción'),

                    TextEntry::make('tipoLlanta.nombre')
                        ->label('Tipo de Llanta'),

                    TextEntry::make('num_llantas')
                        ->label('Número de Llantas'),

                    TextEntry::make('motor_numero')
                        ->label('Número de Motor')
                        ->copyable(),
                ])
                ->columns([
                    'default' => 1,
                    'sm'      => 2,
                    'xl'      => 3,
                ])
                ->collapsible()
                ->compact(),
            Section::make('Equipamiento y Herramientas')
    ->icon('heroicon-o-wrench-screwdriver')
    ->schema([
        TextEntry::make('accesorios')
            ->label('Inventario actual')
            ->badge()
            ->color('success')
            ->separator(',')
            ->formatStateUsing(fn (string $state): string => match ($state) {
                'gato' => 'Gato Hidráulico',
                'llanta_repuesto' => 'Llanta de Repuesto',
                'triangulos' => 'Triángulos (2)',
                'extintor' => 'Extintor Vigente',
                'llave_cruz' => 'Llave de Cruz',
                'botiquin' => 'Botiquín',
                'cables_inicio' => 'Cables de Batería',
                'herramientas' => 'Kit de Herramientas',
                'chaleco' => 'Chaleco Reflectante',
                default => $state,
            })
            ->placeholder('No se registraron accesorios'),
    ])
    ->collapsible()
    ->compact(),

            Section::make('Identificación')
                ->schema([
                    TextEntry::make('chasis')
                        ->label('Número de Chasis')
                        ->copyable(),

                    TextEntry::make('vin')
                        ->label('VIN')
                        ->copyable(),

                    TextEntry::make('activo_fijo')
                        ->label('Código Activo Fijo')
                        ->copyable(),

                    TextEntry::make('vencimiento_tarjeta')
                        ->label('Vencimiento Tarjeta')
                        ->date('d/m/Y'),
                ])
                ->columns([
                    'default' => 1,
                    'sm'      => 2,
                ])
                ->collapsible()
                ->compact(),

            Section::make('Motorista Asignado')
                ->schema([
                    TextEntry::make('asignacionVigenteMotorista.motorista.nombre')
                        ->label('Nombre')
                        ->placeholder('Sin motorista asignado'),

                    TextEntry::make('asignacionVigenteMotorista.motorista.dui')
                        ->label('DUI')
                        ->placeholder('-'),

                    TextEntry::make('asignacionVigenteMotorista.motorista.telefono')
                        ->label('Teléfono')
                        ->placeholder('-'),

                    TextEntry::make('asignacionVigenteMotorista.desde')
                        ->label('Asignado desde')
                        ->dateTime('d/m/Y H:i')
                        ->placeholder('-'),
                ])
                ->columns([
                    'default' => 1,
                    'sm'      => 2,
                ])
                ->collapsible()
                ->compact(),

            Section::make('Observaciones')
                ->schema([
                    TextEntry::make('observacion')
                        ->label('')
                        ->placeholder('Sin observaciones')
                        ->columnSpanFull(),
                ])
                ->collapsible()
                ->collapsed()
                ->compact(),
        ]);
    }

    protected function canCreate(): bool { return false; }
}