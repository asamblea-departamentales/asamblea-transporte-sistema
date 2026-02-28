<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PrefijoEmpleadoResource\Pages;
use App\Models\PrefijoEmpleado;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PrefijoEmpleadoResource extends Resource
{
    protected static ?string $model = PrefijoEmpleado::class;
    protected static ?string $navigationGroup = 'Catálogos Globales';
    protected static ?string $navigationLabel = 'Prefijos de Empleado';
    protected static ?string $navigationIcon  = 'heroicon-o-tag';
    protected static ?int    $navigationSort  = 8;

    public static function canViewAny(): bool  { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canCreate(): bool   { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canEdit($r): bool   { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canDelete($r): bool { return auth()->user()->hasAnyRole(['superadmin', 'admin']); }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Información')
                ->icon('heroicon-o-tag')
                ->schema([
                    Forms\Components\TextInput::make('prefijo')
                        ->label('Prefijo')
                        ->required()
                        ->maxLength(20)
                        ->placeholder('Ej: EMP')
                        ->columnSpan(1),
                    Forms\Components\TextInput::make('descripcion')
                        ->label('Descripción')
                        ->maxLength(100)
                        ->placeholder('Ej: Empleado de planta')
                        ->columnSpan(1),
                    Forms\Components\Toggle::make('activo')
                        ->label('Activo')
                        ->default(true)
                        ->columnSpan(2),
                ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('prefijo')
            ->columns([
                Tables\Columns\TextColumn::make('prefijo')
                    ->label('Prefijo')
                    ->searchable()->sortable()
                    ->weight('bold')->fontFamily('mono')
                    ->badge()->color('primary'),
                Tables\Columns\TextColumn::make('descripcion')
                    ->label('Descripción')
                    ->searchable()->placeholder('—'),
                Tables\Columns\IconColumn::make('activo')
                    ->label('Activo')->boolean()->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('activo')->label('Estado'),
            ])
            ->actions([
                Tables\Actions\EditAction::make()->button()->size('sm')->color('warning'),
                Tables\Actions\DeleteAction::make()->button()->size('sm'),
            ])
            ->bulkActions([]);
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListPrefijoEmpleados::route('/'),
            'create' => Pages\CreatePrefijoEmpleado::route('/create'),
            'edit'   => Pages\EditPrefijoEmpleado::route('/{record}/edit'),
        ];
    }
}