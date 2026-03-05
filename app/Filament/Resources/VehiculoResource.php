<?php

namespace App\Filament\Resources;

use Filament\Forms;
use App\Filament\Resources\VehiculoResource\Pages;
use App\Models\Vehiculo;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Tables\Columns\Layout\Split;
use Filament\Tables\Columns\Layout\Stack;
use Filament\Support\Enums\FontWeight;
use Filament\Tables\Columns\TextColumn\TextColumnSize;
use Illuminate\Database\Eloquent\Builder;

class VehiculoResource extends Resource
{
    protected static ?string $model = Vehiculo::class;
    protected static ?string $navigationGroup = 'Catálogos';
    protected static ?string $navigationLabel = 'Vehículos';
    protected static ?string $navigationIcon  = 'heroicon-o-truck';
    protected static ?int    $navigationSort  = 1;

    public static function canViewAny(): bool
    {
        return auth()->check() && auth()->user()->hasAnyRole(['admin', 'ti', 'jefe']);
    }

    public static function canCreate(): bool        { return auth()->user()->hasAnyRole(['admin', 'ti', 'jefe']); }
    public static function canEdit($record): bool   { return auth()->user()->hasAnyRole(['admin', 'ti', 'jefe']); }
    public static function canDelete($record): bool { return auth()->user()->hasAnyRole(['admin', 'jefe']); }

