<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DepartamentalResource\Pages;
use App\Models\Departamental;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class DepartamentalResource extends Resource
{
    protected static ?string $model = Departamental::class;

    protected static ?string $navigationIcon = 'heroicon-o-building-office';

    protected static ?string $navigationGroup = 'Gestión';

    protected static ?int $navigationSort = 4;

    protected static ?string $label = 'Departamental';

    protected static ?string $pluralLabel = 'Departamentales';

    // Solo TI
    public static function canViewAny(): bool
    {
        return auth()->user()?->hasAnyRole(['ti', 'superadmin', 'admin']) ?? false;
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('nombre')
                ->label('Nombre')->required()->maxLength(120)->unique(ignoreRecord: true),
            Forms\Components\TextInput::make('codigo')
                ->label('Código')->required()->maxLength(10)->unique(ignoreRecord: true),
            Forms\Components\Toggle::make('activo')->default(true),
        ])->columns(3);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('nombre')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('codigo')->sortable(),
                Tables\Columns\IconColumn::make('activo')->boolean(),
                Tables\Columns\TextColumn::make('users_count')
                    ->label('Usuarios')->counts('users')->sortable(),
                Tables\Columns\TextColumn::make('vehiculos_count')
                    ->label('Vehículos')->counts('vehiculos')->sortable()
                    ->badge()->color('info'),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->since()->label('Creado'),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('activo')->label('Activas'),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDepartamentals::route('/'),
            'create' => Pages\CreateDepartamental::route('/create'),
            'edit' => Pages\EditDepartamental::route('/{record}/edit'),
        ];
    }
}
