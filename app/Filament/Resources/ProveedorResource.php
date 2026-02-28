<?php
namespace App\Filament\Resources;

use App\Filament\Resources\ProveedorResource\Pages;
use App\Models\Proveedor;
use App\Models\Municipio;
use App\Models\Departamento;
use App\Models\ActividadEconomica;
use App\Models\TamanoProveedor;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ProveedorResource extends Resource
{
    protected static ?string $model = Proveedor::class;
    protected static ?string $navigationGroup = 'Catálogos Globales';
    protected static ?string $navigationLabel = 'Proveedores';
    protected static ?string $navigationIcon  = 'heroicon-o-building-storefront';
    protected static ?int    $navigationSort  = 9;

    public static function canViewAny(): bool  { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canCreate(): bool   { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canEdit($r): bool   { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canDelete($r): bool { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'jefe']); }

    public static function form(Form $form): Form
{
    return $form->schema([
        Forms\Components\Grid::make(3)->schema([
            // COLUMNA PRINCIPAL (Izquierda)
            Forms\Components\Group::make()->columnSpan(2)->schema([
                Forms\Components\Section::make('Identificación de Negocio')
                    ->icon('heroicon-o-identification')
                    ->schema([
                        Forms\Components\TextInput::make('nombre_comercial')
                            ->label('Nombre Comercial')
                            ->required()
                            ->columnSpanFull()
                            ->prefixIcon('heroicon-m-shopping-bag'),
                        Forms\Components\TextInput::make('nombre')
                            ->label('Razón Social / Nombres')
                            ->required(),
                        Forms\Components\TextInput::make('apellido')
                            ->label('Representante / Apellidos'),
                    ])->columns(2),

                Forms\Components\Section::make('Ubicación y Contacto')
                    ->icon('heroicon-o-map-pin')
                    ->schema([
                        Forms\Components\Select::make('departamento_id')
                            ->relationship('municipio.departamento', 'nombre')
                            ->live()
                            ->afterStateUpdated(fn ($set) => $set('municipio_id', null))
                            ->required(),
                        Forms\Components\Select::make('municipio_id')
                            ->options(fn ($get) => Municipio::where('departamento_id', $get('departamento_id'))->pluck('nombre', 'id'))
                            ->searchable()
                            ->required(),
                        Forms\Components\Textarea::make('direccion')
                            ->label('Dirección Exacta')
                            ->columnSpanFull()
                            ->rows(2),
                    ])->columns(2),
            ]),

            // SIDEBAR (Derecha)
            Forms\Components\Group::make()->columnSpan(1)->schema([
                Forms\Components\Section::make('Estatus y Tipo')
                    ->schema([
                       Forms\Components\Toggle::make('activo')
                            ->onColor('success') // El color cuando está activo
                            ->offColor('danger') // (Opcional) El color cuando está apagado
                            ->onIcon('heroicon-m-check')
                            ->offIcon('heroicon-m-x-mark'),
                        Forms\Components\Select::make('tipo_persona')
                            ->options([1 => 'Natural', 2 => 'Jurídica'])
                            ->required()
                            ->native(false),
                    ]),

                Forms\Components\Section::make('Clasificación')
                    ->schema([
                        Forms\Components\Select::make('actividad_economica_id')
                            ->relationship('actividadEconomica', 'nombre')
                            ->required()
                            ->searchable(),
                        Forms\Components\Select::make('tamano_proveedor_id')
                            ->relationship('tamanoProveedor', 'nombre')
                            ->searchable(),
                    ]),
                
                Forms\Components\Section::make('Documentación Fiscal')
                    ->collapsed() // Viene cerrado para no distraer
                    ->schema([
                        Forms\Components\TextInput::make('nit')->label('NIT')->mask('0000-000000-000-0'),
                        Forms\Components\TextInput::make('nrc')->label('NRC'),
                        Forms\Components\TextInput::make('dui')->label('DUI')->mask('00000000-0'),
                    ]),
            ]),
        ]),
    ]);
}

    public static function table(Table $table): Table
{
    return $table
        ->columns([
            Tables\Columns\TextColumn::make('nombre_comercial')
                ->label('Proveedor')
                ->searchable()
                ->sortable()
                ->weight('bold')
                ->size('lg')
                ->description(fn ($record) => "RS: " . $record->nombre),

            Tables\Columns\TextColumn::make('nit')
                ->label('ID Fiscal')
                ->copyable() // Permite copiar el NIT con un click
                ->fontFamily('mono')
                ->description(fn ($record) => "NRC: " . ($record->nrc ?? 'N/A')),

            Tables\Columns\TextColumn::make('actividadEconomica.nombre')
                ->label('Actividad')
                ->icon('heroicon-m-briefcase')
                ->badge()
                ->color('info'),

            Tables\Columns\TextColumn::make('tipo_persona')
                ->label('Personería')
                ->formatStateUsing(fn ($state) => $state === 1 ? 'Persona Natural' : 'Persona Jurídica')
                ->color(fn ($state) => $state === 1 ? 'warning' : 'success')
                ->icon(fn ($state) => $state === 1 ? 'heroicon-m-user' : 'heroicon-m-building-office-2'),

            Tables\Columns\ToggleColumn::make('activo') // Permite activar/desactivar desde la lista
                ->label('Estado'),
        ])
        ->filters([
            Tables\Filters\SelectFilter::make('departamento_id')
                ->label('Departamento')
                ->relationship('municipio.departamento', 'nombre'),
            Tables\Filters\TernaryFilter::make('activo')->label('Solo Activos'),
        ])
        ->actions([
            Tables\Actions\ActionGroup::make([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
        ]);
}

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListProveedors::route('/'),
            'create' => Pages\CreateProveedor::route('/create'),
            'edit'   => Pages\EditProveedor::route('/{record}/edit'),
        ];
    }
}