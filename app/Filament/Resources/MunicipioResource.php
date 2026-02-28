<?php
namespace App\Filament\Resources;

use App\Filament\Resources\MunicipioResource\Pages;
use App\Models\Municipio;
use App\Models\Departamento;
use App\Models\Pais;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class MunicipioResource extends Resource
{
    protected static ?string $model = Municipio::class;
    protected static ?string $navigationGroup = 'Catálogos Globales';
    protected static ?string $navigationLabel = 'Municipios';
    protected static ?string $navigationIcon  = 'heroicon-o-map-pin';
    protected static ?int    $navigationSort  = 5;

    public static function canViewAny(): bool  { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canCreate(): bool   { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canEdit($r): bool   { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canDelete($r): bool { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'jefe']); }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Información del Municipio')->schema([
                Forms\Components\Select::make('pais_id')
                    ->label('País')
                    ->options(Pais::where('activo', true)->pluck('nombre', 'id'))
                    ->live()
                    ->afterStateUpdated(fn ($set) => $set('departamento_id', null))
                    ->dehydrated(false)
                    ->required(),
                Forms\Components\Select::make('departamento_id')
                    ->label('Departamento')
                    ->options(fn ($get) =>
                        Departamento::where('pais_id', $get('pais_id'))
                            ->where('activo', true)
                            ->pluck('nombre', 'id')
                    )
                    ->searchable()
                    ->required()
                    ->live(),
                Forms\Components\TextInput::make('nombre')
                    ->label('Nombre')->required()->maxLength(100)->columnSpan(2),
                Forms\Components\Toggle::make('activo')
                    ->label('Activo')->default(true)->columnSpan(2),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('nombre')
            ->columns([
                Tables\Columns\TextColumn::make('nombre')
                    ->label('Municipio')->searchable()->sortable()->weight('bold'),
                Tables\Columns\TextColumn::make('departamento.nombre')
                    ->label('Departamento')->searchable()->sortable()->badge()->color('info'),
                Tables\Columns\TextColumn::make('departamento.pais.nombre')
                    ->label('País')->sortable()->badge()->color('gray'),
                Tables\Columns\IconColumn::make('activo')->label('Activo')->boolean(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('departamento_id')
                    ->label('Departamento')
                    ->options(Departamento::pluck('nombre', 'id'))
                    ->searchable(),
                Tables\Filters\TernaryFilter::make('activo')->label('Estado'),
            ])
            ->actions([
                Tables\Actions\EditAction::make()->button()->size('sm'),
                Tables\Actions\DeleteAction::make()->button()->size('sm'),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListMunicipios::route('/'),
            'create' => Pages\CreateMunicipio::route('/create'),
            'edit'   => Pages\EditMunicipio::route('/{record}/edit'),
        ];
    }
}