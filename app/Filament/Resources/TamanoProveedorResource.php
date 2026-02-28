<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TamanoProveedorResource\Pages;
use App\Models\TamanoProveedor;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class TamanoProveedorResource extends Resource
{
    protected static ?string $model = TamanoProveedor::class;
    protected static ?string $navigationGroup = 'Catálogos Globales';
    protected static ?string $navigationLabel = 'Tamaños de Proveedor';
    protected static ?string $navigationIcon  = 'heroicon-o-arrows-pointing-out';
    protected static ?int    $navigationSort  = 11;

    public static function canViewAny(): bool  { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canCreate(): bool   { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canEdit($r): bool   { return auth()->user()->hasAnyRole(['superadmin', 'admin', 'ti', 'jefe']); }
    public static function canDelete($r): bool { return auth()->user()->hasAnyRole(['superadmin', 'admin']); }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Información')
                ->icon('heroicon-o-arrows-pointing-out')
                ->schema([
                    Forms\Components\TextInput::make('nombre')
                        ->label('Nombre')
                        ->required()
                        ->maxLength(100)
                        ->placeholder('Ej: MEDIANO')
                        ->columnSpan(2),
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
            ->defaultSort('nombre')
            ->columns([
                Tables\Columns\TextColumn::make('nombre')
                    ->label('Tamaño')
                    ->searchable()->sortable()->weight('bold'),
                Tables\Columns\TextColumn::make('proveedores_count')
                    ->label('Proveedores')
                    ->counts('proveedores')
                    ->badge()->color('info'),
                Tables\Columns\IconColumn::make('activo')
                    ->label('Activo')->boolean()->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('activo')->label('Estado'),
            ])
            ->actions([
                Tables\Actions\EditAction::make()->button()->size('sm')->color('warning'),
                Tables\Actions\DeleteAction::make()->button()->size('sm')
                    ->before(function ($record, $action) {
                        if ($record->proveedores_count > 0) {
                            $action->cancel();
                            \Filament\Notifications\Notification::make()
                                ->title('No se puede eliminar')
                                ->body('Este tamaño tiene proveedores asignados.')
                                ->danger()->send();
                        }
                    }),
            ])
            ->bulkActions([]);
    }

    public static function getEloquentQuery(): \Illuminate\Database\Eloquent\Builder
    {
        return parent::getEloquentQuery()->withCount('proveedores');
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListTamanoProveedors::route('/'),
            'create' => Pages\CreateTamanoProveedor::route('/create'),
            'edit'   => Pages\EditTamanoProveedor::route('/{record}/edit'),
        ];
    }
}