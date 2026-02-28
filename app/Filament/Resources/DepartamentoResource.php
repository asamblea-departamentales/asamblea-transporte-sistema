<?php
namespace App\Filament\Resources;

use App\Filament\Resources\DepartamentoResource\Pages;
use App\Models\Departamento;
use App\Models\Pais;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class DepartamentoResource extends Resource
{
    protected static ?string $model = Departamento::class;
    protected static ?string $navigationGroup = 'Catálogos Globales';
    protected static ?string $navigationLabel = 'Departamentos';
    protected static ?string $navigationIcon  = 'heroicon-o-map';
    protected static ?int    $navigationSort  = 4;

    public static function canViewAny(): bool  { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canCreate(): bool   { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canEdit($r): bool   { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canDelete($r): bool { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'jefe']); }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Información del Departamento')->schema([
                Forms\Components\Select::make('pais_id')
                    ->label('País')
                    ->options(Pais::where('activo', true)->pluck('nombre', 'id'))
                    ->searchable()->required(),
                Forms\Components\TextInput::make('nombre')
                    ->label('Nombre')->required()->maxLength(100),
                Forms\Components\Toggle::make('activo')
                    ->label('Activo')->default(true),
            ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('nombre')
            ->columns([
                Tables\Columns\TextColumn::make('nombre')
                    ->label('Departamento')->searchable()->sortable()->weight('bold'),
                Tables\Columns\TextColumn::make('pais.nombre')
                    ->label('País')->searchable()->sortable()->badge()->color('gray'),
                Tables\Columns\TextColumn::make('municipios_count')
                    ->label('Municipios')->counts('municipios')->badge()->color('info'),
                Tables\Columns\IconColumn::make('activo')->label('Activo')->boolean(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('pais_id')
                    ->label('País')
                    ->options(Pais::pluck('nombre', 'id')),
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
            'index'  => Pages\ListDepartamentos::route('/'),
            'create' => Pages\CreateDepartamento::route('/create'),
            'edit'   => Pages\EditDepartamento::route('/{record}/edit'),
        ];
    }
}