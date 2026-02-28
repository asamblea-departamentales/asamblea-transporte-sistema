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
            Forms\Components\Section::make('Identificación')->schema([
                Forms\Components\TextInput::make('nombre_comercial')
                    ->label('Nombre Comercial')->required()->maxLength(300)->columnSpan(2),
                Forms\Components\TextInput::make('nombre')
                    ->label('Nombre / Razón Social')->required()->maxLength(300),
                Forms\Components\TextInput::make('apellido')
                    ->label('Apellido / Representante')->maxLength(300),
                Forms\Components\Select::make('tipo_persona')
                    ->label('Tipo de Personería')
                    ->options([1 => 'Natural', 2 => 'Jurídica'])
                    ->required()->default(2),
                Forms\Components\Toggle::make('activo')
                    ->label('Activo')->default(true),
            ])->columns(2),

            Forms\Components\Section::make('Datos Fiscales')->schema([
                Forms\Components\TextInput::make('nit')->label('NIT')->maxLength(100),
                Forms\Components\TextInput::make('nrc')->label('NRC')->maxLength(100),
                Forms\Components\TextInput::make('dui')->label('DUI')->maxLength(100),
            ])->columns(3),

            Forms\Components\Section::make('Clasificación')->schema([
                Forms\Components\Select::make('actividad_economica_id')
                    ->label('Actividad Económica')
                    ->options(ActividadEconomica::where('activo', true)->pluck('nombre', 'id'))
                    ->required(),
                Forms\Components\Select::make('tamano_proveedor_id')
                    ->label('Tamaño')
                    ->options(TamanoProveedor::where('activo', true)->pluck('nombre', 'id'))
                    ->nullable(),
            ])->columns(2),

            Forms\Components\Section::make('Ubicación')->schema([
                Forms\Components\Select::make('departamento_id')
                    ->label('Departamento')
                    ->options(Departamento::where('activo', true)->pluck('nombre', 'id'))
                    ->live()
                    ->afterStateUpdated(fn ($set) => $set('municipio_id', null))
                    ->dehydrated(false)
                    ->required(),
                Forms\Components\Select::make('municipio_id')
                    ->label('Municipio')
                    ->options(fn ($get) =>
                        Municipio::where('departamento_id', $get('departamento_id'))
                            ->where('activo', true)
                            ->pluck('nombre', 'id')
                    )
                    ->searchable()->required(),
                Forms\Components\Textarea::make('direccion')
                    ->label('Dirección')->maxLength(300)->columnSpan(2),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('nombre_comercial')
            ->columns([
                Tables\Columns\TextColumn::make('nombre_comercial')
                    ->label('Nombre Comercial')
                    ->searchable()->sortable()->weight('bold')
                    ->description(fn ($record) => $record->nombre),
                Tables\Columns\TextColumn::make('nit')
                    ->label('NIT')->searchable()->fontFamily('mono'),
                Tables\Columns\TextColumn::make('actividadEconomica.nombre')
                    ->label('Actividad')->badge()->color('info'),
                Tables\Columns\TextColumn::make('tamanoProveedor.nombre')
                    ->label('Tamaño')->badge()->color('gray'),
                Tables\Columns\TextColumn::make('municipio.nombre')
                    ->label('Municipio')->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('tipo_persona')
                    ->label('Tipo')
                    ->formatStateUsing(fn ($state) => $state === 1 ? 'Natural' : 'Jurídica')
                    ->badge()
                    ->color(fn ($state) => $state === 1 ? 'warning' : 'primary'),
                Tables\Columns\IconColumn::make('activo')->label('Activo')->boolean(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('actividad_economica_id')
                    ->label('Actividad Económica')
                    ->options(ActividadEconomica::pluck('nombre', 'id')),
                Tables\Filters\SelectFilter::make('tamano_proveedor_id')
                    ->label('Tamaño')
                    ->options(TamanoProveedor::pluck('nombre', 'id')),
                Tables\Filters\SelectFilter::make('tipo_persona')
                    ->label('Tipo')
                    ->options([1 => 'Natural', 2 => 'Jurídica']),
                Tables\Filters\TernaryFilter::make('activo')->label('Estado'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make()->button()->size('sm'),
                Tables\Actions\EditAction::make()->button()->size('sm'),
                Tables\Actions\DeleteAction::make()->button()->size('sm'),
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