<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA MOTORISTAS
// -----------------------------------------------------------------------------
// Este recurso administra el catálogo de motoristas (conductores) de la
// institución. Aquí se registra su información personal (nombre, DUI,
// teléfono, licencia), se les asigna un tipo de licencia y se lleva un
// historial de sus estados (disponible o no disponible). Los usuarios
// autorizados pueden crear, editar y ver motoristas.

namespace App\Filament\Resources;

use App\Filament\Resources\MotoristaResource\Pages;
use App\Models\Motorista;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Storage;

class MotoristaResource extends Resource
{
    protected static ?string $model = Motorista::class;

    protected static ?string $navigationGroup = 'Catálogos';

    protected static ?string $navigationLabel = 'Motoristas';

    protected static ?string $navigationIcon = 'heroicon-o-identification';

    protected static ?int $navigationSort = 2;

    public static function canViewAny(): bool
    {
        return auth()->user()->hasAnyRole(['admin', 'ti', 'jefe', 'super_admin']);
    }

    public static function canCreate(): bool
    {
        return auth()->user()->hasAnyRole(['admin', 'ti', 'jefe', 'super_admin']);
    }

    public static function canEdit($record): bool
    {
        return auth()->user()->hasAnyRole(['admin', 'ti', 'jefe', 'super_admin']);
    }