    public static function form(Form $form): Form
{
    return $form->schema([

        Forms\Components\Section::make('Identificación')
            ->icon('heroicon-o-identification')
            ->schema([
                Forms\Components\TextInput::make('placa')
                    ->label('Placa')
                    ->required()
                    ->maxLength(20)
                    ->unique(ignoreRecord: true)
                    ->extraInputAttributes(['class' => 'font-mono uppercase']),

                Forms\Components\Select::make('tipo_vehiculo_id')
                    ->label('Tipo de Vehículo')
                    ->relationship('tipo', 'nombre')
                    ->required()
                    ->searchable()
                    ->preload(),

                Forms\Components\Select::make('veh_estado_catalogo_id')
                    ->label('Estado')
                    ->relationship('estadoCatalogo', 'nombre')
                    ->required()
                    ->preload(),

                Forms\Components\Select::make('veh_clasificacion_id')
                    ->label('Clasificación')
                    ->relationship('clasificacion', 'nombre')
                    ->required()
                    ->preload(),

                Forms\Components\Toggle::make('activo')
                    ->label('Activo')
                    ->default(true),
            ])->columns(2),

        Forms\Components\Section::make('Marca y Modelo')
            ->icon('heroicon-o-tag')
            ->schema([
                Forms\Components\Select::make('veh_marca_id')
                    ->label('Marca')
                    ->relationship('marca', 'nombre')
                    ->required()
                    ->searchable()
                    ->preload()
                    ->live()
                    ->afterStateUpdated(fn (callable $set) => $set('veh_modelo_id', null)),

                Forms\Components\Select::make('veh_modelo_id')
                    ->label('Modelo')
                    ->required()
                    ->searchable()
                    ->preload()
                    ->options(function (callable $get) {
                        $marcaId = $get('veh_marca_id');
                        if (!$marcaId) return [];
                        return \App\Models\VehModelo::where('veh_marca_id', $marcaId)
                            ->where('activo', true)
                            ->pluck('nombre', 'id');
                    }),

                Forms\Components\TextInput::make('anio')
                    ->label('Año')
                    ->required()
                    ->numeric()
                    ->minValue(1990)
                    ->maxValue(now()->year + 1),

                Forms\Components\Select::make('veh_color_id')
                    ->label('Color')
                    ->relationship('color', 'nombre')
                    ->required()
                    ->searchable()
                    ->preload(),

                Forms\Components\TextInput::make('capacidad_personas')
                    ->label('Capacidad (personas)')
                    ->required()
                    ->numeric()
                    ->minValue(1),
            ])->columns(2),

        Forms\Components\Section::make('Datos Técnicos')
            ->icon('heroicon-o-cog-6-tooth')
            ->schema([
                Forms\Components\Select::make('veh_tipo_motor_id')
                    ->label('Tipo de Motor')
                    ->relationship('tipoMotor', 'nombre')
                    ->searchable()
                    ->preload(),

                Forms\Components\Select::make('veh_tipo_combustible_id')
                    ->label('Combustible')
                    ->relationship('tipoCombustible', 'nombre')
                    ->searchable()
                    ->preload(),

                Forms\Components\Select::make('veh_transmision_id')
                    ->label('Transmisión')
                    ->relationship('transmision', 'nombre')
                    ->searchable()
                    ->preload(),

                Forms\Components\Select::make('veh_traccion_id')
                    ->label('Tracción')
                    ->relationship('traccion', 'nombre')
                    ->searchable()
                    ->preload(),

                Forms\Components\Select::make('veh_tipo_llanta_id')
                    ->label('Tipo de Llanta')
                    ->relationship('tipoLlanta', 'nombre')
                    ->searchable()
                    ->preload(),

                Forms\Components\TextInput::make('num_llantas')
                    ->label('Número de Llantas')
                    ->numeric()
                    ->minValue(2),
            ])->columns(2),

        Forms\Components\Section::make('Datos Registrales')
            ->icon('heroicon-o-document-text')
            ->schema([
                Forms\Components\TextInput::make('chasis')
                    ->label('Chasis')
                    ->maxLength(100),

                Forms\Components\TextInput::make('vin')
                    ->label('VIN')
                    ->maxLength(100),

                Forms\Components\TextInput::make('motor_numero')
                    ->label('Número de Motor')
                    ->maxLength(100),

                Forms\Components\TextInput::make('activo_fijo')
                    ->label('Activo Fijo')
                    ->maxLength(100),

                Forms\Components\DatePicker::make('vencimiento_tarjeta')
                    ->label('Vencimiento Tarjeta de Circulación'),
            ])->columns(2),


            //Para las herramientas
            Forms\Components\Section::make('Equipamiento y Herramientas')
    ->icon('heroicon-o-wrench-screwdriver')
    ->description('Marque los elementos que se encuentran físicamente en el vehículo')
    ->collapsible()
    ->schema([
        Forms\Components\CheckboxList::make('accesorios')
            ->label('') // Quitamos el label para que use el del Section
            ->options([
                'gato' => 'Gato Hidráulico',
                'llanta_repuesto' => 'Llanta de Repuesto',
                'triangulos' => 'Triángulos (2)',
                'extintor' => 'Extintor Vigente',
                'llave_cruz' => 'Llave de Cruz',
                'botiquin' => 'Botiquín',
                'cables_inicio' => 'Cables de Batería',
                'herramientas' => 'Kit de Herramientas',
                'chaleco' => 'Chaleco Reflectante',
            ])
            ->columns(3) // Se organiza en 3 columnas para ahorrar espacio
            ->bulkToggleable() // Botón para marcar/desmarcar todo rápido
            ->gridDirection('column'),
    ]),

        Forms\Components\Section::make('Fotografía y Observaciones')
            ->icon('heroicon-o-camera')
            ->schema([
                Forms\Components\FileUpload::make('fotografia')
                    ->label('Fotografía')
                    ->image()
                    ->disk('public')
                    ->directory('vehiculos')
                    ->imageResizeMode('cover')
                    ->imageCropAspectRatio('16:9')
                    ->maxSize(5120)
                    ->columnSpanFull(),

                Forms\Components\Textarea::make('observacion')
                    ->label('Observaciones')
                    ->rows(3)
                    ->maxLength(1000)
                    ->columnSpanFull(),
            ]),

            

    ]);
}

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('placa', 'asc')
            ->recordUrl(fn (Vehiculo $record) => static::getUrl('view', ['record' => $record]))
            ->contentGrid([
                'sm'  => 1,
                'md'  => 2,
                'xl'  => 3,
                '2xl' => 4,
            ])
            ->columns([
                Stack::make([
                    // Imagen tipo marketplace
                    Tables\Columns\ImageColumn::make('fotografia')
                        ->label('')
                        ->disk('public')
                        ->height(180)
                        ->width(220)
                        ->extraImgAttributes([
                            'class' => 'object-contain mx-auto rounded-t-xl',
                        ])
                        ->extraAttributes([
                            'class' => 'flex justify-center items-center w-full bg-gray-50 dark:bg-gray-900',
                        ])
                        ->grow(false)
                        ->defaultImageUrl(url('/images/icons/icon-96x96.png')),

                    // Contenido tipo producto
                    Stack::make([

                        // Marca + Modelo (título principal)
                        Tables\Columns\TextColumn::make('vehiculo_titulo')
                            ->weight(FontWeight::Bold)
                            ->size(TextColumnSize::Large)
                            ->getStateUsing(fn (Vehiculo $record) =>
                                collect([$record->marca?->nombre, $record->modelo?->nombre])
                                    ->filter()->join(' ')
                            ),

                        // Tipo + Año (subtítulo)
                        Tables\Columns\TextColumn::make('vehiculo_sub')
                            ->color('gray')
                            ->size(TextColumnSize::Small)
                            ->getStateUsing(fn (Vehiculo $record) =>
                                collect([$record->tipo?->nombre, $record->anio])
                                    ->filter()->join(' • ')
                            ),

                        // Placa + Estado
                        Split::make([
                            Tables\Columns\TextColumn::make('placa')
                                ->badge()
                                ->color('gray')
                                ->fontFamily('mono')
                                ->weight(FontWeight::Bold)
                                ->copyable()
                                ->searchable()
                                ->sortable()
                                ->grow(false),

                            Tables\Columns\TextColumn::make('estadoCatalogo.nombre')
                                ->badge()
                                ->grow(false)
                                ->icon(fn (?string $state): string => match ($state) {
                                    'Disponible' => 'heroicon-o-check-circle',
                                    'Reservado'  => 'heroicon-o-clock',
                                    'En Taller'  => 'heroicon-o-wrench-screwdriver',
                                    'Baja'       => 'heroicon-o-minus-circle',
                                    default      => 'heroicon-o-information-circle',
                                })
                                ->color(fn (?string $state): string => match ($state) {
                                    'Disponible' => 'success',
                                    'Reservado'  => 'info',
                                    'En Taller'  => 'danger',
                                    'Baja'       => 'gray',
                                    default      => 'gray',
                                }),
                        ]),

                        // Color + Capacidad
                        Split::make([
                            Tables\Columns\TextColumn::make('color.nombre')
                                ->badge()
                                ->color('gray')
                                ->icon('heroicon-o-paint-brush')
                                ->size(TextColumnSize::Small)
                                ->grow(false),

                            Tables\Columns\TextColumn::make('capacidad_personas')
                                ->badge()
                                ->color('info')
                                ->icon('heroicon-o-users')
                                ->formatStateUsing(fn ($state) => $state ? "{$state} personas" : null)
                                ->size(TextColumnSize::Small)
                                ->grow(false),

                            Tables\Columns\TextColumn::make('accesorios')
                                ->label('Equipo tangible')
                                ->formatStateUsing(fn ($state) => count($state ?? []) . ' herramientas')    
                                ->badge()
                                ->color('success')
                                ->icon('heroicon-o-briefcase')
                                ->size(TextColumnSize::Small),
                        ]),

                        // Motorista
                        Tables\Columns\TextColumn::make('asignacionVigenteMotorista.motorista.nombre')
                            ->icon('heroicon-o-user')
                            ->color('gray')
                            ->size(TextColumnSize::Small)
                            ->placeholder('Sin conductor')
                            ->searchable(),

                    ])->space(2)->extraAttributes(['class' => 'p-4 space-y-2']),

                ])->extraAttributes([
                    'class' => 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 
                                dark:border-gray-700 shadow-md hover:shadow-xl 
                                hover:-translate-y-1 transition-all duration-300 
                                cursor-pointer overflow-hidden h-full flex flex-col',
                ]),

                // ── Columnas ocultas para búsqueda/filtros ──
                Tables\Columns\TextColumn::make('tipo.nombre')
                    ->label('Tipo')->badge()->color('info')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('marca.nombre')
                    ->label('Marca')->searchable()->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('modelo.nombre')
                    ->label('Modelo')->searchable()->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('anio')
                    ->label('Año')->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('color.nombre')
                    ->label('Color')->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('capacidad_personas')
                    ->label('Capacidad')->suffix(' personas')->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('tipoCombustible.nombre')
                    ->label('Combustible')->badge()->color('warning')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('clasificacion.nombre')
                    ->label('Clasificación')->badge()->color('gray')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\IconColumn::make('activo')
                    ->label('Activo')->boolean()->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('tipo_vehiculo_id')
                    ->label('Tipo')
                    ->relationship('tipo', 'nombre'),

                Tables\Filters\SelectFilter::make('veh_marca_id')
                    ->label('Marca')
                    ->relationship('marca', 'nombre'),

                Tables\Filters\SelectFilter::make('veh_estado_catalogo_id')
                    ->label('Estado')
                    ->relationship('estadoCatalogo', 'nombre'),

                Tables\Filters\TernaryFilter::make('activo')
                    ->label('Activo'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make()
                    ->label('Ver Ficha')
                    ->button()
                    ->size('sm')
                    ->color('primary')
                    ->icon('heroicon-o-eye'),

                Tables\Actions\EditAction::make()
                    ->button()
                    ->size('sm')
                    ->color('gray')
                    ->icon('heroicon-o-pencil'),    
            ])
            ->bulkActions([]);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->with([
                'tipo',
                'marca',
                'modelo',
                'color',
                'tipoCombustible',
                'clasificacion',
                'estadoCatalogo',
                'asignacionVigenteMotorista.motorista',
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListVehiculos::route('/'),
            'create' => Pages\CreateVehiculo::route('/create'),
            'edit'   => Pages\EditVehiculo::route('/{record}/edit'),
            'view'   => Pages\ViewVehiculo::route('/{record}'),
    ];
    }
}
