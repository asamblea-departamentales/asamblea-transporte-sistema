<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MotoristaResource\Pages;
use App\Models\Motorista;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class MotoristaResource extends Resource
{
    protected static ?string $model = Motorista::class;

    protected static ?string $navigationGroup = 'Flota';
    protected static ?string $navigationLabel = 'Motoristas';
    protected static ?string $navigationIcon  = 'heroicon-o-identification';
    protected static ?int    $navigationSort  = 2;

    public static function canViewAny(): bool
    {
        return auth()->user()->hasAnyRole(['admin', 'ti', 'jefe']);
    }

    public static function canCreate(): bool        { return auth()->user()->hasAnyRole(['admin', 'ti']); }
    public static function canEdit($record): bool   { return auth()->user()->hasAnyRole(['admin', 'ti']); }
    public static function canDelete($record): bool { return auth()->user()->hasAnyRole(['admin']); }

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

                    Forms\Components\TextInput::make('dui')
                        ->label('DUI')
                        ->required()
                        ->maxLength(10)
                        ->unique(ignoreRecord: true)
                        ->placeholder('00000000-0'),

                    Forms\Components\TextInput::make('telefono')
                        ->label('Teléfono')
                        ->maxLength(20)
                        ->placeholder('0000-0000'),

                    Forms\Components\Toggle::make('activo')
                        ->label('Activo')
                        ->default(true),
                ])->columns(2),

        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('nombre', 'asc')
            ->contentGrid([
                'default' => 1,
                'md'      => 2,
                'xl'      => 3,
            ])
            ->recordUrl(fn (Motorista $record) => static::getUrl('view', ['record' => $record]))
            ->columns([
                Tables\Columns\TextColumn::make('nombre')
                    ->label('Nombre')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),

                Tables\Columns\TextColumn::make('dui')
                    ->label('DUI')
                    ->searchable()
                    ->copyable()
                    ->fontFamily('mono'),

                Tables\Columns\TextColumn::make('telefono')
                    ->label('Teléfono')
                    ->placeholder('Sin teléfono'),

                Tables\Columns\TextColumn::make('asignacionVigenteVehiculo.vehiculo.placa')
                    ->label('Vehículo Asignado')
                    ->placeholder('Sin vehículo')
                    ->badge()
                    ->color('info'),

                Tables\Columns\IconColumn::make('activo')
                    ->label('Activo')
                    ->boolean()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('activo')
                    ->label('Activo'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make()->iconButton(),
                Tables\Actions\EditAction::make()->iconButton(),
            ])
            ->bulkActions([]);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->with([
                'asignacionVigenteVehiculo.vehiculo.tipo',
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListMotoristas::route('/'),
            'create' => Pages\CreateMotorista::route('/create'),
            'edit'   => Pages\EditMotorista::route('/{record}/edit'),
            'view'   => Pages\ViewMotorista::route('/{record}'),
        ];
    }
}