    public static function canDelete($record): bool
    {
        return auth()->user()->hasAnyRole(['admin', 'jefe', 'super_admin']);
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Información Personal')
                ->icon('heroicon-o-user')
                ->schema([
                    Forms\Components\TextInput::make('nombre')
                        ->label('Nombre Completo')
                        ->required()
                        ->maxLength(200),

                    Forms\Components\TextInput::make('numero_empleado')
                        ->label('N° Empleado')
                        ->maxLength(50)
                        ->placeholder('Ej: 1078'),

                    Forms\Components\TextInput::make('dui')
                        ->label('DUI')
                        ->required()
                        ->mask('99999999-9') // Formato automático 00000000-0
                        ->placeholder('00000000-0')
                        ->unique(ignoreRecord: true),

                    Forms\Components\TextInput::make('telefono')
                        ->label('Teléfono')
                        ->maxLength(20)
                        ->mask('9999-9999') // También añadimos máscara al teléfono
                        ->placeholder('0000-0000'),

                    Forms\Components\TextInput::make('correo')
                        ->label('Correo Electrónico')
                        ->email()
                        ->maxLength(255)
                        ->placeholder('ejemplo@asamblea.gob.sv'),

                    Forms\Components\TextInput::make('radio')
                        ->label('Radio / Nexte;')
                        ->maxLength(100)
                        ->placeholder('Ej: 1025*315*98'),

                    Forms\Components\Toggle::make('activo')
                        ->label('Activo')
                        ->default(true),

                ])->columns(2),

            Forms\Components\Section::make('Historial de estados')
                ->description('Estados del motorista, incluyendo incapacidades y sus evidencias.')
                ->icon('heroicon-o-clock')
                ->schema([
                    Forms\Components\Repeater::make('historia_estados')
                        ->label('')
                        ->disabled()
                        ->dehydrated(false)
                        ->default(function ($record) {
                            if (! $record) {
                                return [];
                            }

                            return $record->estados()->orderByDesc('fecha_inicio')->get()
                                ->map(fn ($estado) => [
                                    'estado' => $estado->activo ? 'Disponible' : 'No Disponible',
                                    'motivo' => $estado->motivo,
                                    'fecha' => optional($estado->fecha_inicio)?->format('d/m/Y H:i'),
                                    'archivo' => $estado->archivo,
                                ])
                                ->toArray();
                        })

                        ->schema([
                            Forms\Components\TextInput::make('estado')
                                ->label('Estado')
                                ->disabled()
                                ->columnSpan(1),

                            Forms\Components\TextInput::make('motivo')
                                ->label('Motivo')
                                ->disabled()
                                ->columnSpan(2),

                            Forms\Components\TextInput::make('fecha')
                                ->label('Fecha de Inicio')
                                ->disabled()
                                ->columnSpan(1),

                            Forms\Components\Placeholder::make('archivo')
                                ->label('Evidencia Adjunta')
                                ->content(function ($get) {
                                    $archivo = $get('archivo');
                                    if (! $archivo) {
                                        return 'Sin evidencia adjunta';
                                    }

                                    $url = Storage::disk('public')->url($archivo);

                                    return new \Illuminate\Support\HtmlString(
                                        "<a href='{$url}' target='_blank' style='color: #2563; font-weight: bold;'>📎 Ver Archivo</a>"
                                    );
                                }),
                        ])
                        ->columns(3)
                        ->columnSpanFull(),
                ])
                ->collapsible()
                ->collapsed(false),

            Forms\Components\Section::make('Licencia de Conducir')
                ->icon('heroicon-o-identification')
                ->schema([
                    Forms\Components\Select::make('tipo_licencia_id')
                        ->label('Tipo de Licencia')
                        ->relationship('tipoLicencia', 'nombre')
                        ->searchable()
                        ->required(),

                    Forms\Components\TextInput::make('numero_licencia')
                        ->label('Número de Licencia')
                        ->maxLength(100)
                        ->placeholder('Ej: 0614-050962-012-9'),

                    Forms\Components\DatePicker::make('fecha_vencimiento_licencia')
                        ->label('Fecha de Vencimiento')
                        ->displayFormat('d/m/Y'),

                ])->columns(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('nombre', 'asc')
            ->contentGrid([
                'default' => 1,
                'md' => 2,
                'xl' => 3,
            ])
            ->recordUrl(fn (Motorista $record) => static::getUrl('view', ['record' => $record]))
            ->columns([
                Tables\Columns\Layout\Stack::make([
                    Tables\Columns\TextColumn::make('nombre')
                        ->label('Nombre')
                        ->searchable()
                        ->sortable()
                        ->weight('bold')
                        ->size('lg'),

                    Tables\Columns\TextColumn::make('dui')
                        ->label('DUI')
                        ->searchable()
                        ->copyable()
                        ->fontFamily('mono')
                        ->color('gray'),

                    Tables\Columns\TextColumn::make('telefono')
                        ->label('Teléfono')
                        ->placeholder('Sin teléfono')
                        ->icon('heroicon-m-phone')
                        ->color('gray'),

                    Tables\Columns\TextColumn::make('asignacionVigenteVehiculo.vehiculo.placa')
                        ->label('Vehículo Asignado')
                        ->placeholder('Sin vehículo')
                        ->badge()
                        ->color('info')
                        ->grow(false),

                    Tables\Columns\TextColumn::make('tipoLicencia.nombre')
                        ->label('Tipo Licencia')
                        ->placeholder('Sin licencia')
                        ->badge()
                        ->color('warning')
                        ->grow(false),

                    Tables\Columns\TextColumn::make('estadoActual.motivo')
                        ->label('Motivo Inactividad')
                        ->placeholder('-')
                        ->limit(30)
                        ->color('danger')
                        ->tooltip(fn (Motorista $record) => $record->estadoActual?->motivo),
                    Tables\Columns\IconColumn::make('activo')
                        ->label('Activo')
                        ->boolean()
                        ->sortable(),
                ])->space(3)->extraAttributes(['class' => 'p-4']),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('activo')
                    ->label('Activo'),
            ])
            ->actions([
                Tables\Actions\EditAction::make()
                    ->button()
                    ->size('sm')
                    ->color('warning')
                    ->icon('heroicon-o-pencil'),
                Tables\Actions\ViewAction::make()
                    ->button()
                    ->size('sm')
                    ->color('primary')
                    ->icon('heroicon-o-eye'),
            ])
            ->actionsAlignment('center')
            ->bulkActions([]);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->with([
                'asignacionVigenteVehiculo.vehiculo.tipo', 'estadoActual',
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListMotoristas::route('/'),
            'create' => Pages\CreateMotorista::route('/create'),
            'edit' => Pages\EditMotorista::route('/{record}/edit'),
            'view' => Pages\ViewMotorista::route('/{record}'),
        ];
    }
}
