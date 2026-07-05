<?php

// -----------------------------------------------------------------------------
// RECURSO PRINCIPAL PARA ROLES
// -----------------------------------------------------------------------------
// Administra los roles (puestos o perfiles) que existen en el sistema,
// como "admin", "jefe", "motorista", etc. Cada rol puede tener
// permisos específicos para acceder a diferentes partes del sistema.
// Permite ver, crear, editar y eliminar roles, y asignarles permisos.

namespace App\Filament\Resources;

use App\Filament\Resources\RoleResource\Pages;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Spatie\Permission\Models\Role;

class RoleResource extends Resource
{
    protected static ?string $model = Role::class;

    protected static ?string $navigationIcon = 'heroicon-o-shield-check';

    protected static ?string $navigationGroup = 'Administracion';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Roles';

    protected static ?string $slug = 'roles'; // 👈 Cambia la URL

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make()
                    ->schema([
                        Forms\Components\Grid::make()
                            ->schema([
                                Forms\Components\TextInput::make('name')
                                    ->label('Nombre')
                                    ->required()
                                    ->unique(ignoreRecord: true)
                                    ->maxLength(255),
                                Forms\Components\Select::make('guard_name')
                                    ->label('Guard')
                                    ->options([
                                        'web' => 'Web',
                                        'api' => 'API',
                                    ])
                                    ->default('web')
                                    ->required(),
                            ]),
                        Forms\Components\Section::make('Permisos')
                            ->schema([
                                Forms\Components\CheckboxList::make('permissions')
                                    ->relationship('permissions', 'name')
                                    ->columns(3)
                                    ->searchable()
                                    ->bulkToggleable(),
                            ])
                            ->collapsible(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Nombre')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('permissions_count')
                    ->counts('permissions')
                    ->label('# Permisos')
                    ->sortable()
                    ->badge(),
                Tables\Columns\TextColumn::make('users_count')
                    ->counts('users')
                    ->label('# Usuarios')
                    ->sortable()
                    ->badge(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Creado')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListRoles::route('/'),
            'create' => Pages\CreateRole::route('/create'),
            'edit' => Pages\EditRole::route('/{record}/edit'),
        ];
    }

    public static function canViewAny(): bool
    {
        return auth()->user()->can('view_any_role');
    }
}
